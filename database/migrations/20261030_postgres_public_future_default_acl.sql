-- AVOfis B02-FUTURE: stop default anonymous and blanket authenticated
-- grants on FUTURE objects created by role postgres in exposed public schema.
-- Existing objects are not affected; explicit intentional grants are required.
-- This script cannot change defaults of supabase_admin: separate owner action.
-- To be applied after B01/B02 policy review, backup and change authorization.
begin;
do $guard$
begin
 if current_user<>'postgres' and not pg_has_role(current_user,'postgres','MEMBER') then
  raise exception 'B02-FUTURE cannot change postgres defaults with current role';
 end if;
end $guard$;
alter default privileges for role postgres in schema public
 revoke all privileges on tables from anon,authenticated;
alter default privileges for role postgres in schema public
 revoke all privileges on sequences from anon,authenticated;
-- Existing schema-specific grants on functions are removed for these roles,
-- but global PUBLIC EXECUTE may still apply: functions require separate review.
alter default privileges for role postgres in schema public
 revoke all privileges on functions from anon,authenticated;
commit;
