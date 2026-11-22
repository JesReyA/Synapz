# API_CONTRACT.md — Synapz + Feyn

Contrato entre `frontend/web` (TypeScript) y `backend` (FastAPI + Pydantic v2) y esquema de datos en Supabase PostgreSQL.
Cualquier cambio se hace primero aquí, luego en `backend/app/schemas/` y en `frontend/web/src/types/`.

## 0. Convenciones

- Base URL: `VITE_API_BASE_URL` (por ejemplo `https://api.synapz.app`). Todas las rutas empiezan por `/api`.
- Auth: `Authorization: Bearer <JWT de Supabase>` en todas las rutas. El rol sale del JWT (`teacher` | `student`).
- JSON en `snake_case`. IDs `uuid` como `string`. Fechas ISO 8601 UTC como `string`.
- Cuerpo `application/json`, salvo los endpoints `multipart/form-data` indicados.
- Error uniforme:

```ts
export interface ApiError {
  code:
    | "VALIDATION_ERROR" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND"
    | "NO_TEACHER_MATERIAL" | "UNSUPPORTED_FILE" | "FILE_TOO_LARGE"
    | "AI_INVALID_OUTPUT" | "AI_UNAVAILABLE" | "INTERNAL";
  message: string;          // legible para el usuario, en español
  details?: Record<string, unknown>;
}
```
```python
class ApiError(BaseModel):
    code: Literal["VALIDATION_ERROR","UNAUTHORIZED","FORBIDDEN","NOT_FOUND","NO_TEACHER_MATERIAL",
                  "UNSUPPORTED_FILE","FILE_TOO_LARGE","AI_INVALID_OUTPUT","AI_UNAVAILABLE","INTERNAL"]
    message: str
    details: dict[str, Any] | None = None
```

Códigos HTTP: `400/422` validación, `401` sin sesión, `403` rol o aula incorrectos, `404`, `413` archivo grande, `502` salida de IA inválida, `503` IA no disponible.

Tipos compartidos:

```ts
export type Modality = "visual" | "reading" | "auditory";
export type Role = "teacher" | "student";
export interface Grounding { source_id: string; topic_id: string; quote: string; } // quote ≤ 200 caracteres
```
```python
Modality = Literal["visual", "reading", "auditory"]
class Grounding(BaseModel):
    source_id: UUID
    topic_id: UUID
    quote: str = Field(max_length=200)
```

---

## 1. Tablas de PostgreSQL (Supabase)

RLS activado en todas. `auth.users` lo gestiona Supabase.

### `profiles`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | = `auth.users.id` |
| `role` | text | `teacher` \| `student` |
| `full_name` | text | |
| `interests` | jsonb | `{ likes: string[], hobbies: string[], daily_activities: string[], aspirations: string[], preferred_modality: "visual"\|"reading"\|"auditory", improvement_areas: string[] }` |
| `onboarding_completed` | boolean | default false |
| `created_at` | timestamptz | |

### `classrooms`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `teacher_id` | uuid FK `profiles` | |
| `name`, `subject`, `grade_group` | text | |
| `invite_code` | text UNIQUE | 6 caracteres |
| `created_at` | timestamptz | |

### `classroom_members`
| Columna | Tipo | Notas |
|---|---|---|
| `classroom_id` | uuid FK | PK compuesta con `student_id` |
| `student_id` | uuid FK `profiles` | |
| `joined_at` | timestamptz | |
| `bonus_points` | int | default 0, otorgados por el profesor |

### `syllabus_topics`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `classroom_id` | uuid FK | |
| `title` | text | |
| `kind` | text | `cycle` \| `prerequisite` |
| `scheduled_date` | date | calendario editable |
| `status` | text | `pending` \| `taught` \| `review` |
| `position` | int | orden |
| `material_text` | text | texto extraído (PDF/PPTX/notas), base de la Regla de Oro |
| `material_files` | jsonb | `[{ id, storage_path, filename, mime, chars }]` |

### `student_diagnostics`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `student_id`, `classroom_id` | uuid FK | |
| `type` | text | `prior_knowledge` \| `mental_math` |
| `score` | numeric | 0–100 |
| `detail` | jsonb | por tema o por nivel (exactitud, tiempos) |
| `integrity_events` | jsonb | `[{ type: "visibilitychange"\|"blur"\|"copy"\|"screenshot_key", at: string }]` |
| `invalidated` | boolean | |
| `created_at` | timestamptz | |

### `reading_sessions`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `student_id`, `classroom_id`, `topic_id` | uuid FK | |
| `mode` | text | `comprehension` \| `cloze` |
| `text` | text | lectura generada |
| `questions` | jsonb | preguntas o huecos |
| `answers` | jsonb | respuestas del alumno |
| `audio_attempts` | jsonb | `[{ attempt, storage_path, score, errors, at }]` |
| `best_audio_score` | numeric | |
| `created_at` | timestamptz | |

### `math_game_scores`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `classroom_id`, `student_id` | uuid FK | |
| `game_id` | uuid | partida |
| `points` | int | |
| `correct`, `total` | int | |
| `duration_ms` | int | |
| `created_at` | timestamptz | **Realtime habilitado** (publicación `supabase_realtime`) |

### `feyn_sessions`
| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `student_id`, `classroom_id`, `topic_id` | uuid FK | |
| `messages` | jsonb | `[{ role: "student"\|"feyn", text, at, grounding? }]` |
| `struggles` | text[] | dificultades que indicó el alumno |
| `mastered` | boolean | |
| `coverage` | numeric | 0–1, conceptos clave cubiertos |
| `updated_at` | timestamptz | |

Tabla de apoyo no listada en el pedido original, necesaria para las lecciones adaptadas: se puede guardar en `student_diagnostics.detail` si se prefiere no crearla.
- `lesson_events` (`id`, `student_id`, `topic_id`, `modality`, `created_at`, `understood boolean`): para medir qué formato funciona en el reporte.

---

## 2. Endpoints

### 2.1 `POST /api/materials/upload`  (rol: `teacher`)
`multipart/form-data`: `file` (PDF o PPTX, máx. 20 MB), `topic_id` (uuid). Guarda el archivo en Storage, extrae el texto (`pypdf` / `python-pptx`) y lo añade a `syllabus_topics.material_text`.

```ts
export interface UploadMaterialResponse {
  material_id: string;
  topic_id: string;
  filename: string;
  mime: "application/pdf" | "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  extracted_chars: number;
  page_count: number;          // páginas o diapositivas
  preview: string;             // primeros 300 caracteres
  warnings: string[];          // p. ej. "Diapositivas 4 y 5 sin texto"
}
```
```python
class UploadMaterialResponse(BaseModel):
    material_id: UUID
    topic_id: UUID
    filename: str
    mime: str
    extracted_chars: int
    page_count: int
    preview: str = Field(max_length=300)
    warnings: list[str] = []
```
Errores: `UNSUPPORTED_FILE`, `FILE_TOO_LARGE` (413), `FORBIDDEN`, `NOT_FOUND`.

### 2.2 `POST /api/lessons/adapt`  (rol: `student`)
Genera la explicación de un tema con los gustos del alumno y la modalidad pedida. Usa solo `material_text` del tema.

```ts
export interface AdaptLessonRequest {
  classroom_id: string;
  topic_id: string;
  modality: Modality;
  previous_modality?: Modality;   // se llena al pulsar "Explicar de otra forma"
}
export interface LessonBlock {
  heading: string;
  body: string;                   // texto en markdown simple
  visual_description?: string;    // modalidad visual: qué dibujar o mostrar
}
export interface AdaptLessonResponse {
  topic_id: string;
  modality: Modality;
  title: string;
  blocks: LessonBlock[];
  narration_script?: string;      // modalidad auditiva
  mnemonic_song?: string;         // modalidad auditiva
  interests_used: string[];       // gustos que se usaron en los ejemplos
  grounding: Grounding[];         // mínimo 1
}
```
```python
class AdaptLessonRequest(BaseModel):
    classroom_id: UUID
    topic_id: UUID
    modality: Modality
    previous_modality: Modality | None = None

class LessonBlock(BaseModel):
    heading: str
    body: str
    visual_description: str | None = None

class AdaptLessonResponse(BaseModel):
    topic_id: UUID
    modality: Modality
    title: str
    blocks: list[LessonBlock] = Field(min_length=1)
    narration_script: str | None = None
    mnemonic_song: str | None = None
    interests_used: list[str]
    grounding: list[Grounding] = Field(min_length=1)
```
Errores: `NO_TEACHER_MATERIAL` (422), `AI_INVALID_OUTPUT` (502).

### 2.3 `POST /api/reading/generate`  (rol: `student`)

```ts
export type ReadingMode = "comprehension" | "cloze";
export interface GenerateReadingRequest {
  classroom_id: string;
  topic_id: string;
  mode: ReadingMode;
  difficulty?: 1 | 2 | 3 | 4 | 5;   // por defecto, el nivel del último diagnóstico
}
export interface ComprehensionQuestion {
  id: string;
  question: string;
  options: string[];                // 3 o 4 opciones
  correct_index: number;
}
export interface ClozeBlank {
  id: string;
  position: number;                 // índice de la palabra en `text`
  answer: string;
  options?: string[];
}
export interface GenerateReadingResponse {
  reading_session_id: string;
  mode: ReadingMode;
  title: string;
  text: string;                     // para el modo cloze, las palabras ocultas aparecen como "____"
  word_count: number;
  questions?: ComprehensionQuestion[];   // solo mode = "comprehension"
  blanks?: ClozeBlank[];                 // solo mode = "cloze"
  interests_used: string[];
  grounding: Grounding[];
}
```
```python
ReadingMode = Literal["comprehension", "cloze"]

class GenerateReadingRequest(BaseModel):
    classroom_id: UUID
    topic_id: UUID
    mode: ReadingMode
    difficulty: int | None = Field(default=None, ge=1, le=5)

class ComprehensionQuestion(BaseModel):
    id: str
    question: str
    options: list[str] = Field(min_length=3, max_length=4)
    correct_index: int

class ClozeBlank(BaseModel):
    id: str
    position: int
    answer: str
    options: list[str] | None = None

class GenerateReadingResponse(BaseModel):
    reading_session_id: UUID
    mode: ReadingMode
    title: str
    text: str
    word_count: int
    questions: list[ComprehensionQuestion] | None = None
    blanks: list[ClozeBlank] | None = None
    interests_used: list[str]
    grounding: list[Grounding]
```
Nota: `correct_index` y `answer` viajan al cliente porque la corrección de este modo es local. Si se quiere evitar que el alumno los lea, moverlos a un endpoint de verificación en Fase 2.

### 2.4 `POST /api/reading/evaluate-audio`  (rol: `student`)
`multipart/form-data`: `audio` (`audio/webm`, `audio/ogg`, `audio/mp4` o `audio/wav`; máx. 10 MB y 3 min), `reading_session_id` (uuid), `attempt` (int ≥ 1).

```ts
export type AudioErrorType = "omitted" | "mispronounced" | "inserted" | "punctuation";
export interface AudioError {
  type: AudioErrorType;
  word: string;
  expected?: string;
  position: number;               // índice de la palabra en el texto
  suggestion: string;
}
export interface EvaluateAudioResponse {
  reading_session_id: string;
  attempt: number;
  read_the_text: boolean;         // false si el audio no corresponde a la lectura
  score: number;                  // 0-100
  diction_score: number;          // 0-100
  punctuation_score: number;      // 0-100
  completeness: number;           // 0-1, proporción del texto leída
  errors: AudioError[];
  feedback: string;               // consejo breve de Feyn
  best_score: number;
  improved: boolean;              // frente al mejor intento previo
}
```
```python
AudioErrorType = Literal["omitted", "mispronounced", "inserted", "punctuation"]

class AudioError(BaseModel):
    type: AudioErrorType
    word: str
    expected: str | None = None
    position: int
    suggestion: str

class EvaluateAudioResponse(BaseModel):
    reading_session_id: UUID
    attempt: int
    read_the_text: bool
    score: float = Field(ge=0, le=100)
    diction_score: float = Field(ge=0, le=100)
    punctuation_score: float = Field(ge=0, le=100)
    completeness: float = Field(ge=0, le=1)
    errors: list[AudioError]
    feedback: str
    best_score: float
    improved: bool
```

### 2.5 `POST /api/feyn/chat`  (rol: `student`)
Un turno de la Técnica Feynman. El backend carga la sesión, el material del tema, y pide a Gemini que compare la explicación del alumno con los apuntes.

```ts
export interface FeynChatRequest {
  classroom_id: string;
  topic_id: string;
  session_id?: string;            // vacío en el primer turno
  message: string;                // máx. 2000 caracteres
  struggles?: string[];           // lo que el alumno dice que se le dificulta
}
export type FeynIntent =
  | "ask_to_explain"     // pide que explique el tema
  | "feigned_doubt"      // finge no entender una parte
  | "guiding_question"   // pregunta guía
  | "mastered"           // dominio demostrado
  | "off_topic";         // fuera del temario
export interface FeynChatResponse {
  session_id: string;
  reply: string;
  intent: FeynIntent;
  covered_concepts: string[];
  missing_concepts: string[];
  coverage: number;               // 0-1
  mastered: boolean;
  grounding: Grounding[];         // vacío solo si intent = "off_topic"
}
```
```python
FeynIntent = Literal["ask_to_explain","feigned_doubt","guiding_question","mastered","off_topic"]

class FeynChatRequest(BaseModel):
    classroom_id: UUID
    topic_id: UUID
    session_id: UUID | None = None
    message: str = Field(max_length=2000)
    struggles: list[str] | None = None

class FeynChatResponse(BaseModel):
    session_id: UUID
    reply: str
    intent: FeynIntent
    covered_concepts: list[str]
    missing_concepts: list[str]
    coverage: float = Field(ge=0, le=1)
    mastered: bool
    grounding: list[Grounding]
```
`mastered` pasa a `true` cuando `coverage ≥ 0.85` y `missing_concepts` está vacío.

### 2.6 `POST /api/math/mental-test`  (rol: `student`)
Dos usos con el mismo endpoint, según `action`.

```ts
export type MathOperation = "addition";   // ampliable: "subtraction" | "multiplication" | "division"

export type MentalTestRequest =
  | { action: "start"; classroom_id: string; operation: MathOperation }
  | { action: "answer"; test_id: string; question_id: string; answer: number; response_ms: number }
  | { action: "finish"; test_id: string };

export interface MentalQuestion {
  id: string;
  level: number;                   // 1..N, la dificultad sube
  prompt: string;                  // "17 + 8"
  time_limit_ms: number;           // baja con el nivel
}
export interface MentalTestStartResponse {
  test_id: string;
  first_question: MentalQuestion;
}
export interface MentalTestAnswerResponse {
  correct: boolean;
  correct_answer: number;
  next_question: MentalQuestion | null;   // null al terminar
}
export interface MentalTestResult {
  test_id: string;
  score: number;                   // 0-100
  accuracy: number;                // 0-1
  avg_response_ms: number;
  max_level_reached: number;
  per_level: { level: number; correct: number; total: number; avg_ms: number }[];
  tips: string[];
  everyday_examples: string[];     // ejemplos cotidianos
}
```
```python
class MentalQuestion(BaseModel):
    id: str
    level: int
    prompt: str
    time_limit_ms: int

class MentalTestResult(BaseModel):
    test_id: UUID
    score: float = Field(ge=0, le=100)
    accuracy: float = Field(ge=0, le=1)
    avg_response_ms: int
    max_level_reached: int
    per_level: list[LevelStat]
    tips: list[str]
    everyday_examples: list[str]
```
Respuestas: `start` → `MentalTestStartResponse`, `answer` → `MentalTestAnswerResponse`, `finish` → `MentalTestResult`. La corrección se hace en el servidor. Las preguntas se generan por reglas (sin IA). Gemini solo redacta `tips` y `everyday_examples`.

### 2.7 `GET /api/math/quick-game`  (rol: `student`)
Query: `classroom_id` (uuid), `count` (int, por defecto 20, máx. 50).

```ts
export interface QuickGameQuestion {
  id: string;
  prompt: string;
  options: [string, string];       // exactamente 2 opciones
  source: "basic_operation" | "class_topic";
}
export interface QuickGameResponse {
  game_id: string;
  duration_seconds: number;        // reloj de la partida
  questions: QuickGameQuestion[];
}
export interface SubmitQuickGameRequest {      // POST /api/math/quick-game/submit
  game_id: string;
  answers: { question_id: string; choice_index: 0 | 1; response_ms: number }[];
}
export interface SubmitQuickGameResponse {
  points: number;
  correct: number;
  total: number;
  rank: number;                    // posición actual en el aula
}
```
```python
class QuickGameQuestion(BaseModel):
    id: str
    prompt: str
    options: tuple[str, str]
    source: Literal["basic_operation", "class_topic"]

class QuickGameResponse(BaseModel):
    game_id: UUID
    duration_seconds: int
    questions: list[QuickGameQuestion]
```
Los puntos se calculan en el servidor al recibir `submit`. El servidor inserta en `math_game_scores`. El cliente recibe el ranking en vivo por Supabase Realtime, filtrando `classroom_id=eq.<id>`, y no por este endpoint.

### 2.8 `GET /api/reports/classroom/{id}`  (rol: `teacher`, dueño del aula)

```ts
export interface TopicPerformance {
  topic_id: string;
  title: string;
  avg_score: number;               // 0-100
  students_below_threshold: number;
  trend: { date: string; avg_score: number }[];
}
export interface InflectionPoint {
  strategy_id: string;
  applied_at: string;
  description: string;
  avg_before: number;
  avg_after: number;
  delta: number;                   // avg_after - avg_before
  topic_id?: string;
}
export interface ClassroomReport {
  classroom_id: string;
  generated_at: string;
  student_count: number;
  overall_avg: number;
  topics: TopicPerformance[];
  hardest_topics: TopicPerformance[];    // top 3 con menor promedio
  easiest_topics: TopicPerformance[];    // top 3 con mayor promedio
  at_risk_students: { student_id: string; full_name: string; reasons: string[] }[];
  recommendations: { topic_id: string; text: string }[];
  inflection_points: InflectionPoint[];
  integrity_flags: number;               // diagnósticos con eventos anti-trampa
}
```
```python
class TopicPerformance(BaseModel):
    topic_id: UUID
    title: str
    avg_score: float
    students_below_threshold: int
    trend: list[TrendPoint]

class InflectionPoint(BaseModel):
    strategy_id: UUID
    applied_at: datetime
    description: str
    avg_before: float
    avg_after: float
    delta: float
    topic_id: UUID | None = None

class ClassroomReport(BaseModel):
    classroom_id: UUID
    generated_at: datetime
    student_count: int
    overall_avg: float
    topics: list[TopicPerformance]
    hardest_topics: list[TopicPerformance]
    easiest_topics: list[TopicPerformance]
    at_risk_students: list[AtRiskStudent]
    recommendations: list[Recommendation]
    inflection_points: list[InflectionPoint]
    integrity_flags: int
```
Para registrar estrategias (punto de inflexión): `POST /api/reports/classroom/{id}/strategies` con `{ description: string; applied_at: string; topic_id?: string }` → `{ strategy_id: string }`. Requiere una tabla `strategies` (`id`, `classroom_id`, `topic_id`, `description`, `applied_at`).

### 2.9 `GET /api/reports/student/{id}`  (rol: `teacher` dueño del aula, o el propio `student`)
Query: `classroom_id` (uuid).

```ts
export interface StudentReport {
  student_id: string;
  classroom_id: string;
  full_name: string;
  generated_at: string;
  interests_summary: string[];
  diagnostics: {
    prior_knowledge_score: number | null;
    mental_math_score: number | null;
    gaps: { topic_id: string; title: string }[];       // temas previos con rezago
    invalidated_attempts: number;
  };
  topics: { topic_id: string; title: string; score: number; trend: { date: string; score: number }[] }[];
  reading: { sessions: number; avg_audio_score: number | null; best_audio_score: number | null };
  feyn: { sessions: number; mastered_topics: string[]; frequent_struggles: string[] };
  quick_game: { games: number; best_points: number; current_rank: number | null };
  inflection_points: InflectionPoint[];
  recommendations: string[];
}
```
```python
class StudentReport(BaseModel):
    student_id: UUID
    classroom_id: UUID
    full_name: str
    generated_at: datetime
    interests_summary: list[str]
    diagnostics: StudentDiagnosticsSummary
    topics: list[StudentTopicScore]
    reading: ReadingSummary
    feyn: FeynSummary
    quick_game: QuickGameSummary
    inflection_points: list[InflectionPoint]
    recommendations: list[str]
```

---

## 3. Acceso directo desde el frontend a Supabase (sin pasar por FastAPI)

| Operación | Tabla | Notas |
|---|---|---|
| Registro e inicio de sesión | `auth` | |
| Leer/editar perfil e intereses | `profiles` | RLS: solo el propio usuario |
| Crear aula y regenerar código | `classrooms` | RLS: solo `teacher` dueño |
| Unirse con código | RPC `join_classroom(code text)` | Función SQL `security definer` |
| CRUD de temas y calendario | `syllabus_topics` | RLS: solo `teacher` dueño. `material_text` solo lo escribe el backend |
| Ranking en vivo | `math_game_scores` | Suscripción Realtime `postgres_changes` con filtro por aula |

El anti-trampa se envía con la entrega del diagnóstico. Endpoint pendiente de definir: `POST /api/diagnostics/prior-knowledge/submit` con `{ diagnostic_id, answers, integrity_events }`.

## 4. Pendientes del contrato
1. Endpoints de diagnóstico de conocimientos previos (generar y entregar) y de verificación del modo cloze.
2. Tabla `strategies` y migraciones SQL en `supabase/migrations/`.
3. Límite de uso (rate limit) por usuario para los endpoints con Gemini.
