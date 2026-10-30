-- AVOfis B02-FUTURE: separate, privileged SUPABASE_ADMIN OWNER action.
-- The connected postgres role DOES NOT have MEMBER privilege of supabase_admin,
-- verified by READ ONLY query 2026-10-30. It CANNOT run this script.
-- This script is only for an authorized platform owner acting as supabase_admin
-- after backup, approved change window, and isolated validation.
-- Never grant membership to postgres just to bypass this control.
begin;
do $guard$
begin
 if current_user<>'supabase_admin' then
  raise exception 'B02-FUTURE owner-only action required: supabase_admin';
 end if;
end $guard$;
alter default privileges for role supabase_admin in schema public
 revoke all privileges on tables from anon,authenticated;
alter default privileges for role supabase_admin in schema public
 revoke all privileges on sequences from anon,authenticated;
alter default privileges for role supabase_admin in schema public
 revoke all privileges on functions from anon,authenticated;
commit;
