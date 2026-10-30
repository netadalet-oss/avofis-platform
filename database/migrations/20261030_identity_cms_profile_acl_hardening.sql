-- AVOfis B01/B02/P10: tighten existing role/profile and CMS GRANTS.
-- Runs ONLY after the reviewed legacy RLS and CMS publication-hold migrations.
-- Production deployment is an authorized, separately reviewed operation.
-- No rows deleted, no policies silently widened, no service_role change.
begin;
do $guard$
declare unexpected text;
begin
 if to_regclass('public.profiles') is null or
    to_regclass('public.pages') is null or
    to_regclass('public.site_settings') is null then
  raise exception 'B02 identity/CMS schema absent: stop for manual review';
 end if;
 if exists(select 1 from pg_class where oid in
    ('public.profiles'::regclass,'public.pages'::regclass,'public.site_settings'::regclass)
    and not relrowsecurity) then
  raise exception 'B02 identity/CMS RLS disabled: stop for manual review';
 end if;
 if not exists(select 1 from information_schema.columns where table_schema='public'
  and table_name='profiles' and column_name='role') then
  raise exception 'B02 profiles.role absent: stop for manual review';
 end if;
 -- An unreviewed SELECT/ALL policy can OR its way around admin-only rules.
 select string_agg(tablename||'.'||policyname,', ' order by tablename,policyname)
 into unexpected from pg_policies
 where schemaname='public' and tablename in ('profiles','pages','site_settings')
 and not (
   (tablename='profiles' and policyname='Users can read own profile' and cmd='SELECT')
   or (tablename='pages' and policyname in
     ('Only admins can read pages','Only admins can update pages',
      'avofis unpublished insert hold','avofis unpublished update hold',
      'avofis unpublished delete hold'))
   or (tablename='site_settings' and policyname in
     ('Only admins can read settings','Only admins can update settings',
      'avofis unpublished insert hold','avofis unpublished update hold',
      'avofis unpublished delete hold')));
 if unexpected is not null then
  raise exception 'B02 unreviewed identity/CMS policy drift: %',unexpected;
 end if;
 if not exists(select 1 from pg_policies where schemaname='public'
  and tablename='profiles' and policyname='Users can read own profile' and cmd='SELECT')
 or not exists(select 1 from pg_policies where schemaname='public'
  and tablename='pages' and policyname='Only admins can read pages' and cmd='SELECT')
 or not exists(select 1 from pg_policies where schemaname='public'
  and tablename='site_settings' and policyname='Only admins can read settings' and cmd='SELECT') then
  raise exception 'B02 reviewed ownership/admin SELECT policies missing';
 end if;
end $guard$;
-- The source role column is never writable by a browser API account.
-- CMS documents are read-only until independently approved publication flow.
revoke all privileges on table public.profiles,public.pages,public.site_settings
 from public,anon,authenticated;
grant select on table public.profiles,public.pages,public.site_settings
 to authenticated;
commit;
