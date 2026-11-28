-- ============================================================================
-- Synapz: Esquema adaptado para PostgreSQL en Foundathyon
-- ============================================================================

-- 1. Tablas
create table public.profiles (
  id                    uuid        primary key, -- Mismo UUID entregado por Foundathyon Auth
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
  score             numeric     check (score between 0 and 100),
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
  comprehension_score  numeric     check (comprehension_score between 0 and 100),
  created_at           timestamptz not null default now()
);
create index reading_sessions_student_idx on public.reading_sessions (student_id, created_at desc);
create index reading_sessions_classroom_idx on public.reading_sessions (classroom_id);
create index reading_sessions_topic_idx on public.reading_sessions (topic_id);

create table public.math_game_scores (
  id            uuid        primary key default gen_random_uuid(),
  classroom_id  uuid        not null references public.classrooms (id) on delete cascade,
  student_id    uuid        not null references public.profiles (id) on delete cascade,
  game_id       uuid        not null,
  points        integer     not null check (points >= 0),
  correct       integer     not null check (correct >= 0),
  total         integer     not null check (total >= 0),
  duration_ms   integer     not null check (duration_ms >= 0),
  created_at    timestamptz not null default now(),
  check (correct <= total),
  unique (student_id, game_id)
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
  understood  boolean,
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
-- 2. Funciones y Triggers (Códigos de invitación y timestamps)
-- ============================================================================

create function public.generate_invite_code() returns text
language plpgsql volatile set search_path = '' as $$
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

create function public.set_invite_code() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.invite_code := public.generate_invite_code();
  return new;
end
$$;

create trigger classrooms_set_invite_code
  before insert on public.classrooms
  for each row execute function public.set_invite_code();

-- El backend pasa p_teacher_id extraído del JWT validado de Foundathyon
create function public.regenerate_invite_code(p_classroom_id uuid, p_teacher_id uuid) returns text
language plpgsql set search_path = '' as $$
declare
  v_code text;
begin
  update public.classrooms c
     set invite_code = public.generate_invite_code()
   where c.id = p_classroom_id
     and c.teacher_id = p_teacher_id
  returning c.invite_code into v_code;

  if v_code is null then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;
  return v_code;
end
$$;

-- El backend pasa p_student_id extraído del JWT validado de Foundathyon
create function public.join_classroom(p_code text, p_student_id uuid) returns uuid
language plpgsql set search_path = '' as $$
declare
  v_classroom uuid;
begin
  if not exists (select 1 from public.profiles p where p.id = p_student_id and p.role = 'student') then
    raise exception 'FORBIDDEN' using errcode = '42501';
  end if;

  select c.id into v_classroom
    from public.classrooms c
   where c.invite_code = upper(btrim(p_code));

  if v_classroom is null then
    raise exception 'NOT_FOUND' using errcode = 'P0002';
  end if;

  insert into public.classroom_members (classroom_id, student_id)
  values (v_classroom, p_student_id)
  on conflict do nothing;

  return v_classroom;
end
$$;

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




  -----------------------------------------------------------
  -- SECCION DE BUCKETS DE SUPABASE PARA PPTX, PDF y DEMAS
  --------------------------------------------------------------

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