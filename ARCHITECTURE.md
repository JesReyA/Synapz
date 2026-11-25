# ARCHITECTURE.md — Synapz + Feyn

Synapz es una plataforma educativa adaptativa. Feyn es su asistente de IA (Técnica Feynman y coach de lectura).
Este documento fija la estructura del monorepo y las reglas de modularidad. Los requisitos están en `requirements.md` y los contratos de datos y API en `API_CONTRACT.md`.

## 1. Monorepo

Estado real del repositorio y destino:

```
Synapz/
├── frontend/
│   └── web/                  # App React
│       ├── DESIGN.md         # Fuente única de verdad visual
│       ├── public/           # synapz.png, feyn.png
│       └── src/
├── backend/                  # FastAPI (existe solo app/main.py de ejemplo)
│   └── app/
├── docs/
├── ARCHITECTURE.md
├── requirements.md
├── API_CONTRACT.md
└── .kiro/steering/synapz-rules.md
```

Las rutas `src/...`, `public/...` y `DESIGN.md` de este documento son relativas a `frontend/web/`.

Despliegue: frontend en **Vercel** (raíz del proyecto `frontend/web`), backend en **Railway o Render**, datos en **Supabase**.

## 2. Frontend (`frontend/web/`)

### Stack
- React 19, Vite, **TypeScript estricto**, Tailwind CSS v4, `recharts`, `lucide-react`.
- Gestor de paquetes: `pnpm`.
- Prohibido: archivos `.jsx`/`.js` en `src/`, el tipo `any` (usar `unknown` y acotar), `@ts-ignore` sin comentario que lo justifique.
- Requiere `"strict": true` en `tsconfig.app.json`. **Hoy no está activado** y debe activarse antes de añadir pantallas nuevas.

### Diseño
- `frontend/web/DESIGN.md` es la fuente única de verdad visual: tokens de color, tipografía, geometría y layout.
- Logos: `public/synapz.png` (solo isotipo, sidebar) y `public/feyn.png` (FAB y cabecera del chat). Se referencian siempre como `/synapz.png` y `/feyn.png`.
- Tema oscuro manual con la clase `.dark` (`@custom-variant dark (&:where(.dark, .dark *));` en `src/index.css`). Estado del tema en `App.tsx`, persistido en `localStorage`.
- **Acento de Feyn: ámbar `#FBBF24`** (`amber-400`) para el FAB y la cabecera del chat. El código (`FeynChatFab.tsx`) ya lo usa. `DESIGN.md` debe reflejarlo (ver sección 7).

### Organización de `src/`

| Carpeta | Contenido | Reglas |
|---|---|---|
| `components/` | Componentes de UI reutilizables (`Sidebar`, `ProgressCard`, …) | Un componente por archivo, PascalCase, export nombrado, props tipadas. Sin llamadas a la red. |
| `pages/` | Una pantalla por archivo (`StudentHome`, `TeacherDashboard`, `Diagnostic`, `Reading`, `QuickGame`, …) | Compone componentes y hooks. Una página no supera ~150 líneas: se divide en componentes. |
| `services/` | Acceso a datos: cliente de Supabase (`supabase.ts`) y cliente del backend (`api.ts` + un archivo por dominio) | Único lugar que llama a `fetch` o a Supabase. Funciones tipadas con los tipos de `types/`. |
| `hooks/` | Hooks (`useTheme`, `useAuth`, `useAntiCheat`, `useAudioRecorder`, `useLeaderboard`) | Encapsulan estado y efectos. Usan `services/`. |
| `types/` | Tipos e interfaces compartidos (`api.ts`, `db.ts`, …) | Reflejan `API_CONTRACT.md` campo por campo. |

Reglas:
1. Los componentes de `components/` reciben datos por props. Los datos los obtienen las páginas o los hooks.
2. Nada de URLs, claves ni textos de configuración en el código: variables `VITE_*` en `.env` (con `.env.example` actualizado).
3. Cada respuesta del backend se tipa con el tipo del contrato. Si el contrato cambia, se cambian primero `API_CONTRACT.md` y `types/`.
4. Estilos solo con utilidades de Tailwind y los tokens de `DESIGN.md`. Sin `style={{}}` para color.
5. Accesibilidad: landmarks, `aria-label` en botones solo-icono, foco visible, contraste AA en ambos temas.
6. Iconos solo de `lucide-react`. Gráficas solo de `recharts`, dentro de `ResponsiveContainer` con un padre de altura explícita.
7. Rutas con `react-router` cuando se añada la segunda pantalla. Rutas protegidas por rol (`teacher`/`student`).

Variables de entorno del frontend: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_API_URL`. Nunca se expone la `service_role` key.

## 3. Backend (`backend/`)

### Stack
- Python 3.11+, FastAPI, Pydantic v2 (todas las respuestas son modelos con esquema JSON explícito).
- `pypdf` para PDF y `python-pptx` para PPTX: extracción de texto del material del docente.
- SDK oficial `google-genai`, modelo `gemini-2.5-flash` (texto y audio).
- Cliente de Supabase en Python para leer/escribir datos con la `service_role` key, solo en el servidor.

### Organización de `app/`

```
app/
├── main.py            # Crea la app, CORS, registra routers
├── core/              # config (pydantic-settings), seguridad (verificación de JWT de Supabase), cliente Supabase, cliente Gemini
├── routers/           # Un archivo por dominio: materials, lessons, reading, feyn, math, reports
├── services/          # Lógica de negocio y llamadas a Gemini/Supabase. Sin objetos Request/Response de FastAPI
└── schemas/           # Modelos Pydantic de entrada y salida (espejo de API_CONTRACT.md)
```

Reglas:
1. Los routers solo validan, llaman a un servicio y devuelven un schema. La lógica va en `services/`.
2. Todo endpoint declara `response_model` y un `Request` Pydantic. No se devuelven `dict` sueltos.
3. Todo endpoint (salvo `/health`) exige `Authorization: Bearer <JWT de Supabase>`. El rol se lee del JWT y se comprueba en cada ruta (por ejemplo, subir material solo con `teacher`).
4. Salidas de Gemini en JSON estructurado (`response_mime_type="application/json"` con `response_schema`) y validadas con Pydantic antes de responder. Si no validan, se reintenta una vez y se devuelve `502`.
5. Secretos solo en variables de entorno: `GEMINI_API_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `CORS_ORIGINS`. Con `.env.example` actualizado. `backend/.env` no se versiona.
6. Límites: tamaño máximo de archivos (PDF/PPTX 20 MB, audio 10 MB), tipos MIME permitidos, y tope de caracteres enviados a Gemini.
7. `backend/requirements.txt` hoy es un volcado de un entorno con paquetes ajenos (keras, tensorboard, customtkinter, …). Se reemplaza por solo las dependencias del proyecto (`fastapi`, `uvicorn`, `pydantic-settings`, `python-multipart`, `pypdf`, `python-pptx`, `google-genai`, `supabase`, `python-jose` o `pyjwt`, `httpx`).

## 4. Supabase

| Servicio | Uso |
|---|---|
| **Auth** | Registro/inicio de sesión. Rol `teacher` o `student` en `profiles.role` y copiado a `app_metadata.role` del JWT. |
| **PostgreSQL** | Aulas, perfiles de intereses, diagnósticos, progreso y rankings (tablas en `API_CONTRACT.md`). |
| **Storage** | Bucket privado `materials`: presentaciones y notas del docente. Bucket privado `reading-audio`: grabaciones de los alumnos. |
| **Realtime** | Suscripción del frontend a `math_game_scores` para la tabla de posiciones en vivo. |

Reglas:
1. **Row Level Security activado en todas las tablas.** Un alumno solo lee y escribe lo suyo. Un docente solo accede a las aulas que creó. Los rankings de un aula los leen sus miembros.
2. El frontend usa la `anon` key y el JWT del usuario. El backend usa `service_role` y siempre verifica la pertenencia al aula antes de operar.
3. Los archivos se suben por URLs firmadas o a través del backend, nunca con buckets públicos.
4. Cambios de esquema como migraciones SQL versionadas en `supabase/migrations/` (carpeta aún por crear).

## 5. Regla de Oro de IA

**Feyn nunca inventa el rumbo del curso.** Todo contenido, explicación, lectura temática y evaluación se ancla estrictamente al temario y al material que subió el profesor.

Implementación obligatoria:
1. Cada llamada a Gemini que genere contenido académico recibe como contexto el `topic` y el texto extraído de sus materiales (`syllabus_topics` y su material asociado). Si el tema no tiene material, el backend responde `422` con `code: "NO_TEACHER_MATERIAL"` y no genera nada.
2. El prompt de sistema prohíbe usar conocimiento externo para afirmar contenido del curso. Los gustos del alumno solo cambian los **ejemplos y la forma**, nunca el **contenido**.
3. Las respuestas de Feyn incluyen `grounding`: fragmentos del material usados (`source_id` y cita corta). Una respuesta sin `grounding` válido no se muestra al alumno.
4. En el chat Feynman, si el alumno pregunta algo fuera del temario, Feyn lo dice y lo redirige al tema activo.
5. Las evaluaciones y los diagnósticos usan solo temas del ciclo y los temas previos declarados por el docente.

## 6. Flujos principales

1. **Material:** el docente sube PDF/PPTX → `POST /api/materials/upload` → el backend guarda el archivo en Storage, extrae el texto y lo guarda ligado al tema.
2. **Lección adaptada:** `POST /api/lessons/adapt` con tema, intereses y modalidad. Gemini recibe el texto del docente y devuelve la explicación en el formato pedido.
3. **Lectura:** `POST /api/reading/generate` → el alumno lee en voz alta (MediaRecorder) → `POST /api/reading/evaluate-audio`.
4. **Feyn:** `POST /api/feyn/chat` por turnos. El estado de la sesión se guarda en `feyn_sessions`.
5. **Juego rápido:** el frontend escribe el puntaje en `math_game_scores` a través del backend, y todos los clientes del aula lo reciben por Realtime.
6. **Anti-trampa:** el frontend detecta `visibilitychange`, pérdida de foco y atajos de captura durante el diagnóstico y manda los eventos con la entrega. El backend los guarda y los marca en el reporte. El navegador no puede impedir una captura de pantalla: la regla es detectar, avisar, invalidar el intento y registrarlo.

## 7. Pendientes abiertos

1. **`frontend/web/DESIGN.md`:** todavía describe el FAB de Feyn en azul (`bg-blue-500`, secciones 1.2, 3.3 y 5.2). Actualizarlo al ámbar `#FBBF24`. En `FeynChatFab.tsx` quedan clases azules sueltas (`hover:bg-blue-600`, `shadow-blue-500/30`) que deben pasar a ámbar.
2. **TypeScript estricto:** `strict` no está activo en `tsconfig.app.json`.
3. **`backend/requirements.txt`** contiene dependencias ajenas al proyecto.

Resueltos: ruta del frontend fijada en `frontend/web/`, carpetas `pages/`, `services/`, `hooks/` y `types/` creadas, `.env` fuera de git.

