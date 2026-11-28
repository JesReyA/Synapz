# Base de datos (Foundathyon PostgreSQL) y almacenamiento (Supabase Storage)

Esquema de Synapz como migraciones SQL. Espejo de `API_CONTRACT.md` §1.

La arquitectura es híbrida:

| Qué | Dónde |
|---|---|
| Autenticación | **Foundathyon Auth** (`api.foundathyon.com`): Google OAuth2 y correo con contraseña |
| Base de datos | **Foundathyon PostgreSQL** (`DATABASE_URL`) |
| Archivos privados | **Supabase Storage** (buckets `materials` y `reading-audio`) |
| Acceso a todo lo anterior | Solo el backend en Python (`backend/`, desplegado en Render) |

La carpeta conserva el nombre `supabase/` por historia. Supabase ya no autentica ni guarda datos: solo almacena archivos.

| Archivo | Contenido |
|---|---|
| `migrations/0001_core_schema.sql` | Perfiles, aulas, temas, datos del alumno, funciones SQL y, al final, el alta de los buckets de Storage |
| `migrations/0002_adaptive_engine.sql` | Motor adaptativo PISA (`student_abilities`, `student_socioemotional`, `game_attempts`) |
| `local/auth_stub.sql` | Solo para pruebas en un Postgres local sin Supabase (ver más abajo) |

## Cómo aplicarlas

- **Foundathyon PostgreSQL:** ejecutar `0001` y después `0002`, en ese orden, con la `DATABASE_URL` del proyecto:

  ```bash
  psql "$DATABASE_URL" -f supabase/migrations/0001_core_schema.sql
  psql "$DATABASE_URL" -f supabase/migrations/0002_adaptive_engine.sql
  ```

  El bloque final de `0001` (secciones de buckets) inserta en `storage.buckets`, un esquema que solo existe en Supabase. En la base de Foundathyon no aplica: hay que dejarlo fuera al ejecutar `0001` y correrlo aparte en el SQL Editor del proyecto de **Supabase**. Está pendiente separarlo en su propio archivo (`API_CONTRACT.md` §4).
- Una migración aplicada no se edita: los cambios van en un archivo nuevo (`0003_...`).
- **Postgres local:** crear una base vacía, ejecutar `psql -f local/auth_stub.sql` (crea `storage.buckets`, necesario para el bloque de buckets) y luego `0001` y `0002`. El stub también crea objetos de Supabase (`auth`, roles, `supabase_realtime`) que las migraciones ya no usan.

Las migraciones no crean ni referencian `auth.users`: `profiles.id` es el UUID que entrega Foundathyon Auth y no tiene clave foránea hacia otro esquema.

## Usuarios y roles

1. El usuario inicia sesión en Foundathyon Auth (Google OAuth2 o correo y contraseña) y el frontend envía el token de sesión al backend.
2. La primera vez que el backend valida la sesión de un usuario, crea su perfil:

   ```sql
   INSERT INTO public.profiles (id, role, full_name)
   VALUES (:id, 'student', :full_name)
   ON CONFLICT (id) DO NOTHING;
   ```

   Todo usuario nuevo nace `student`. No hay triggers automáticos sobre tablas de autenticación. El rol no se toma del token ni de lo que envía el cliente.
3. Para ascender a un docente, un administrador ejecuta en la base de Foundathyon, con el UUID del usuario:

   ```sql
   UPDATE public.profiles SET role = 'teacher' WHERE id = '<uuid-del-usuario>';
   ```

4. El backend lee el rol de `public.profiles.role` en cada petición, así que el cambio se aplica sin que el usuario renueve la sesión.
5. Un alumno se une a un aula con `POST /api/classrooms/join`, que llama a `public.join_classroom(p_code text, p_student_id uuid)`. El docente crea el aula con `POST /api/classrooms` (un trigger genera el `invite_code`) y regenera el código con `POST /api/classrooms/{id}/invite-code`, que llama a `public.regenerate_invite_code(p_classroom_id uuid, p_teacher_id uuid)`. En ambos casos el backend pasa el UUID del usuario tomado del token ya validado.

## Seguridad y acceso a datos

No hay Row Level Security, ni roles `anon` y `authenticated`, ni PostgREST. La base no se expone al navegador: **todo acceso pasa por el backend**, que en cada petición:

1. Valida el token de sesión de Foundathyon.
2. Verifica el rol (`teacher` o `student`).
3. Verifica la pertenencia al aula: `classrooms.teacher_id` para el docente y `classroom_members.student_id` para el alumno.
4. Omite `syllabus_topics.material_text` en las respuestas dirigidas a alumnos.

Consecuencia: quien tenga `DATABASE_URL` puede leer y escribir todo. Debe existir solo en las variables de entorno del backend (Render) y usarse con un usuario de base de datos exclusivo de la aplicación. No debe llegar al frontend ni a GitHub.

| Tabla | Quién escribe | Quién lee (siempre a través del backend) |
|---|---|---|
| `profiles` | El backend crea la fila. El usuario edita `full_name`, `interests` y `onboarding_completed`. El rol solo lo cambia un administrador | El propio usuario. El docente, nombre de sus alumnos |
| `classrooms` | El docente dueño. `invite_code` lo asigna el trigger | El docente dueño y los alumnos miembros |
| `classroom_members` | `join_classroom` y el backend (`bonus_points`) | El docente dueño y el propio alumno |
| `syllabus_topics` | El docente dueño. `material_text` y `material_files` solo los escribe el backend al subir material | El docente dueño y los alumnos miembros, sin `material_text` |
| `math_game_scores` | El backend | Los miembros del aula (ranking, con nombres abreviados) y su docente |
| Resto de tablas | El backend | El alumno solo ve lo propio. El docente, lo de sus aulas mediante reportes |

El ranking en vivo no usa suscripciones de base de datos: el frontend consulta `GET /api/math/leaderboard` cada pocos segundos.

## Storage

Supabase se usa únicamente como almacenamiento de archivos privados:

| Bucket | Contenido | Tipos | Límite |
|---|---|---|---|
| `materials` | Material del docente | PDF y PPTX | 20 MB |
| `reading-audio` | Grabaciones de lectura | webm, ogg, mp4 y wav | 10 MB |

Los dos son privados y no tienen políticas en `storage.objects`: ningún cliente accede. El frontend no sube ni descarga directamente. El backend sube los binarios y genera URLs firmadas de corta duración con `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY`.

## Variables de entorno (solo `backend/`)

| Variable | Uso |
|---|---|
| `DATABASE_URL` | Conexión a Foundathyon PostgreSQL |
| `FOUNDATHYON_JWT_SECRET` y `FOUNDATHYON_JWT_ALGORITHM` | Validación del token de sesión de Foundathyon (HS256 por defecto). El mecanismo exacto está por confirmar con Foundathyon |
| `SUPABASE_URL` | Proyecto de Supabase, solo Storage |
| `SUPABASE_SERVICE_ROLE_KEY` | Clave `service_role` de Supabase, solo Storage. Nunca en el frontend |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Gemini |
| `CORS_ORIGINS` | Orígenes permitidos del frontend |

El frontend no necesita ninguna de las claves anteriores.