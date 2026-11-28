# Base de datos (Supabase)

Esquema de Synapz como migraciones SQL. Espejo de `API_CONTRACT.md` §1 y §3.

| Archivo | Contenido |
|---|---|
| `migrations/0001_core_schema.sql` | Perfiles, aulas, temas, datos del alumno, RLS, privilegios, RPC, Realtime y buckets |
| `migrations/0002_adaptive_engine.sql` | Motor adaptativo PISA (`student_abilities`, `student_socioemotional`, `game_attempts`) |
| `local/auth_stub.sql` | Solo para Postgres local sin Supabase. No hace nada si detecta Supabase |

## Cómo aplicarlas

- **Supabase (SQL Editor o CLI):** ejecutar `0001` y después `0002`, en ese orden. Una migración aplicada no se edita: los cambios van en un archivo nuevo (`0003_...`).
- **Postgres local:** `psql -f local/auth_stub.sql`, luego `0001` y `0002`.

`auth.users` no se crea aquí: lo crea Supabase Auth. Las migraciones solo lo referencian y le añaden un trigger.

## Usuarios y roles

1. El usuario se registra con Supabase Auth (`signUp`). Un trigger crea su fila en `profiles` con rol `student`. El rol nunca se toma de `user_metadata`, porque el cliente lo controla.
2. Para ascender a un docente, desde el SQL Editor (rol `postgres`) o con `service_role`:

   ```sql
   update public.profiles set role = 'teacher'
   where id = (select id from auth.users where email = 'docente@escuela.mx');
   ```

3. Otro trigger copia el rol a `app_metadata.role` del JWT, que es lo que lee el backend (`core/security.py`). El cambio llega al token cuando el usuario renueva la sesión (`supabase.auth.refreshSession()`). Tras registrarse, conviene renovarla una vez.
4. Un alumno se une a un aula con `supabase.rpc("join_classroom", { code })`. El docente crea el aula con un `insert` en `classrooms` y regenera el código con `rpc("regenerate_invite_code", { classroom_id })`.

## Qué puede hacer el cliente

| Tabla | Cliente (`authenticated`) | Escribe el backend |
|---|---|---|
| `profiles` | Lee lo suyo (y el docente, a sus alumnos). Edita `full_name`, `interests`, `onboarding_completed` | Rol |
| `classrooms` | El docente dueño crea, edita (sin `invite_code`) y borra. Los miembros leen | `invite_code` (trigger) |
| `classroom_members` | Lee su aula | Alta (RPC), `bonus_points` |
| `syllabus_topics` | El docente dueño hace CRUD (sin `material_text`). Los miembros leen | `material_text`, `material_files` |
| `math_game_scores` | Lectura para el aula y su docente | Todas las escrituras |
| Resto de tablas | Solo lectura de lo propio | Todas las escrituras |

Consecuencia: ningún cliente puede insertar puntajes, diagnósticos ni avances. Todo pasa por FastAPI con `service_role`.

**`syllabus_topics` no admite `select *`.** `material_text` solo lo lee el backend, así que desde el cliente hay que listar las columnas: `.select("id, classroom_id, title, kind, scheduled_date, status, position, material_files")`.

## Realtime y Storage

- Publicación `supabase_realtime`: `math_game_scores` (ranking) y `classroom_members` (puntos extra). Las políticas de RLS se aplican a las suscripciones.
- Buckets privados: `materials` (PDF y PPTX, 20 MB) y `reading-audio` (audio, 10 MB). No tienen políticas en `storage.objects`: el cliente no accede, el backend sube y firma URLs.

## Claves

`SUPABASE_KEY` del backend es la `service_role`: omite RLS y nunca debe llegar al frontend ni a GitHub. El frontend usa solo la clave `anon` y el JWT del usuario.
