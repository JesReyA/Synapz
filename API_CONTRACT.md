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
    | "VALIDATION_ERROR"
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "NO_TEACHER_MATERIAL"
    | "UNSUPPORTED_FILE"
    | "FILE_TOO_LARGE"
    | "AI_INVALID_OUTPUT"
    | "AI_UNAVAILABLE"
    | "INTERNAL";
  message: string; // legible para el usuario, en español
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
export interface Grounding {
  source_id: string;
  topic_id: string;
  quote: string;
} // quote ≤ 200 caracteres
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

| Columna                | Tipo        | Notas                                                                                                                                                                         |
| ---------------------- | ----------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                   | uuid PK     | = `auth.users.id`                                                                                                                                                             |
| `role`                 | text        | `teacher` \| `student`                                                                                                                                                        |
| `full_name`            | text        |                                                                                                                                                                               |
| `interests`            | jsonb       | `{ likes: string[], hobbies: string[], daily_activities: string[], aspirations: string[], preferred_modality: "visual"\|"reading"\|"auditory", improvement_areas: string[] }` |
| `onboarding_completed` | boolean     | default false                                                                                                                                                                 |
| `created_at`           | timestamptz |                                                                                                                                                                               |

### `classrooms`

| Columna                          | Tipo               | Notas                                                                            |
| -------------------------------- | ------------------ | -------------------------------------------------------------------------------- |
| `id`                             | uuid PK            |                                                                                  |
| `teacher_id`                     | uuid FK `profiles` |                                                                                  |
| `name`, `subject`, `grade_group` | text               |                                                                                  |
| `subject_area`                   | text               | `math` \| `reading` \| `science`. Agrupa los temas del aula en la vista Progreso |
| `invite_code`                    | text UNIQUE        | 6 caracteres                                                                     |
| `created_at`                     | timestamptz        |                                                                                  |

### `classroom_members`

| Columna        | Tipo               | Notas                                |
| -------------- | ------------------ | ------------------------------------ |
| `classroom_id` | uuid FK            | PK compuesta con `student_id`        |
| `student_id`   | uuid FK `profiles` |                                      |
| `joined_at`    | timestamptz        |                                      |
| `bonus_points` | int                | default 0, otorgados por el profesor |

### `syllabus_topics`

| Columna          | Tipo    | Notas                                                    |
| ---------------- | ------- | -------------------------------------------------------- |
| `id`             | uuid PK |                                                          |
| `classroom_id`   | uuid FK |                                                          |
| `title`          | text    |                                                          |
| `kind`           | text    | `cycle` \| `prerequisite`                                |
| `scheduled_date` | date    | calendario editable                                      |
| `status`         | text    | `pending` \| `taught` \| `review`                        |
| `position`       | int     | orden                                                    |
| `material_text`  | text    | texto extraído (PDF/PPTX/notas), base de la Regla de Oro |
| `material_files` | jsonb   | `[{ id, storage_path, filename, mime, chars }]`          |

### `student_diagnostics`

| Columna                      | Tipo        | Notas                                                                                                                                                            |
| ---------------------------- | ----------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `id`                         | uuid PK     |                                                                                                                                                                  |
| `student_id`, `classroom_id` | uuid FK     |                                                                                                                                                                  |
| `type`                       | text        | `prior_knowledge` \| `mental_math`                                                                                                                               |
| `score`                      | numeric     | 0–100                                                                                                                                                            |
| `detail`                     | jsonb       | por tema o por nivel (exactitud, tiempos). Si `type = mental_math`: `{ correct: int, total: int, avg_response_ms: int, max_level: int, per_level: LevelStat[] }` |
| `integrity_events`           | jsonb       | `[{ type: "visibilitychange"\|"blur"\|"copy"\|"screenshot_key", at: string }]`                                                                                   |
| `invalidated`                | boolean     |                                                                                                                                                                  |
| `created_at`                 | timestamptz |                                                                                                                                                                  |

### `reading_sessions`

| Columna                                  | Tipo            | Notas                                                                                                          |
| ---------------------------------------- | --------------- | -------------------------------------------------------------------------------------------------------------- |
| `id`                                     | uuid PK         |                                                                                                                |
| `student_id`, `classroom_id`, `topic_id` | uuid FK         |                                                                                                                |
| `mode`                                   | text            | `comprehension` \| `cloze`                                                                                     |
| `text`                                   | text            | lectura generada                                                                                               |
| `questions`                              | jsonb           | preguntas o huecos                                                                                             |
| `answers`                                | jsonb           | respuestas del alumno                                                                                          |
| `audio_attempts`                         | jsonb           | `[{ attempt, storage_path, score, errors, at }]`                                                               |
| `best_audio_score`                       | numeric         |                                                                                                                |
| `comprehension_score`                    | numeric \| null | 0–100, porcentaje de aciertos en las preguntas o los huecos. Null hasta que el alumno comprueba sus respuestas |
| `created_at`                             | timestamptz     |                                                                                                                |

### `math_game_scores`

| Columna                      | Tipo        | Notas                                                     |
| ---------------------------- | ----------- | --------------------------------------------------------- |
| `id`                         | uuid PK     |                                                           |
| `classroom_id`, `student_id` | uuid FK     |                                                           |
| `game_id`                    | uuid        | partida                                                   |
| `points`                     | int         |                                                           |
| `correct`, `total`           | int         |                                                           |
| `duration_ms`                | int         |                                                           |
| `created_at`                 | timestamptz | **Realtime habilitado** (publicación `supabase_realtime`) |

### `feyn_sessions`

| Columna                                  | Tipo        | Notas                                                 |
| ---------------------------------------- | ----------- | ----------------------------------------------------- |
| `id`                                     | uuid PK     |                                                       |
| `student_id`, `classroom_id`, `topic_id` | uuid FK     |                                                       |
| `messages`                               | jsonb       | `[{ role: "student"\|"feyn", text, at, grounding? }]` |
| `struggles`                              | text[]      | dificultades que indicó el alumno                     |
| `mastered`                               | boolean     |                                                       |
| `coverage`                               | numeric     | 0–1, conceptos clave cubiertos                        |
| `updated_at`                             | timestamptz |                                                       |

Tabla de apoyo no listada en el pedido original, necesaria para las lecciones adaptadas: se puede guardar en `student_diagnostics.detail` si se prefiere no crearla.

- `lesson_events` (`id`, `student_id`, `topic_id`, `modality`, `created_at`, `understood boolean`): para medir qué formato funciona en el reporte.

### `topic_score_events`

Historial de dominio por tema. Alimenta las series de la vista Progreso (`ProgressTopic.trend`).

| Columna                  | Tipo        | Notas                                                                       |
| ------------------------ | ----------- | --------------------------------------------------------------------------- |
| `id`                     | uuid PK     |                                                                             |
| `student_id`, `topic_id` | uuid FK     |                                                                             |
| `score`                  | numeric     | 0–100                                                                       |
| `source`                 | text        | `diagnostic` \| `reading` \| `quiz` \| `feyn` \| `lesson`                   |
| `recorded_at`            | timestamptz | El primer evento `diagnostic` de cada tema es la línea base del diagnóstico |

### `activity_days`

Un registro por día en que el alumno completó alguna actividad. La racha se calcula con ellos.

| Columna      | Tipo    | Notas                  |
| ------------ | ------- | ---------------------- |
| `student_id` | uuid FK | PK compuesta con `day` |
| `day`        | date    |                        |


### `remedial_sets`

Series de nivelación sin límite de tiempo. El backend las genera por alumno a partir de los temas previos con rezago.

| Columna                      | Tipo        | Notas                                                                        |
| ---------------------------- | ----------- | ---------------------------------------------------------------------------- |
| `id`                         | uuid PK     |                                                                              |
| `student_id`, `classroom_id` | uuid FK     |                                                                              |
| `topic_id`                   | uuid FK     | Tema previo (`syllabus_topics.kind = prerequisite`) que se refuerza          |
| `title`                      | text        |                                                                              |
| `exercises`                  | jsonb       | `RemedialExercise[]` (§2.14)                                                 |
| `best_first_try_pct`         | numeric     | 0–100, mejor resultado de aciertos a la primera. Es el progreso de la tarjeta |
| `attempts`                   | int         | default 0                                                                    |
| `updated_at`                 | timestamptz |                                                                              |
---

## 2. Endpoints

### 2.1 `POST /api/materials/upload` (rol: `teacher`)

`multipart/form-data`: `file` (PDF o PPTX, máx. 20 MB), `topic_id` (uuid). Guarda el archivo en Storage, extrae el texto (`pypdf` / `python-pptx`) y lo añade a `syllabus_topics.material_text`.

```ts
export interface UploadMaterialResponse {
  material_id: string;
  topic_id: string;
  filename: string;
  mime:
    | "application/pdf"
    | "application/vnd.openxmlformats-officedocument.presentationml.presentation";
  extracted_chars: number;
  page_count: number; // páginas o diapositivas
  preview: string; // primeros 300 caracteres
  warnings: string[]; // p. ej. "Diapositivas 4 y 5 sin texto"
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

### 2.2 `POST /api/lessons/adapt` (rol: `student`)

Genera la explicación de un tema con los gustos del alumno y la modalidad pedida. Usa solo `material_text` del tema.

```ts
export interface AdaptLessonRequest {
  classroom_id: string;
  topic_id: string;
  modality: Modality;
  previous_modality?: Modality; // se llena al pulsar "Explicar de otra forma"
}
export interface LessonBlock {
  heading: string;
  body: string; // texto en markdown simple
  visual_description?: string; // modalidad visual: qué dibujar o mostrar
}
export interface AdaptLessonResponse {
  topic_id: string;
  modality: Modality;
  title: string;
  blocks: LessonBlock[];
  narration_script?: string; // modalidad auditiva
  mnemonic_song?: string; // modalidad auditiva
  interests_used: string[]; // gustos que se usaron en los ejemplos
  grounding: Grounding[]; // mínimo 1
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

### 2.3 `POST /api/reading/generate` (rol: `student`)

```ts
export type ReadingMode = "comprehension" | "cloze";
export interface GenerateReadingRequest {
  classroom_id: string;
  topic_id: string;
  mode: ReadingMode;
  difficulty?: 1 | 2 | 3 | 4 | 5; // por defecto, el nivel del último diagnóstico
}
export interface ComprehensionQuestion {
  id: string;
  question: string;
  options: string[]; // 3 o 4 opciones
  correct_index: number;
}
export interface ClozeBlank {
  id: string;
  position: number; // índice de la palabra en `text`
  answer: string;
  options?: string[];
}
export interface GenerateReadingResponse {
  reading_session_id: string;
  mode: ReadingMode;
  title: string;
  text: string; // para el modo cloze, las palabras ocultas aparecen como "____"
  word_count: number;
  questions?: ComprehensionQuestion[]; // solo mode = "comprehension"
  blanks?: ClozeBlank[]; // solo mode = "cloze"
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

### 2.4 `POST /api/reading/evaluate-audio` (rol: `student`)

`multipart/form-data`: `audio` (`audio/webm`, `audio/ogg`, `audio/mp4` o `audio/wav`; máx. 10 MB y 3 min), `reading_session_id` (uuid), `attempt` (int ≥ 1).

```ts
export type AudioErrorType =
  | "omitted"
  | "mispronounced"
  | "inserted"
  | "punctuation";
export interface AudioError {
  type: AudioErrorType;
  word: string;
  expected?: string;
  position: number; // índice de la palabra en el texto
  suggestion: string;
}
export interface EvaluateAudioResponse {
  reading_session_id: string;
  attempt: number;
  read_the_text: boolean; // false si el audio no corresponde a la lectura
  score: number; // 0-100
  diction_score: number; // 0-100
  punctuation_score: number; // 0-100
  completeness: number; // 0-1, proporción del texto leída
  errors: AudioError[];
  feedback: string; // consejo breve de Feyn
  best_score: number;
  improved: boolean; // frente al mejor intento previo
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

### 2.5 `POST /api/feyn/chat` (rol: `student`)

Un turno de la Técnica Feynman. El backend carga la sesión, el material del tema, y pide a Gemini que compare la explicación del alumno con los apuntes.

```ts
export interface FeynChatRequest {
  classroom_id: string;
  topic_id: string;
  session_id?: string; // vacío en el primer turno
  message: string; // máx. 2000 caracteres
  struggles?: string[]; // lo que el alumno dice que se le dificulta
}
export type FeynIntent =
  | "ask_to_explain" // pide que explique el tema
  | "feigned_doubt" // finge no entender una parte
  | "guiding_question" // pregunta guía
  | "mastered" // dominio demostrado
  | "off_topic"; // fuera del temario
export interface FeynChatResponse {
  session_id: string;
  reply: string;
  intent: FeynIntent;
  covered_concepts: string[];
  missing_concepts: string[];
  coverage: number; // 0-1
  mastered: boolean;
  grounding: Grounding[]; // vacío solo si intent = "off_topic"
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

### 2.6 `POST /api/math/mental-test` (rol: `student`)

Dos usos con el mismo endpoint, según `action`.

```ts
export type MathOperation = "addition"; // ampliable: "subtraction" | "multiplication" | "division"

export type MentalTestRequest =
  | { action: "start"; classroom_id: string; operation: MathOperation }
  | {
      action: "answer";
      test_id: string;
      question_id: string;
      answer: number;
      response_ms: number;
    }
  | { action: "finish"; test_id: string };

export interface MentalQuestion {
  id: string;
  level: number; // 1..N, la dificultad sube
  prompt: string; // "17 + 8"
  time_limit_ms: number; // baja con el nivel
}
export interface MentalTestStartResponse {
  test_id: string;
  first_question: MentalQuestion;
}
export interface MentalTestAnswerResponse {
  correct: boolean;
  correct_answer: number;
  next_question: MentalQuestion | null; // null al terminar
}
export interface MentalTestResult {
  test_id: string;
  score: number; // 0-100
  accuracy: number; // 0-1
  avg_response_ms: number;
  max_level_reached: number;
  per_level: {
    level: number;
    correct: number;
    total: number;
    avg_ms: number;
  }[];
  tips: string[];
  everyday_examples: string[]; // ejemplos cotidianos
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

### 2.7 `GET /api/math/quick-game` (rol: `student`)

Query: `classroom_id` (uuid), `count` (int, por defecto 20, máx. 50).

```ts
export interface QuickGameQuestion {
  id: string;
  prompt: string;
  options: [string, string]; // exactamente 2 opciones
  source: "basic_operation" | "class_topic";
}
export interface QuickGameResponse {
  game_id: string;
  duration_seconds: number; // reloj de la partida
  questions: QuickGameQuestion[];
}
export interface SubmitQuickGameRequest {
  // POST /api/math/quick-game/submit
  game_id: string;
  answers: { question_id: string; choice_index: 0 | 1; response_ms: number }[];
}
export interface SubmitQuickGameResponse {
  points: number;
  correct: number;
  total: number;
  rank: number; // posición actual en el aula
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

Los puntos se calculan en el servidor al recibir `submit`. El servidor inserta en `math_game_scores`. El cliente recibe el ranking en vivo por Supabase Realtime, filtrando `classroom_id=eq.<id>`, y no por este endpoint. El estado inicial del ranking se pide a `GET /api/math/leaderboard` (§2.11).

### 2.8 `GET /api/reports/classroom/{id}` (rol: `teacher`, dueño del aula)

```ts
export interface TopicPerformance {
  topic_id: string;
  title: string;
  avg_score: number; // 0-100
  students_below_threshold: number;
  trend: { date: string; avg_score: number }[];
}
export interface InflectionPoint {
  strategy_id: string;
  applied_at: string;
  description: string;
  avg_before: number;
  avg_after: number;
  delta: number; // avg_after - avg_before
  topic_id?: string;
}
export interface ClassroomReport {
  classroom_id: string;
  generated_at: string;
  student_count: number;
  overall_avg: number;
  topics: TopicPerformance[];
  hardest_topics: TopicPerformance[]; // top 3 con menor promedio
  easiest_topics: TopicPerformance[]; // top 3 con mayor promedio
  at_risk_students: {
    student_id: string;
    full_name: string;
    reasons: string[];
  }[];
  recommendations: { topic_id: string; text: string }[];
  inflection_points: InflectionPoint[];
  integrity_flags: number; // diagnósticos con eventos anti-trampa
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

### 2.9 `GET /api/reports/student/{id}` (rol: `teacher` dueño del aula, o el propio `student`)

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
    gaps: { topic_id: string; title: string }[]; // temas previos con rezago
    invalidated_attempts: number;
  };
  topics: {
    topic_id: string;
    title: string;
    score: number;
    trend: { date: string; score: number }[];
  }[];
  reading: {
    sessions: number;
    avg_audio_score: number | null;
    best_audio_score: number | null;
  };
  feyn: {
    sessions: number;
    mastered_topics: string[];
    frequent_struggles: string[];
  };
  quick_game: {
    games: number;
    best_points: number;
    current_rank: number | null;
  };
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

### 2.10 `GET /api/progress/me` (rol: `student`)

Datos de la vista **Progreso** del alumno en todas sus aulas. `StudentReport` (§2.9) es por aula y no trae materia, racha, nivel de referencia ni historiales de cálculo mental y lectura. Por eso esta vista usa un endpoint propio. El backend devuelve el ciclo completo y el frontend filtra por periodo.

```ts
export type SubjectArea = "math" | "reading" | "science";

export interface ProgressTopic {
  topic_id: string;
  classroom_id: string;
  title: string;
  subject_area: SubjectArea; // de `classrooms.subject_area`
  score: number; // 0-100, último evento de `topic_score_events`
  trend: { date: string; score: number }[]; // el primer punto es el diagnóstico inicial
  feyn_mastered: boolean; // algún `feyn_sessions.mastered = true` para el tema
}
export interface MentalMathSession {
  id: string;
  date: string; // YYYY-MM-DD
  correct: number;
  total: number;
  avg_response_ms: number;
  max_level: number;
}
export interface ReadingScoreSession {
  id: string;
  date: string;
  comprehension_score: number; // 0-100
  audio_score: number | null; // mejor puntaje de voz de la sesión; null si no grabó
}
export interface ReferenceLevel {
  framework: "PISA"; // referencia aproximada, no es una evaluación oficial
  level: number; // 1..max_level
  max_level: number; // 6
  label: string;
  description: string;
}
export interface TopicRecommendation {
  topic_id: string;
  text: string;
}
export interface StudentProgressResponse {
  student_id: string;
  generated_at: string;
  cycle_start: string; // fecha del primer diagnóstico
  topics: ProgressTopic[];
  inflection_points: InflectionPoint[];
  mental_math_sessions: MentalMathSession[];
  reading_sessions: ReadingScoreSession[];
  streak: { current_days: number; best_days: number };
  reference_level: ReferenceLevel;
  recommendations: TopicRecommendation[];
}
```

```python
import datetime as dt

SubjectArea = Literal["math", "reading", "science"]

class Streak(BaseModel):
    current_days: int
    best_days: int

class ProgressTopic(BaseModel):
    topic_id: UUID
    classroom_id: UUID
    title: str
    subject_area: SubjectArea
    score: float = Field(ge=0, le=100)
    trend: list[TrendPoint]
    feyn_mastered: bool

class MentalMathSession(BaseModel):
    id: UUID
    date: dt.date
    correct: int
    total: int
    avg_response_ms: int
    max_level: int

class ReadingScoreSession(BaseModel):
    id: UUID
    date: dt.date
    comprehension_score: float = Field(ge=0, le=100)
    audio_score: float | None = Field(default=None, ge=0, le=100)

class ReferenceLevel(BaseModel):
    framework: Literal["PISA"]
    level: int = Field(ge=1)
    max_level: int
    label: str
    description: str

class TopicRecommendation(BaseModel):
    topic_id: UUID
    text: str

class StudentProgressResponse(BaseModel):
    student_id: UUID
    generated_at: datetime
    cycle_start: dt.date
    topics: list[ProgressTopic]
    inflection_points: list[InflectionPoint]
    mental_math_sessions: list[MentalMathSession]
    reading_sessions: list[ReadingScoreSession]
    streak: Streak
    reference_level: ReferenceLevel
    recommendations: list[TopicRecommendation]
```

Cómo se calcula cada campo:

- `topics[].trend`: eventos de `topic_score_events` del alumno. `score` es el último. El dominio general del cliente es el promedio de `score`.
- `topics[].subject_area`: viene de `classrooms.subject_area` del aula del tema.
- `mental_math_sessions`: filas de `student_diagnostics` con `type = mental_math` y `invalidated = false`, leyendo `detail`.
- `reading_sessions`: filas de `reading_sessions` con `comprehension_score` no nulo. `audio_score` es `best_audio_score`.
- `streak`: días consecutivos con registro en `activity_days`, hasta hoy o ayer. `best_days` es la racha más larga.
- `inflection_points`: vienen de las estrategias registradas (`strategies`) y de cambios de formato en `lesson_events`. Se emite un punto cuando el promedio del tema sube o baja 10 puntos o más en los 14 días posteriores a `applied_at`. `avg_before` es el puntaje ese día, `avg_after` el de 14 días después y `delta = avg_after - avg_before`, en puntos porcentuales.
- Fechas: `trend[].date`, `mental_math_sessions[].date`, `reading_sessions[].date` y `cycle_start` son `YYYY-MM-DD`. `inflection_points[].applied_at` llega como datetime ISO (modelo compartido con §2.8) y el cliente usa sus 10 primeros caracteres.
- `reference_level`: se calcula con el dominio general (promedio de `score`): menos de 30 → nivel 1, de 30 a 44 → 2, de 45 a 59 → 3, de 60 a 79 → 4, de 80 a 89 → 5, 90 o más → 6. `label` y `description` salen de una tabla fija en el backend. Es una referencia inspirada en los niveles de PISA, no una evaluación oficial, y la interfaz lo dice.
- `recommendations`: se generan para el tema con menor `score` y para el de mayor `score`. Gemini solo redacta la acción sugerida a partir del tema, sus prerrequisitos y los gustos del alumno. No añade contenido del curso (Regla de Oro).


### 2.11 `GET /api/math/leaderboard` (rol: `student`, miembro del aula)

Estado inicial del ranking grupal. Las actualizaciones posteriores llegan por Supabase Realtime (§2.7).
Query: `classroom_id` (uuid).

```ts
export interface LeaderboardEntry {
  student_id: string;
  name: string; // nombre abreviado, por ejemplo "Valeria M."
  points: number; // suma de `math_game_scores.points` + `classroom_members.bonus_points`
  is_me: boolean;
}
export interface LeaderboardResponse {
  classroom_id: string;
  generated_at: string;
  entries: LeaderboardEntry[]; // ordenadas por `points` descendente
}
```

```python
class LeaderboardEntry(BaseModel):
    student_id: UUID
    name: str
    points: int
    is_me: bool

class LeaderboardResponse(BaseModel):
    classroom_id: UUID
    generated_at: datetime
    entries: list[LeaderboardEntry]
```

- El nombre se abrevia (nombre y inicial del apellido) porque los alumnos son menores de edad.
- Con un `INSERT` en `math_game_scores` del aula, el cliente suma `points` a la entrada del `student_id`. Si ese alumno no está en la lista, o cambia `classroom_members.bonus_points`, vuelve a pedir este endpoint.

### 2.12 `GET /api/social/streak-friends` (rol: `student`)

Racha diaria, código de invitación y comparación semanal con los compañeros del aula (requisito D4 CA4).
Query: `classroom_id` (uuid).

```ts
export interface StreakWeekDay {
  date: string; // YYYY-MM-DD
  active: boolean; // hay registro en `activity_days`
}
export interface StreakInfo {
  current_days: number;
  best_days: number;
  week: StreakWeekDay[]; // 7 días, de lunes a domingo de la semana actual
}
export interface FriendWeekly {
  student_id: string;
  name: string; // abreviado
  weekly_points: number;
  is_me: boolean;
}
export interface StreakFriendsResponse {
  classroom_id: string;
  generated_at: string;
  streak: StreakInfo;
  invite_code: string; // `classrooms.invite_code`
  friends: FriendWeekly[]; // ordenados por `weekly_points` descendente, máximo 20
}
```

```python
class StreakWeekDay(BaseModel):
    date: dt.date
    active: bool

class StreakInfo(BaseModel):
    current_days: int
    best_days: int
    week: list[StreakWeekDay] = Field(min_length=7, max_length=7)

class FriendWeekly(BaseModel):
    student_id: UUID
    name: str
    weekly_points: int
    is_me: bool

class StreakFriendsResponse(BaseModel):
    classroom_id: UUID
    generated_at: datetime
    streak: StreakInfo
    invite_code: str
    friends: list[FriendWeekly]
```

- "Amigos" son los compañeros del mismo aula. No hay tabla de amistades.
- `invite_code` es el código de 6 caracteres del aula (`classrooms.invite_code`), para invitar a otros compañeros.
- `weekly_points` suma `math_game_scores.points` de la semana actual (lunes a domingo) y no incluye `bonus_points`.
- La racha usa `activity_days`, igual que `GET /api/progress/me` (§2.10).

### 2.13 `GET /api/learning/home` (rol: `student`)

Tarjetas de la vista **Aprender** y la recomendación de enfoque diario, de todas las aulas del alumno.

```ts
export type StudyCategory = "lessons" | "reading" | "remedial";
export type StudyBadge = "visual" | "text" | "audio" | "live_voice" | "practice";
export interface StudyCard {
  id: string;
  category: StudyCategory;
  classroom_id: string;
  topic_id: string;
  topic_title: string;
  subject: string; // `classrooms.subject`
  subject_area: SubjectArea; // §2.10
  title: string;
  description: string;
  badge: StudyBadge;
  progress: number; // 0-100
  minutes: number; // duración estimada
  remedial_set_id: string | null; // solo si category = "remedial"
}
export interface DailyFocus {
  card_id: string; // id de una tarjeta de `cards`
  headline: string;
  reason: string;
  based_on: string[]; // fuentes: diagnóstico, gustos, temario
}
export interface LearningHomeResponse {
  generated_at: string;
  daily_focus: DailyFocus | null;
  cards: StudyCard[];
}
```

```python
StudyCategory = Literal["lessons", "reading", "remedial"]
StudyBadge = Literal["visual", "text", "audio", "live_voice", "practice"]

class StudyCard(BaseModel):
    id: str
    category: StudyCategory
    classroom_id: UUID
    topic_id: UUID
    topic_title: str
    subject: str
    subject_area: SubjectArea
    title: str
    description: str
    badge: StudyBadge
    progress: float = Field(ge=0, le=100)
    minutes: int = Field(ge=1)
    remedial_set_id: UUID | None = None

class DailyFocus(BaseModel):
    card_id: str
    headline: str
    reason: str
    based_on: list[str]

class LearningHomeResponse(BaseModel):
    generated_at: datetime
    daily_focus: DailyFocus | None = None
    cards: list[StudyCard]
```

- `lessons` y `reading`: una tarjeta por tema del ciclo que tenga material. Al abrirla, el cliente llama a `POST /api/lessons/adapt` (§2.2) o `POST /api/reading/generate` (§2.3) con `classroom_id` y `topic_id`. Los temas sin material no generan tarjeta (Regla de Oro).
- `remedial`: una tarjeta por serie de `remedial_sets`. Al abrirla, el cliente llama a §2.14.
- `badge`: en `lessons` sale de `profiles.interests.preferred_modality` (`visual`→`visual`, `reading`→`text`, `auditory`→`audio`). `reading` usa `live_voice` y `remedial` usa `practice`.
- `progress`: en `lessons` y `reading` es el último `score` del tema en `topic_score_events`, o 0. En `remedial` es `remedial_sets.best_first_try_pct`.
- `daily_focus`: se elige el tema previo con mayor rezago. Gemini solo redacta `headline` y `reason` con los datos del diagnóstico, los temas previos y los gustos del alumno, sin añadir contenido del curso. Es `null` si no hay datos suficientes.

### 2.14 `GET /api/learning/remedial/{set_id}` y `POST /api/learning/remedial/{set_id}/result` (rol: `student`)

Práctica de nivelación guiada, sin reloj, sobre temas previos con rezago.

```ts
export type RemedialSkill = "addition" | "fractions"; // ampliable
export interface RemedialExercise {
  id: string;
  skill: RemedialSkill;
  prompt: string; // "27 + 15"
  accepted_answers: string[]; // en minúsculas y sin espacios; el decimal usa punto
  display_answer: string;
  hint_title: string;
  everyday_hint: string; // ejemplo de la vida diaria que se muestra al fallar
  worked_example: string; // procedimiento paso a paso
}
export interface RemedialSet {
  id: string;
  title: string;
  prerequisite: { classroom_id: string; topic_id: string; title: string }; // tema previo que se refuerza
  exercises: RemedialExercise[];
}
export interface SubmitRemedialResultRequest {
  first_try_correct: number; // ejercicios resueltos sin pista
  total: number;
}
export interface SubmitRemedialResultResponse {
  set_id: string;
  progress: number; // 0-100, igual a `best_first_try_pct`
  best_first_try_pct: number;
}
```

```python
RemedialSkill = Literal["addition", "fractions"]

class RemedialExercise(BaseModel):
    id: str
    skill: RemedialSkill
    prompt: str
    accepted_answers: list[str] = Field(min_length=1)
    display_answer: str
    hint_title: str
    everyday_hint: str
    worked_example: str

class RemedialPrerequisite(BaseModel):
    classroom_id: UUID
    topic_id: UUID
    title: str

class RemedialSet(BaseModel):
    id: UUID
    title: str
    prerequisite: RemedialPrerequisite
    exercises: list[RemedialExercise] = Field(min_length=1)

class SubmitRemedialResultRequest(BaseModel):
    first_try_correct: int = Field(ge=0)
    total: int = Field(ge=1)

class SubmitRemedialResultResponse(BaseModel):
    set_id: UUID
    progress: float = Field(ge=0, le=100)
    best_first_try_pct: float = Field(ge=0, le=100)
```

- Las operaciones y respuestas se generan por reglas a partir del tema previo (`kind = prerequisite`). Gemini solo redacta `hint_title`, `everyday_hint` y `worked_example`, con los gustos del alumno y sin añadir contenido del curso.
- `accepted_answers` viaja al cliente y la corrección es local. Si se quiere ocultar, se mueve a un endpoint de verificación en Fase 2 (igual que en §2.3).
- Errores: `NOT_FOUND`, `FORBIDDEN` si la serie no es del alumno, y `NO_TEACHER_MATERIAL` (422) si el tema previo no tiene material.
- El `POST` actualiza `best_first_try_pct` (conserva el mayor) e incrementa `attempts`.
---

## 3. Acceso directo desde el frontend a Supabase (sin pasar por FastAPI)

| Operación                      | Tabla                           | Notas                                                                 |
| ------------------------------ | ------------------------------- | --------------------------------------------------------------------- |
| Registro e inicio de sesión    | `auth`                          |                                                                       |
| Leer/editar perfil e intereses | `profiles`                      | RLS: solo el propio usuario                                           |
| Crear aula y regenerar código  | `classrooms`                    | RLS: solo `teacher` dueño                                             |
| Unirse con código              | RPC `join_classroom(code text)` | Función SQL `security definer`                                        |
| CRUD de temas y calendario     | `syllabus_topics`               | RLS: solo `teacher` dueño. `material_text` solo lo escribe el backend |
| Ranking en vivo                | `math_game_scores`              | Suscripción Realtime `postgres_changes` con filtro por aula. Estado inicial: §2.11 |

El anti-trampa se envía con la entrega del diagnóstico. Endpoint pendiente de definir: `POST /api/diagnostics/prior-knowledge/submit` con `{ diagnostic_id, answers, integrity_events }`.

## 4. Pendientes del contrato

1. Endpoints de diagnóstico de conocimientos previos (generar y entregar) y de verificación del modo cloze.
2. Tabla `strategies` y migraciones SQL en `supabase/migrations/`.
3. Límite de uso (rate limit) por usuario para los endpoints con Gemini.
4. Migraciones para `classrooms.subject_area`, `reading_sessions.comprehension_score`, `topic_score_events` y `activity_days` (§1), necesarias para `GET /api/progress/me` (§2.10).
5. Migración para `remedial_sets` (§1), necesaria para `GET /api/learning/home` y los endpoints de nivelación (§2.13 y §2.14).
