\set ON_ERROR_STOP on
-- Disposable PostgreSQL17 regression AFTER legacy_rls_hardening and CMS hold.
-- Real role profile and CMS APIs must not expose writes to authenticated users.
\ir ../migrations/20261030_identity_cms_profile_acl_hardening.sql
do $guard$
declare tab text;
begin
 foreach tab in array array['profiles','pages','site_settings'] loop
  if not (select relrowsecurity from pg_class where oid=format('public.%I',tab)::regclass)
    or has_table_privilege('anon',format('public.%I',tab),'SELECT')
    or has_table_privilege('anon',format('public.%I',tab),'INSERT')
    or has_table_privilege('anon',format('public.%I',tab),'UPDATE')
    or has_table_privilege('anon',format('public.%I',tab),'DELETE')
    or has_table_privilege('authenticated',format('public.%I',tab),'INSERT')
    or has_table_privilege('authenticated',format('public.%I',tab),'UPDATE')
    or has_table_privilege('authenticated',format('public.%I',tab),'DELETE')
    or not has_table_privilege('authenticated',format('public.%I',tab),'SELECT') then
   raise exception 'B02 illegal identity/CMS grants: %',tab;
  end if;
 end loop;
end $guard$;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',false);
set role authenticated;
do $client$
begin
 if (select count(*) from public.profiles)<>1
   or (select role from public.profiles limit 1)<>'user'
   or (select count(*) from public.pages)<>0
   or (select count(*) from public.site_settings)<>0 then
  raise exception 'B02 client role or CMS boundary failed'; end if;
 begin
  update public.profiles set role='super_admin';
  raise exception 'B02 attacker promoted own profile role';
 exception when insufficient_privilege then null; end;
 begin
  insert into public.profiles(id,role) values
  ('dddddddd-dddd-4ddd-8ddd-dddddddddddd','super_admin');
  raise exception 'B02 unauthorized admin user insert accepted';
 exception when insufficient_privilege then null; end;
end $client$;
reset role;
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
do $admin$
begin
 if (select count(*) from public.pages)<>1
  or (select count(*) from public.site_settings)<>1 then
  raise exception 'B02 legitimate admin lost CMS read access'; end if;
 begin
  update public.pages set title='unreviewed published content';
  raise exception 'B02 admin direct publication unexpectedly allowed';
 exception when insufficient_privilege then null; end;
end $admin$;
reset role;
-- Repeat the real migration; no policy drift or widened grants allowed.
\ir ../migrations/20261030_identity_cms_profile_acl_hardening.sql
\echo 'PASS B02: profile role protected from self-promotion, admin CMS read retained and unauthorized writes denied'
