-- Synapz: esquema base. Espejo de API_CONTRACT.md §1 y §3.
--
-- Modelo de acceso:
--   * `auth.users` lo crea y gestiona Supabase Auth. Esta migración NO lo crea: lo referencia
--     y le añade un trigger que crea el perfil de cada usuario nuevo.
--   * El rol (`teacher` | `student`) vive en `profiles.role` y se copia a `app_metadata.role`
--     del JWT. Todo usuario nuevo es `student`: el rol NO se toma de lo que envía el cliente.
--     Para ascender a un docente (solo desde el panel de Supabase o con `service_role`):
--       update public.profiles set role = 'teacher'
--       where id = (select id from auth.users where email = 'docente@escuela.mx');
--     El cambio llega al JWT cuando el usuario renueva su sesión.
--   * RLS activo en todas las tablas. El cliente (`authenticated`) solo lee lo suyo y solo
--     escribe lo que indica API_CONTRACT.md §3. Todo lo demás lo escribe el backend con
--     `service_role`, que omite RLS: puntajes, diagnósticos, lecturas, Feyn y material.
--   * `anon` no tiene acceso a nada.
--
-- Aviso para el frontend: `syllabus_topics.material_text` no es legible por el cliente (solo el
-- backend lo lee). Con supabase-js no se puede usar `.select()` ni `select=*` sobre esa tabla;
-- hay que listar las columnas.

-- ============================================================================
-- 1. Tablas
-- ============================================================================

create table public.profiles (
  id                    uuid        primary key references auth.users (id) on delete cascade,
  role                  text        not null default 'student' check (role in ('teacher', 'student')),
  full_name             text        not null default '',
  interests             jsonb       not null default '{}'::jsonb check (jsonb_typeof(interests) = 'object'),
  onboarding_completed  boolean     not null default false,
  created_at            timestamptz not null default now()
);

create table public.classrooms (
  id            uuid        primary key default gen_random_uuid(),
  teacher_id    uuid        not null references public.profiles (id) on delete cascade,
  name          text        not null,
  subject       text        not null,
  grade_group   text        not null,
  subject_area  text        not null check (subject_area in ('math', 'reading', 'science')),
  invite_code   text        not null unique check (invite_code ~ '^[A-Z2-9]{6}$'),
  created_at    timestamptz not null default now()
);
create index classrooms_teacher_idx on public.classrooms (teacher_id);

create table public.classroom_members (
  classroom_id  uuid        not null references public.classrooms (id) on delete cascade,
  student_id    uuid        not null references public.profiles (id) on delete cascade,
  joined_at     timestamptz not null default now(),
  bonus_points  integer     not null default 0 check (bonus_points >= 0),
  primary key (classroom_id, student_id)
);
create index classroom_members_student_idx on public.classroom_members (student_id);

create table public.syllabus_topics (
  id              uuid    primary key default gen_random_uuid(),
  classroom_id    uuid    not null references public.classrooms (id) on delete cascade,
  title           text    not null,
  kind            text    not null check (kind in ('cycle', 'prerequisite')),
  scheduled_date  date,
  status          text    not null default 'pending' check (status in ('pending', 'taught', 'review')),
  position        integer not null default 0,
  material_text   text    not null default '',
  material_files  jsonb   not null default '[]'::jsonb check (jsonb_typeof(material_files) = 'array')
);
create index syllabus_topics_classroom_idx on public.syllabus_topics (classroom_id, position);

create table public.student_diagnostics (
  id                uuid        primary key default gen_random_uuid(),
  student_id        uuid        not null references public.profiles (id) on delete cascade,
  classroom_id      uuid        not null references public.classrooms (id) on delete cascade,
  type              text        not null check (type in ('prior_knowledge', 'mental_math')),
  score             numeric     check (score between 0 and 100), -- null hasta que se entrega
  detail            jsonb       not null default '{}'::jsonb,
  integrity_events  jsonb       not null default '[]'::jsonb,
  invalidated       boolean     not null default false,
  created_at        timestamptz not null default now()
);
create index student_diagnostics_student_idx on public.student_diagnostics (student_id, classroom_id, created_at desc);
create index student_diagnostics_classroom_idx on public.student_diagnostics (classroom_id);

create table public.reading_sessions (
  id                   uuid        primary key default gen_random_uuid(),
  student_id           uuid        not null references public.profiles (id) on delete cascade,
  classroom_id         uuid        not null references public.classrooms (id) on delete cascade,
  topic_id             uuid        not null references public.syllabus_topics (id) on delete cascade,
  mode                 text        not null check (mode in ('comprehension', 'cloze')),
  text                 text        not null,
  questions            jsonb       not null default '[]'::jsonb,
  answers              jsonb       not null default '[]'::jsonb,
  audio_attempts       jsonb       not null default '[]'::jsonb,
  best_audio_score     numeric     check (best_audio_score between 0 and 100),
  comprehension_score  numeric     check (comprehension_score between 0 and 100), -- null hasta comprobar
  created_at           timestamptz not null default now()
);
create index reading_sessions_student_idx on public.reading_sessions (student_id, created_at desc);
create index reading_sessions_classroom_idx on public.reading_sessions (classroom_id);
create index reading_sessions_topic_idx on public.reading_sessions (topic_id);

create table public.math_game_scores (
  id            uuid        primary key default gen_random_uuid(),
  classroom_id  uuid        not null references public.classrooms (id) on delete cascade,
  student_id    uuid        not null references public.profiles (id) on delete cascade,
  game_id       uuid        not null, -- id de la partida (GET /api/math/quick-game)
  points        integer     not null check (points >= 0),
  correct       integer     not null check (correct >= 0),
  total         integer     not null check (total >= 0),
  duration_ms   integer     not null check (duration_ms >= 0),
  created_at    timestamptz not null default now(),
  check (correct <= total),
  unique (student_id, game_id) -- una partida solo puntúa una vez
);
create index math_game_scores_classroom_idx on public.math_game_scores (classroom_id, created_at desc);

create table public.feyn_sessions (
  id            uuid        primary key default gen_random_uuid(),
  student_id    uuid        not null references public.profiles (id) on delete cascade,
  classroom_id  uuid        not null references public.classrooms (id) on delete cascade,
  topic_id      uuid        not null references public.syllabus_topics (id) on delete cascade,
  messages      jsonb       not null default '[]'::jsonb,
  struggles     text[]      not null default '{}',
  mastered      boolean     not null default false,
  coverage      numeric     not null default 0 check (coverage between 0 and 1),
  updated_at    timestamptz not null default now()
);
create index feyn_sessions_student_topic_idx on public.feyn_sessions (student_id, topic_id);
create index feyn_sessions_classroom_idx on public.feyn_sessions (classroom_id);

create table public.lesson_events (
  id          uuid        primary key default gen_random_uuid(),
  student_id  uuid        not null references public.profiles (id) on delete cascade,
  topic_id    uuid        not null references public.syllabus_topics (id) on delete cascade,
  modality    text        not null check (modality in ('visual', 'reading', 'auditory')),
  understood  boolean, -- null hasta que el alumno responde
  created_at  timestamptz not null default now()
);
create index lesson_events_topic_idx on public.lesson_events (topic_id, created_at);
create index lesson_events_student_idx on public.lesson_events (student_id);

create table public.topic_score_events (
  id           uuid        primary key default gen_random_uuid(),
  student_id   uuid        not null references public.profiles (id) on delete cascade,
  topic_id     uuid        not null references public.syllabus_topics (id) on delete cascade,
  score        numeric     not null check (score between 0 and 100),
  source       text        not null check (source in ('diagnostic', 'reading', 'quiz', 'feyn', 'lesson')),
  recorded_at  timestamptz not null default now()
);
create index topic_score_events_series_idx on public.topic_score_events (student_id, topic_id, recorded_at);
create index topic_score_events_topic_idx on public.topic_score_events (topic_id);

create table public.activity_days (
  student_id  uuid not null references public.profiles (id) on delete cascade,
  day         date not null default current_date,
  primary key (student_id, day)
);

create table public.bonus_point_events (
  id            uuid        primary key default gen_random_uuid(),
  classroom_id  uuid        not null,
  student_id    uuid        not null,
  teacher_id    uuid        not null references public.profiles (id) on delete cascade,
  points        integer     not null check (points between 1 and 50),
  reason        text        not null default '' check (char_length(reason) <= 140),
  created_at    timestamptz not null default now(),
  -- Solo se otorgan puntos a quien es miembro del aula.
  foreign key (classroom_id, student_id)
    references public.classroom_members (classroom_id, student_id) on delete cascade
);
create index bonus_point_events_member_idx on public.bonus_point_events (classroom_id, student_id);
create index bonus_point_events_teacher_idx on public.bonus_point_events (teacher_id);

create table public.remedial_sets (
  id                  uuid        primary key default gen_random_uuid(),
  student_id          uuid        not null references public.profiles (id) on delete cascade,
  classroom_id        uuid        not null references public.classrooms (id) on delete cascade,
  topic_id            uuid        not null references public.syllabus_topics (id) on delete cascade,
  title               text        not null,
  exercises           jsonb       not null default '[]'::jsonb check (jsonb_typeof(exercises) = 'array'),
  best_first_try_pct  numeric     not null default 0 check (best_first_try_pct between 0 and 100),
  attempts            integer     not null default 0 check (attempts >= 0),
  updated_at          timestamptz not null default now()
);
create index remedial_sets_student_idx on public.remedial_sets (student_id, classroom_id);
create index remedial_sets_topic_idx on public.remedial_sets (topic_id);

create table public.strategies (
  id            uuid        primary key default gen_random_uuid(),
  classroom_id  uuid        not null references public.classrooms (id) on delete cascade,
  topic_id      uuid        references public.syllabus_topics (id) on delete set null,
  description   text        not null,
  applied_at    timestamptz not null default now()
);
create index strategies_classroom_idx on public.strategies (classroom_id, applied_at);

-- ============================================================================
-- 2. Funciones de apoyo para las políticas
-- ============================================================================
-- `security definer` evita la recursión de RLS entre tablas que se consultan entre sí.
-- Todas fijan `search_path` vacío y califican cada objeto con su esquema.

create function public.is_teacher() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'teacher')
$$;

create function public.is_student() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'student')
$$;

create function public.owns_classroom(p_classroom_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.classrooms c where c.id = p_classroom_id and c.teacher_id = auth.uid()
  )
$$;

create function public.is_classroom_member(p_classroom_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.classroom_members m
    where m.classroom_id = p_classroom_id and m.student_id = auth.uid()
  )
$$;

create function public.teaches_student(p_student_id uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1
    from public.classroom_members m
    join public.classrooms c on c.id = m.classroom_id
    where m.student_id = p_student_id and c.teacher_id = auth.uid()
  )
$$;

-- ============================================================================
-- 3. Código de invitación y RPC (API_CONTRACT.md §3)
-- ============================================================================

-- 6 caracteres sin 0, 1, I ni O. Usa bytes de gen_random_uuid() (criptográficamente
-- aleatorios); se toman los 6 primeros, que no incluyen los bits fijos de la versión UUID.
create function public.generate_invite_code() returns text
language plpgsql volatile security definer set search_path = '' as $$
declare
  alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  bytes bytea;
  code  text;
  i     integer;
begin
  loop
    bytes := uuid_send(gen_random_uuid());
    code := '';
    for i in 0..5 loop
      code := code || substr(alphabet, (get_byte(bytes, i) % 32) + 1, 1);
    end loop;
    exit when not exists (select 1 from public.classrooms c where c.invite_code = code);
  end loop;
  return code;
end
$$;

-- Siempre genera el código al crear el aula; un valor enviado por el cliente se descarta.
create function public.set_invite_code() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  new.invite_code := public.generate_invite_code();
  return new;
end
$$;

create trigger classrooms_set_invite_code
  before insert on public.classrooms
  for each row execute function public.set_invite_code();

-- El código anterior deja de funcionar al instante.
create function public.regenerate_invite_code(classroom_id uuid) returns text
language plpgsql security definer set search_path = '' as $$
declare
  v_code text;
begin
  update public.classrooms c
     set invite_code = public.generate_invite_code()
   where c.id = regenerate_invite_code.classroom_id
     and c.teacher_id = auth.uid()
  returning c.invite_code into v_code;

  if v_code is null then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  return v_code;
end
$$;

-- Devuelve el id del aula. Solo alumnos. Si ya es miembro, no hace nada.
create function public.join_classroom(code text) returns uuid
language plpgsql security definer set search_path = '' as $$
declare
  v_classroom uuid;
begin
  if not public.is_student() then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  select c.id into v_classroom
    from public.classrooms c
   where c.invite_code = upper(btrim(join_classroom.code));

  if v_classroom is null then
    raise exception 'NOT_FOUND' using errcode = 'P0002';
  end if;

  insert into public.classroom_members (classroom_id, student_id)
  values (v_classroom, auth.uid())
  on conflict do nothing;

  return v_classroom;
end
$$;

-- ============================================================================
-- 4. Usuarios: perfil automático y rol en el JWT
-- ============================================================================

-- Todo usuario nuevo es `student`, sin importar lo que envíe en `user_metadata`.
create function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(btrim(new.raw_user_meta_data ->> 'full_name'), ''))
  on conflict (id) do nothing;
  return new;
end
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Copia el rol a `app_metadata`, que el cliente no puede modificar (a diferencia de user_metadata).
create function public.sync_profile_role() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  update auth.users u
     set raw_app_meta_data = coalesce(u.raw_app_meta_data, '{}'::jsonb)
                             || jsonb_build_object('role', new.role)
   where u.id = new.id;
  return null;
end
$$;

create trigger profiles_sync_role
  after insert or update of role on public.profiles
  for each row execute function public.sync_profile_role();

create function public.touch_updated_at() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end
$$;

create trigger feyn_sessions_touch before update on public.feyn_sessions
  for each row execute function public.touch_updated_at();
create trigger remedial_sets_touch before update on public.remedial_sets
  for each row execute function public.touch_updated_at();

-- ============================================================================
-- 5. Row Level Security
-- ============================================================================

alter table public.profiles            enable row level security;
alter table public.classrooms          enable row level security;
alter table public.classroom_members   enable row level security;
alter table public.syllabus_topics     enable row level security;
alter table public.student_diagnostics enable row level security;
alter table public.reading_sessions    enable row level security;
alter table public.math_game_scores    enable row level security;
alter table public.feyn_sessions       enable row level security;
alter table public.lesson_events       enable row level security;
alter table public.topic_score_events  enable row level security;
alter table public.activity_days       enable row level security;
alter table public.bonus_point_events  enable row level security;
alter table public.remedial_sets       enable row level security;
alter table public.strategies          enable row level security;

-- profiles: cada quien lee y edita lo suyo; el docente lee a los alumnos de sus aulas.
create policy "read own profile" on public.profiles
  for select to authenticated using (id = (select auth.uid()));
create policy "teacher reads own students" on public.profiles
  for select to authenticated using (public.teaches_student(id));
create policy "update own profile" on public.profiles
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- classrooms: el docente dueño las administra; sus miembros las leen.
create policy "read own or joined classrooms" on public.classrooms
  for select to authenticated
  using (teacher_id = (select auth.uid()) or public.is_classroom_member(id));
create policy "teacher creates classroom" on public.classrooms
  for insert to authenticated
  with check (teacher_id = (select auth.uid()) and public.is_teacher());
create policy "teacher updates own classroom" on public.classrooms
  for update to authenticated
  using (teacher_id = (select auth.uid())) with check (teacher_id = (select auth.uid()));
create policy "teacher deletes own classroom" on public.classrooms
  for delete to authenticated using (teacher_id = (select auth.uid()));

-- classroom_members: se ingresa con join_classroom(); los miembros y el docente ven la lista.
create policy "read classroom members" on public.classroom_members
  for select to authenticated
  using (
    student_id = (select auth.uid())
    or public.owns_classroom(classroom_id)
    or public.is_classroom_member(classroom_id)
  );

-- syllabus_topics: el docente dueño hace CRUD; los miembros leen.
create policy "read topics of own or joined classrooms" on public.syllabus_topics
  for select to authenticated
  using (public.owns_classroom(classroom_id) or public.is_classroom_member(classroom_id));
create policy "teacher creates topics" on public.syllabus_topics
  for insert to authenticated with check (public.owns_classroom(classroom_id));
create policy "teacher updates topics" on public.syllabus_topics
  for update to authenticated
  using (public.owns_classroom(classroom_id)) with check (public.owns_classroom(classroom_id));
create policy "teacher deletes topics" on public.syllabus_topics
  for delete to authenticated using (public.owns_classroom(classroom_id));

-- Datos del alumno: solo lectura de lo propio. Escribe el backend.
create policy "student reads own diagnostics" on public.student_diagnostics
  for select to authenticated using (student_id = (select auth.uid()));
create policy "student reads own reading sessions" on public.reading_sessions
  for select to authenticated using (student_id = (select auth.uid()));
create policy "student reads own feyn sessions" on public.feyn_sessions
  for select to authenticated using (student_id = (select auth.uid()));
create policy "student reads own lesson events" on public.lesson_events
  for select to authenticated using (student_id = (select auth.uid()));
create policy "student reads own topic scores" on public.topic_score_events
  for select to authenticated using (student_id = (select auth.uid()));
create policy "student reads own activity days" on public.activity_days
  for select to authenticated using (student_id = (select auth.uid()));
create policy "student reads own remedial sets" on public.remedial_sets
  for select to authenticated using (student_id = (select auth.uid()));

-- Ranking: lo leen los miembros del aula y su docente (también por Realtime).
create policy "read classroom scores" on public.math_game_scores
  for select to authenticated
  using (public.owns_classroom(classroom_id) or public.is_classroom_member(classroom_id));

create policy "read own bonus events" on public.bonus_point_events
  for select to authenticated
  using (student_id = (select auth.uid()) or teacher_id = (select auth.uid()));

create policy "teacher reads own strategies" on public.strategies
  for select to authenticated using (public.owns_classroom(classroom_id));

-- ============================================================================
-- 6. Privilegios
-- ============================================================================
-- Se parte de cero y se concede solo lo necesario. Los privilegios por columna impiden que el
-- cliente cambie su rol, el código de invitación o el texto del material.

do $$
declare
  t text;
begin
  foreach t in array array[
    'profiles', 'classrooms', 'classroom_members', 'syllabus_topics', 'student_diagnostics',
    'reading_sessions', 'math_game_scores', 'feyn_sessions', 'lesson_events',
    'topic_score_events', 'activity_days', 'bonus_point_events', 'remedial_sets', 'strategies'
  ] loop
    execute format('revoke all on public.%I from anon, authenticated', t);
  end loop;
end
$$;

grant select on
  public.profiles, public.classrooms, public.classroom_members, public.student_diagnostics,
  public.reading_sessions, public.math_game_scores, public.feyn_sessions, public.lesson_events,
  public.topic_score_events, public.activity_days, public.bonus_point_events,
  public.remedial_sets, public.strategies
  to authenticated;

-- `material_text` queda fuera: solo el backend lo lee.
grant select (id, classroom_id, title, kind, scheduled_date, status, position, material_files)
  on public.syllabus_topics to authenticated;

grant update (full_name, interests, onboarding_completed) on public.profiles to authenticated;

grant insert (teacher_id, name, subject, grade_group, subject_area) on public.classrooms to authenticated;
grant update (name, subject, grade_group, subject_area) on public.classrooms to authenticated;
grant delete on public.classrooms to authenticated;

grant insert (classroom_id, title, kind, scheduled_date, status, position)
  on public.syllabus_topics to authenticated;
grant update (title, kind, scheduled_date, status, position) on public.syllabus_topics to authenticated;
grant delete on public.syllabus_topics to authenticated;

-- Funciones: las de apoyo y las RPC se llaman con la sesión del usuario; las internas, nunca.
revoke all on function
  public.is_teacher(), public.is_student(), public.owns_classroom(uuid),
  public.is_classroom_member(uuid), public.teaches_student(uuid),
  public.regenerate_invite_code(uuid), public.join_classroom(text),
  public.generate_invite_code(), public.set_invite_code(), public.handle_new_user(),
  public.sync_profile_role(), public.touch_updated_at()
  from public, anon, authenticated;

grant execute on function
  public.is_teacher(), public.is_student(), public.owns_classroom(uuid),
  public.is_classroom_member(uuid), public.teaches_student(uuid),
  public.regenerate_invite_code(uuid), public.join_classroom(text)
  to authenticated;

-- ============================================================================
-- 7. Realtime y Storage
-- ============================================================================

-- Ranking en vivo (§2.7, §2.11): puntajes nuevos y cambios de puntos extra.
do $$
declare
  t text;
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    foreach t in array array['math_game_scores', 'classroom_members'] loop
      if not exists (
        select 1 from pg_publication_tables
        where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = t
      ) then
        execute format('alter publication supabase_realtime add table public.%I', t);
      end if;
    end loop;
  end if;
end
$$;

-- Buckets privados y sin políticas en storage.objects: el cliente no accede; el backend
-- sube y firma URLs con service_role.
do $$
begin
  if to_regclass('storage.buckets') is not null then
    insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    values
      ('materials', 'materials', false, 20971520, array[
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
      ]),
      ('reading-audio', 'reading-audio', false, 10485760, array[
        'audio/webm', 'audio/ogg', 'audio/mp4', 'audio/wav'
      ])
    on conflict (id) do update
      set public = false,
          file_size_limit = excluded.file_size_limit,
          allowed_mime_types = excluded.allowed_mime_types;
  end if;
end
$$;

-- ============================================================================
-- 8. Usuarios que ya existían antes de esta migración
-- ============================================================================

insert into public.profiles (id, full_name)
select u.id, coalesce(btrim(u.raw_user_meta_data ->> 'full_name'), '')
from auth.users u
on conflict (id) do nothing;
