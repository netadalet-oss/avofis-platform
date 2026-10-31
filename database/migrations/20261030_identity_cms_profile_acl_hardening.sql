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
 -- Policy NAMES are not permissions. A same-name SELECT policy can be
 -- replaced with USING(true), or FOR ALL, or TO anon. Every allowed name
 -- must retain its reviewed COMMAND, mode, and role before any DDL.
 select string_agg(p.tablename||'.'||p.policyname||'['||p.cmd||'/'||
                   p.permissive||'/'||p.roles::text||']',', '
                   order by p.tablename,p.policyname)
 into unexpected
 from pg_policies p
 where p.schemaname='public'
  and p.tablename in ('profiles','pages','site_settings')
  and not (
   p.permissive=case
     when p.policyname like 'avofis unpublished % hold' then 'RESTRICTIVE'
     else 'PERMISSIVE' end
   and p.roles::text in ('{public}','{authenticated}')
   and p.cmd=case
     when p.policyname in ('Users can read own profile',
      'Only admins can read pages','Only admins can read settings') then 'SELECT'
     when p.policyname in ('Only admins can update pages','Only admins can update settings',
      'avofis unpublished update hold') then 'UPDATE'
     when p.policyname='avofis unpublished insert hold' then 'INSERT'
     when p.policyname='avofis unpublished delete hold' then 'DELETE'
     else '<UNREVIEWED>' end
   -- The CMS publication-denial policies must not have been weakened.
   and (p.policyname not like 'avofis unpublished % hold'
     or (p.policyname='avofis unpublished insert hold' and p.with_check='false')
     or (p.policyname='avofis unpublished update hold'
       and p.qual='false' and p.with_check='false')
     or (p.policyname='avofis unpublished delete hold' and p.qual='false'))
  );
 if unexpected is not null then
  raise exception 'B02 identity/CMS policy signature drift: %',unexpected;
 end if;
 -- Confirm every deny policy exists. A missing hold cannot be silently
 -- treated as reviewed: an older grant or policy might later reappear.
 if (select count(*) from pg_policies
     where schemaname='public' and tablename in ('pages','site_settings')
      and policyname in ('avofis unpublished insert hold',
       'avofis unpublished update hold','avofis unpublished delete hold'))<>6 then
  raise exception 'B02 CMS restrictive publication hold incomplete';
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
-- Replace known legacy admin/ownership SELECT policies with canonical
-- expressions. Same-name USING(true) drift must never survive. These are
-- deliberately authenticated-only and do NOT consult editable user_metadata.
drop policy "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles
 for select to authenticated using(id=(select auth.uid()));

drop policy "Only admins can read pages" on public.pages;
create policy "Only admins can read pages" on public.pages
 for select to authenticated using(exists(
  select 1 from public.profiles p
  where p.id=(select auth.uid()) and p.role in ('admin','super_admin')));

drop policy "Only admins can read settings" on public.site_settings;
create policy "Only admins can read settings" on public.site_settings
 for select to authenticated using(exists(
  select 1 from public.profiles p
  where p.id=(select auth.uid()) and p.role in ('admin','super_admin')));

-- No direct CMS write policy is needed until an independently approved
-- publication service exists. Narrowing grants alone is not its safety case.
drop policy if exists "Only admins can update pages" on public.pages;
drop policy if exists "Only admins can update settings" on public.site_settings;
-- The source role column is never writable by a browser API account.
-- CMS documents are read-only until independently approved publication flow.
revoke all privileges on table public.profiles,public.pages,public.site_settings
 from public,anon,authenticated;
grant select on table public.profiles,public.pages,public.site_settings
 to authenticated;
commit;
