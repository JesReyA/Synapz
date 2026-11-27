-- SOLO PARA POSTGRES LOCAL SIN SUPABASE (pruebas de las migraciones).
-- Simula lo mínimo que Supabase ya trae: roles, `auth.users`, `auth.uid()`, `auth.jwt()`,
-- `storage.buckets` y la publicación `supabase_realtime`.
-- Si detecta Supabase (`auth.users` ya existe), no hace nada.
--
--   psql -f supabase/local/auth_stub.sql
--   psql -f supabase/migrations/0001_core_schema.sql
--   psql -f supabase/migrations/0002_adaptive_engine.sql
--
-- Para simular un usuario:
--   set role authenticated;
--   select set_config('request.jwt.claim.sub', '<uuid>', false);

do $stub$
begin
  if to_regclass('auth.users') is not null then
    raise notice 'Supabase detectado: auth_stub.sql no hace nada.';
    return;
  end if;

  create role anon nologin;
  create role authenticated nologin;
  create role service_role nologin bypassrls;

  create schema auth;
  create table auth.users (
    id                  uuid        primary key default gen_random_uuid(),
    email               text        unique,
    raw_app_meta_data   jsonb       not null default '{}'::jsonb,
    raw_user_meta_data  jsonb       not null default '{}'::jsonb,
    created_at          timestamptz not null default now()
  );

  create function auth.uid() returns uuid language sql stable as
    $f$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $f$;
  create function auth.jwt() returns jsonb language sql stable as
    $f$ select jsonb_build_object('sub', auth.uid()) $f$;

  create schema storage;
  create table storage.buckets (
    id                  text primary key,
    name                text not null,
    public              boolean not null default false,
    file_size_limit     bigint,
    allowed_mime_types  text[]
  );

  create publication supabase_realtime;

  grant usage on schema public, auth to anon, authenticated, service_role;
  alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
  alter default privileges in schema public grant all on functions to anon, authenticated, service_role;
end
$stub$;
