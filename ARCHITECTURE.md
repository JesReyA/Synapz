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
├── backend/                  # FastAPI
│   ├── app/
│   └── tests/                # pytest (motor adaptativo)
├── supabase/
│   ├── migrations/           # SQL versionado (0001 base, 0002 motor adaptativo). Se aplica a Foundathyon PostgreSQL
│   └── local/                # auth_stub.sql: solo para pruebas en Postgres local
├── docs/                     # ADAPTIVE_ENGINE.md
├── ARCHITECTURE.md
├── requirements.md
├── API_CONTRACT.md
└── .kiro/steering/synapz-rules.md
```

Las rutas `src/...`, `public/...` y `DESIGN.md` de este documento son relativas a `frontend/web/`.

Despliegue: frontend en **Vercel** (raíz del proyecto `frontend/web`), backend en **Render**, autenticación y base de datos en **Foundathyon** (Auth y PostgreSQL) y archivos privados en **Supabase Storage**. Ver la sección 4.

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
| `services/` | Acceso a datos: cliente de Foundathyon Auth (`auth.ts`) y cliente del backend (`api.ts` + un archivo por dominio) | Único lugar que llama a `fetch`. Funciones tipadas con los tipos de `types/`. El frontend no usa `supabase-js` ni se conecta a ninguna base de datos. |
| `hooks/` | Hooks (`useTheme`, `useAuth`, `useAntiCheat`, `useAudioRecorder`, `useLeaderboard`, `useGameTelemetry`) | Encapsulan estado y efectos. Usan `services/`. |
| `types/` | Tipos e interfaces compartidos (`api.ts`, `db.ts`, …) | Reflejan `API_CONTRACT.md` campo por campo. |

Reglas:
1. Los componentes de `components/` reciben datos por props. Los datos los obtienen las páginas o los hooks.
2. Nada de URLs, claves ni textos de configuración en el código: variables `VITE_*` en `.env` (con `.env.example` actualizado).
3. Cada respuesta del backend se tipa con el tipo del contrato. Si el contrato cambia, se cambian primero `API_CONTRACT.md` y `types/`.
4. Estilos solo con utilidades de Tailwind y los tokens de `DESIGN.md`. Sin `style={{}}` para color.
5. Accesibilidad: landmarks, `aria-label` en botones solo-icono, foco visible, contraste AA en ambos temas.
6. Iconos solo de `lucide-react`. Gráficas solo de `recharts`, dentro de `ResponsiveContainer` con un padre de altura explícita.
7. Rutas con `react-router` cuando se añada la segunda pantalla. Rutas protegidas por rol (`teacher`/`student`).

Variables de entorno del frontend: `VITE_API_URL` (URL del backend en Render), `VITE_FOUNDATHYON_AUTH_URL` (`https://api.foundathyon.com`) y `VITE_DEMO_MODE`. Nunca se exponen `DATABASE_URL`, `SUPABASE_URL` ni `SUPABASE_SERVICE_ROLE_KEY`: viven solo en `backend/`.

## 3. Backend (`backend/`)

### Stack
- Python 3.11+, FastAPI, Pydantic v2 (todas las respuestas son modelos con esquema JSON explícito).
- `pypdf` para PDF y `python-pptx` para PPTX: extracción de texto del material del docente.
- SDK oficial `google-genai`, modelo `gemini-2.5-flash` (texto y audio).
- Acceso a PostgreSQL de Foundathyon con `DATABASE_URL`, solo desde el servidor y con consultas parametrizadas.
- Cliente de Supabase en Python (`supabase`) **únicamente para Storage**, con `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.

### Organización de `app/`

```
app/
├── main.py            # Crea la app, CORS, registra routers
├── core/              # config, security.py (validación del token de Foundathyon, rol y alta del perfil), db.py (conexión a PostgreSQL con `DATABASE_URL`), supabase_client.py (solo Storage). Falta el cliente Gemini (hoy en services/gemini_service.py)
├── routers/           # Un archivo por dominio: materials, lessons, reading, feyn, math, reports
├── services/          # Lógica de negocio y llamadas a PostgreSQL, Gemini y Supabase Storage. Sin objetos Request/Response de FastAPI
└── schemas/           # Modelos Pydantic de entrada y salida (espejo de API_CONTRACT.md)
```

Reglas:
1. Los routers solo validan, llaman a un servicio y devuelven un schema. La lógica va en `services/`.
2. Todo endpoint declara `response_model` y un `Request` Pydantic. No se devuelven `dict` sueltos.
3. Todo endpoint (salvo `/health`) exige `Authorization: Bearer <token de sesión de Foundathyon>`. El backend lo valida, obtiene el UUID del usuario y lee su rol de `public.profiles.role` (nunca del token ni del cliente). El rol se comprueba en cada ruta (por ejemplo, subir material solo con `teacher`) junto con la pertenencia al aula.
4. Salidas de Gemini en JSON estructurado (`response_mime_type="application/json"` con `response_schema`) y validadas con Pydantic antes de responder. Si no validan, se reintenta una vez y se devuelve `502`.
5. Secretos solo en variables de entorno, en `backend/` y en el panel de Render: `DATABASE_URL`, `FOUNDATHYON_JWT_SECRET` y `FOUNDATHYON_JWT_ALGORITHM` (validación del token de sesión), `GEMINI_API_KEY`, `GEMINI_MODEL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (solo Storage) y `CORS_ORIGINS`. Con `.env.example` actualizado. `backend/.env` no se versiona.
6. Límites: tamaño máximo de archivos (PDF/PPTX 20 MB, audio 10 MB), tipos MIME permitidos, y tope de caracteres enviados a Gemini.
7. `backend/requirements.txt` hoy es un volcado de un entorno con paquetes ajenos (keras, tensorboard, customtkinter, …). Se reemplaza por solo las dependencias del proyecto (`fastapi`, `uvicorn`, `pydantic-settings`, `python-multipart`, `pypdf`, `python-pptx`, `google-genai`, `supabase` solo para Storage, un controlador de PostgreSQL como `psycopg`, `pyjwt` y `httpx`).

### Motor adaptativo (PISA)

Mide las partidas de Retos y adapta dificultad e interfaz. Diseño, mapa de juegos y reglas en `docs/ADAPTIVE_ENGINE.md`; contrato en `API_CONTRACT.md` §2.17.

- Backend: `routers/adaptive.py` → `services/adaptive_service.py` → funciones puras (`irt`, `pisa_scale`, `scoring`, `telemetry_validator`, `socioemotional`, `difficulty_planner`, `pisa_catalog`) y `adaptive_repository.py` (único acceso a PostgreSQL de este módulo). No usa IA.
- Frontend: `AdaptiveGameBoundary` envuelve cada juego (`withAdaptiveGame` en `gameRegistry.ts`). Los hooks de cada juego entregan su resultado con `useReportOutcome`.

## 4. Autenticación, base de datos y almacenamiento (arquitectura híbrida)

| Servicio | Proveedor | Uso |
|---|---|---|
| **Autenticación** | Foundathyon Auth (`api.foundathyon.com`) | Registro e inicio de sesión con Google OAuth2 o correo y contraseña. Entrega el token de sesión que el frontend envía al backend. |
| **Base de datos** | Foundathyon PostgreSQL (`DATABASE_URL`) | Perfiles, aulas, temas, diagnósticos, progreso, rankings y motor adaptativo (tablas en `API_CONTRACT.md` §1). |
| **Backend** | Render | FastAPI en Python (`backend/`). Es el único componente con credenciales de la base de datos y de Storage. |
| **Almacenamiento** | Supabase Storage | Solo archivos privados: bucket `materials` (PDF y PPTX, máx. 20 MB) y bucket `reading-audio` (audio webm, ogg, mp4 y wav, máx. 10 MB). Supabase no guarda datos de la aplicación ni autentica. |

Reglas:
1. **Todo acceso a PostgreSQL pasa exclusivamente por el backend.** El navegador nunca recibe `DATABASE_URL` ni se conecta a la base. No hay Row Level Security, roles `anon`/`authenticated`, PostgREST ni suscripciones de base de datos: la autorización vive en el código del backend.
2. En cada petición el backend valida el token de sesión de Foundathyon, resuelve el usuario, verifica el rol (`teacher` o `student`) y la pertenencia al aula: el docente con `classrooms.teacher_id` y el alumno con `classroom_members.student_id`. Omite `syllabus_topics.material_text` en las respuestas dirigidas a alumnos.
3. **Alta del perfil:** la primera vez que el backend valida la sesión de un usuario, ejecuta `INSERT INTO public.profiles (id, role, full_name) ... ON CONFLICT (id) DO NOTHING`, con rol `student`. No existen triggers automáticos sobre tablas de autenticación. Un docente se asciende con `UPDATE public.profiles SET role = 'teacher' WHERE id = '<uuid>'` ejecutado por un administrador.
4. **Funciones SQL:** reciben el UUID del usuario desde el backend: `public.regenerate_invite_code(p_classroom_id uuid, p_teacher_id uuid)` y `public.join_classroom(p_code text, p_student_id uuid)`. El cliente nunca las llama.
5. **Archivos:** el frontend no sube ni descarga nada directo de Supabase. El backend sube los binarios y genera URLs firmadas con `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`. Los buckets son privados y sin políticas para clientes.
6. **Ranking en vivo:** el frontend consulta `GET /api/math/leaderboard` cada pocos segundos mientras la pantalla está abierta. No usa Realtime.
7. Cambios de esquema como migraciones SQL versionadas en `supabase/migrations/`. Existen `0001_core_schema.sql` (perfiles, aulas, temas, datos del alumno, funciones SQL y buckets) y `0002_adaptive_engine.sql` (motor adaptativo). Se aplican a Foundathyon PostgreSQL. El bloque de buckets del final de `0001` solo existe en Supabase y se ejecuta allí (ver `supabase/README.md`). `supabase/local/auth_stub.sql` ayuda a probarlas en un Postgres local.

Variables de entorno (detalle en `API_CONTRACT.md` y en cada `.env.example`):

| Dónde | Variables |
|---|---|
| `backend/` (Render) | `DATABASE_URL`, `FOUNDATHYON_JWT_SECRET`, `FOUNDATHYON_JWT_ALGORITHM`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `CORS_ORIGINS` |
| `frontend/web/` (Vercel) | `VITE_API_URL`, `VITE_FOUNDATHYON_AUTH_URL`, `VITE_DEMO_MODE` |
## 5. Regla de Oro de IA

**Feyn nunca inventa el rumbo del curso.** Todo contenido, explicación, lectura temática y evaluación se ancla estrictamente al temario y al material que subió el profesor.

Implementación obligatoria:
1. Cada llamada a Gemini que genere contenido académico recibe como contexto el `topic` y el texto extraído de sus materiales (`syllabus_topics` y su material asociado). Si el tema no tiene material, el backend responde `422` con `code: "NO_TEACHER_MATERIAL"` y no genera nada.
2. El prompt de sistema prohíbe usar conocimiento externo para afirmar contenido del curso. Los gustos del alumno solo cambian los **ejemplos y la forma**, nunca el **contenido**.
3. Las respuestas de Feyn incluyen `grounding`: fragmentos del material usados (`source_id` y cita corta). Una respuesta sin `grounding` válido no se muestra al alumno.
4. En el chat Feynman, si el alumno pregunta algo fuera del temario, Feyn lo dice y lo redirige al tema activo.
5. Las evaluaciones y los diagnósticos usan solo temas del ciclo y los temas previos declarados por el docente.

## 6. Flujos principales

1. **Material:** el docente sube PDF/PPTX → `POST /api/materials/upload` → el backend guarda el archivo en Supabase Storage (bucket `materials`), extrae el texto y lo guarda ligado al tema en PostgreSQL.
2. **Lección adaptada:** `POST /api/lessons/adapt` con tema, intereses y modalidad. Gemini recibe el texto del docente y devuelve la explicación en el formato pedido.
3. **Lectura:** `POST /api/reading/generate` → el alumno lee en voz alta (MediaRecorder) → `POST /api/reading/evaluate-audio`.
4. **Feyn:** `POST /api/feyn/chat` por turnos. El estado de la sesión se guarda en `feyn_sessions`.
5. **Juego rápido:** el frontend envía las respuestas al backend, que calcula el puntaje y lo escribe en `math_game_scores`. Los clientes del aula ven el ranking al consultar `GET /api/math/leaderboard` de forma periódica.
6. **Anti-trampa:** el frontend detecta `visibilitychange`, pérdida de foco y atajos de captura durante el diagnóstico y manda los eventos con la entrega. El backend los guarda y los marca en el reporte. El navegador no puede impedir una captura de pantalla: la regla es detectar, avisar, invalidar el intento y registrarlo.

## 7. Pendientes abiertos

1. **`frontend/web/DESIGN.md`:** todavía describe el FAB de Feyn en azul (`bg-blue-500`, secciones 1.2, 3.3 y 5.2). Actualizarlo al ámbar `#FBBF24`. En `FeynChatFab.tsx` quedan clases azules sueltas (`hover:bg-blue-600`, `shadow-blue-500/30`) que deben pasar a ámbar.
2. **TypeScript estricto:** `strict` no está activo en `tsconfig.app.json`.
3. **`backend/requirements.txt`** contiene dependencias ajenas al proyecto.
4. **Validación del token de Foundathyon:** `core/security.py` asume un JWT firmado con `FOUNDATHYON_JWT_SECRET` (algoritmo `FOUNDATHYON_JWT_ALGORITHM`, HS256 por defecto) cuyo `sub` es el UUID del usuario. Hay que confirmar con la documentación de Foundathyon el mecanismo real (firma, claims y, si aplica, consulta a `api.foundathyon.com`). El backend ya usa `DATABASE_URL`, crea el perfil en el primer acceso y deja `supabase` solo para Storage (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).
5. **Frontend:** `services/auth.ts` es una simulación. Falta el cliente real de Foundathyon Auth y los endpoints de datos de `API_CONTRACT.md` §3.

Resueltos: ruta del frontend fijada en `frontend/web/`, carpetas `pages/`, `services/`, `hooks/` y `types/` creadas, `.env` fuera de git.

