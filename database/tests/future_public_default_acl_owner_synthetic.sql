\set ON_ERROR_STOP on
-- On DISPOSABLE PG17 after legacy fixture: PostgreSQL owner defaults and
-- independent supabase_admin owner defaults are tested separately.
create role supabase_admin nologin;
grant usage,create on schema public to supabase_admin;
-- Reproduce the OBSERVED Supabase default ACLs on an isolated database.
alter default privileges for role postgres in schema public
 grant all on tables to anon,authenticated;
alter default privileges for role postgres in schema public
 grant all on sequences to anon,authenticated;
alter default privileges for role postgres in schema public
 grant execute on functions to anon,authenticated;
alter default privileges for role supabase_admin in schema public
 grant all on tables to anon,authenticated;
alter default privileges for role supabase_admin in schema public
 grant all on sequences to anon,authenticated;
alter default privileges for role supabase_admin in schema public
 grant execute on functions to anon,authenticated;
create table public.avofis_new_postgres_before(id bigint generated always as identity);
set role supabase_admin;
create table public.avofis_new_platform_before(id bigint generated always as identity);
reset role;
do $before$
begin
 if not has_table_privilege('anon','public.avofis_new_postgres_before','SELECT')
 or not has_table_privilege('authenticated','public.avofis_new_platform_before','INSERT')
 or not has_sequence_privilege('anon',pg_get_serial_sequence('public.avofis_new_postgres_before','id'),'USAGE') then
  raise exception 'B02-FUTURE fixture did not reproduce dangerous default grants'; end if;
end $before$;
-- Migration callable by the connected postgres role removes only its defaults.
\ir ../migrations/20261030_postgres_public_future_default_acl.sql
create table public.avofis_new_postgres_after(id bigint generated always as identity);
set role supabase_admin;
create table public.avofis_new_platform_still_open(id bigint generated always as identity);
reset role;
do $partial$
begin
 if has_table_privilege('anon','public.avofis_new_postgres_after','SELECT')
 or has_table_privilege('authenticated','public.avofis_new_postgres_after','UPDATE')
 or has_sequence_privilege('anon',pg_get_serial_sequence('public.avofis_new_postgres_after','id'),'USAGE') then
  raise exception 'B02-FUTURE postgres default ACL mitigation failed'; end if;
 if not has_table_privilege('anon','public.avofis_new_platform_still_open','SELECT') then
  raise exception 'B02-FUTURE false claim: postgres role changed supabase_admin grants'; end if;
end $partial$;
-- Independent action must be executed AS the object creator role.
set role supabase_admin;
\ir ../ops/supabase_admin_public_default_acl_OWNER_ACTION.sql
create table public.avofis_new_platform_after(id bigint generated always as identity);
reset role;
do $complete$
begin
 if has_table_privilege('anon','public.avofis_new_platform_after','SELECT')
 or has_table_privilege('authenticated','public.avofis_new_platform_after','UPDATE')
 or has_sequence_privilege('anon',pg_get_serial_sequence('public.avofis_new_platform_after','id'),'USAGE') then
  raise exception 'B02-FUTURE supabase_admin future grants remain broad'; end if;
 if not has_table_privilege('anon','public.avofis_new_platform_before','SELECT') then
  raise exception 'B02-FUTURE migration unexpectedly rewrote existing ACLs'; end if;
end $complete$;
-- Rerun both owner migrations to confirm idempotence.
\ir ../migrations/20261030_postgres_public_future_default_acl.sql
set role supabase_admin;
\ir ../ops/supabase_admin_public_default_acl_OWNER_ACTION.sql
reset role;
\echo 'PASS B02-FUTURE: both owner defaults are narrowed separately, no existing objects rewritten'
