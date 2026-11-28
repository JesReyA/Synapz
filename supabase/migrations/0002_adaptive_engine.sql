-- ============================================================================
-- Synapz: Motor adaptativo PISA adaptado para PostgreSQL en Foundathyon
-- ============================================================================

create table public.student_abilities (
  student_id       uuid         not null references public.profiles (id) on delete cascade,
  domain_id        text         not null check (domain_id in ('MATH', 'READ', 'SCIE', 'COMP')),
  theta            numeric(6,4) not null default 0 check (theta between -3.5 and 3.5),
  items_completed  integer      not null default 0 check (items_completed >= 0),
  updated_at       timestamptz  not null default now(),
  primary key (student_id, domain_id)
);

create table public.student_socioemotional (
  student_id               uuid         primary key references public.profiles (id) on delete cascade,
  anxiety_index            numeric(5,3) not null default 0 check (anxiety_index between -3 and 3),
  self_efficacy_index      numeric(5,3) not null default 0 check (self_efficacy_index between -3 and 3),
  perseverance_index       numeric(5,3) not null default 0 check (perseverance_index between -3 and 3),
  metacognition_index      numeric(5,3) not null default 0 check (metacognition_index between -3 and 3),
  hide_timers              boolean      not null default false,
  auto_enable_scaffolding  boolean      not null default false,
  updated_at               timestamptz  not null default now()
);

create table public.game_attempts (
  id               uuid         primary key default gen_random_uuid(),
  student_id       uuid         not null references public.profiles (id) on delete cascade,
  game_id          text         not null check (game_id in (
                     'batalla', 'calculo', 'sudoku', 'quince', 'buscaminas', 'tangram', 'tetris', 'memorama')),
  domain_id        text         not null check (domain_id in ('MATH', 'READ', 'SCIE', 'COMP')),
  process_id       text         not null,
  level            text,
  completed        boolean      not null,
  beta             numeric(6,4) not null,
  score_ratio      numeric(5,4) not null check (score_ratio between 0 and 1),
  is_rapid_guess   boolean      not null default false,
  theta_before     numeric(6,4) not null,
  theta_after      numeric(6,4) not null,
  general_metrics  jsonb        not null default '{}'::jsonb,
  game_metrics     jsonb        not null default '{}'::jsonb,
  events           jsonb        not null default '[]'::jsonb,
  created_at       timestamptz  not null default now()
);

create index game_attempts_student_recent_idx on public.game_attempts (student_id, created_at desc);

-- Triggers para mantener actualizado `updated_at` (usa la función creada en el esquema base)
create trigger student_abilities_touch before update on public.student_abilities
  for each row execute function public.touch_updated_at();

create trigger student_socioemotional_touch before update on public.student_socioemotional
  for each row execute function public.touch_updated_at();