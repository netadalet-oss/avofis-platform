-- B02 B01/P10 RELEASE READ-ONLY ASSERTIONS, never modifies production.
-- Require independent postgres AND supabase_admin default ACL remediation
-- before claiming future-public-table grants are closed.
begin transaction read only;
do $checks$
declare tab text; owner_name text; broad_count integer;
begin
 foreach tab in array array['profiles','pages','site_settings'] loop
  if to_regclass('public.'||tab) is null then
   raise exception 'B02-FUTURE missing table %',tab;
  end if;
  if not (select relrowsecurity from pg_class
           where oid=format('public.%I',tab)::regclass)
   or has_table_privilege('anon',format('public.%I',tab),'SELECT')
   or has_table_privilege('anon',format('public.%I',tab),'INSERT')
   or has_table_privilege('anon',format('public.%I',tab),'UPDATE')
   or has_table_privilege('anon',format('public.%I',tab),'DELETE')
   or has_table_privilege('authenticated',format('public.%I',tab),'INSERT')
   or has_table_privilege('authenticated',format('public.%I',tab),'UPDATE')
   or has_table_privilege('authenticated',format('public.%I',tab),'DELETE') then
    raise exception 'B02-FUTURE excessive existing identity/CMS grant: %',tab;
  end if;
 end loop;
 foreach owner_name in array array['postgres','supabase_admin'] loop
  if not exists(select 1 from pg_roles where rolname=owner_name) then
   raise exception 'B02-FUTURE expected owner role missing: %',owner_name;
  end if;
  select count(*) into broad_count
  from pg_default_acl d
  cross join lateral aclexplode(d.defaclacl) a
  where d.defaclrole=(select oid from pg_roles where rolname=owner_name)
   and d.defaclnamespace in (0,'public'::regnamespace)
   and d.defaclobjtype in ('r','S')
   and a.grantee in (0,
     (select oid from pg_roles where rolname='anon'),
     (select oid from pg_roles where rolname='authenticated'));
  if broad_count>0 then
   raise exception 'B02-FUTURE % still grants future public tables/sequences to API roles (% entries)',owner_name,broad_count;
  end if;
 end loop;
end $checks$;
commit;
-- Function EXECUTE defaults include a PostgreSQL PUBLIC baseline; further
-- reviewed function-by-function decisions are mandatory before production GO.
\echo 'PASS B02-FUTURE: both owner default ACLs and identity/CMS table grants checked read only'
