\\set ON_ERROR_STOP on
-- Disposable PostgreSQL 17 verification of the observed 29 Oct 2026
-- legacy schema. This is a synthetic RLS/grant regression, NOT a live
-- Supabase/Auth/Data API E2E test.
create role anon nologin;
create role authenticated nologin;
create schema auth;
grant usage on schema auth to authenticated;
create function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid;
$$;

create table public.profiles(id uuid primary key,role text);
create table public.offices(id uuid primary key,name text not null,city text,description text,website text);
create table public.office_members(id uuid primary key,office_id uuid,user_id uuid,position text);
create table public.topics(id uuid primary key,title text not null,created_by uuid);
create table public.posts(id uuid primary key,topic_id uuid,author_id uuid,content text);
create table public.jobs(id uuid primary key,office_id uuid,title text,description text);
create table public.applications(id uuid primary key,job_id uuid,user_id uuid,cv_url text);
create table public.media_assets(id uuid primary key,url text,name text,type text);
create table public.pages(id uuid primary key,title text);
create table public.site_settings(id uuid primary key,key text,value jsonb);

-- Reconstruct the broad grants and the relevant legacy RLS policies.
grant all privileges on table
 public.offices,public.office_members,public.topics,public.posts,
 public.jobs,public.applications,public.media_assets,
 public.profiles,public.pages,public.site_settings
to anon,authenticated;
alter table public.profiles enable row level security;
alter table public.pages enable row level security;
alter table public.site_settings enable row level security;
create policy "Users can read own profile" on public.profiles for select
 to authenticated using(id=(select auth.uid()));
create policy "Allow admin read" on public.pages for select
 to authenticated using((select auth.uid()) is not null);
create policy "Only admins can read pages" on public.pages for select
 to authenticated using(exists(
  select 1 from public.profiles p where p.id=(select auth.uid()) and
  p.role in ('admin','super_admin')
 ));
create policy "Allow admin read settings" on public.site_settings for select
 to authenticated using((select auth.uid()) is not null);
create policy "Only admins can read settings" on public.site_settings for select
 to authenticated using(exists(
  select 1 from public.profiles p where p.id=(select auth.uid()) and
  p.role in ('admin','super_admin')
 ));

insert into public.profiles(id,role) values
 ('aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa','user'),
 ('bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb','user'),
 ('cccccccc-cccc-4ccc-cccc-cccccccccccc','admin');
insert into public.offices(id,name) values
 ('11111111-1111-4111-8111-111111111111','Pending review');
insert into public.office_members(id,office_id,user_id,position) values
 ('11111111-1111-4111-8111-111111111101','11111111-1111-4111-8111-111111111111','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa','member-A'),
 ('11111111-1111-4111-8111-111111111102','11111111-1111-4111-8111-111111111111','bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb','member-B');
insert into public.applications(id,user_id,cv_url) values
 ('11111111-1111-4111-8111-111111111201','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa','private-a'),
 ('11111111-1111-4111-8111-111111111202','bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb','private-b');
insert into public.pages(id,title) values
 ('11111111-1111-4111-8111-111111111301','Unreviewed draft');
insert into public.site_settings(id,key,value) values
 ('11111111-1111-4111-8111-111111111401','private_value','{"private":true}');
insert into public.topics(id,title) values ('11111111-1111-4111-8111-111111111501','Unmoderated topic');
insert into public.posts(id,content) values ('11111111-1111-4111-8111-111111111601','Unmoderated post');
insert into public.jobs(id,title) values ('11111111-1111-4111-8111-111111111701','Unapproved job');
insert into public.media_assets(id,url) values ('11111111-1111-4111-8111-111111111801','private-storage-path');

-- Before: RLS is disabled and anon has unrestricted CRUD on seven tables.
do $$
begin
 if not has_table_privilege('anon','public.applications','DELETE') or
    (select relrowsecurity from pg_class where oid='public.applications'::regclass) then
   raise exception 'Fixture does not reproduce the observed vulnerability';
 end if;
end $$;

\\ir ../migrations/20261029_legacy_public_rls_hardening.sql

-- RLS and grants must be hardened on every legacy table.
do $$
declare tab text;
begin
 foreach tab in array array[
  'offices','office_members','topics','posts','jobs','applications','media_assets'
 ] loop
  if not (select relrowsecurity from pg_class where oid=format('public.%I',tab)::regclass)
    or has_table_privilege('anon',format('public.%I',tab),'SELECT')
    or has_table_privilege('anon',format('public.%I',tab),'INSERT')
    or has_table_privilege('anon',format('public.%I',tab),'UPDATE')
    or has_table_privilege('anon',format('public.%I',tab),'DELETE')
    or has_table_privilege('authenticated',format('public.%I',tab),'INSERT')
    or has_table_privilege('authenticated',format('public.%I',tab),'UPDATE')
    or has_table_privilege('authenticated',format('public.%I',tab),'DELETE') then
     raise exception 'Insecure legacy grants/RLS: %',tab;
  end if;
 end loop;
 if exists(select 1 from pg_policies where schemaname='public'
  and (tablename='pages' and policyname='Allow admin read'
   or tablename='site_settings' and policyname='Allow admin read settings')) then
  raise exception 'Broad admin-read policy still exists';
 end if;
 if has_table_privilege('authenticated','public.posts','SELECT')
   or has_table_privilege('authenticated','public.media_assets','SELECT')
   or has_table_privilege('authenticated','public.offices','SELECT')
   or not has_table_privilege('authenticated','public.applications','SELECT')
   or not has_table_privilege('authenticated','public.office_members','SELECT') then
   raise exception 'Unexpected default/public/owner SELECT grants';
 end if;
end $$;

-- Anonymous clients must not even have legacy read privilege.
set role anon;
do $$
begin
 begin
  perform count(*) from public.applications;
  raise exception 'Anonymous application SELECT unexpectedly succeeded';
 exception when insufficient_privilege then null; end;
 begin
  perform count(*) from public.offices;
  raise exception 'Anonymous office SELECT unexpectedly succeeded';
 exception when insufficient_privilege then null; end;
end $$;
reset role;

-- A sees own personal rows only; pages/settings are admin-only.
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',false);
set role authenticated;
do $$
begin
 if (select count(*) from public.applications)<>1
   or (select cv_url from public.applications limit 1)<>'private-a'
   or (select count(*) from public.office_members)<>1
   or (select position from public.office_members limit 1)<>'member-A'
   or (select count(*) from public.pages)<>0
   or (select count(*) from public.site_settings)<>0 then
  raise exception 'User A isolation or admin policy failed';
 end if;
 begin
  delete from public.applications;
  raise exception 'User was able to delete application';
 exception when insufficient_privilege then null; end;
end $$;
reset role;

select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',false);
set role authenticated;
do $$
begin
 if (select count(*) from public.applications)<>1
   or (select cv_url from public.applications limit 1)<>'private-b'
   or (select count(*) from public.office_members)<>1
   or (select position from public.office_members limit 1)<>'member-B'
   or (select count(*) from public.pages)<>0
   or (select count(*) from public.site_settings)<>0 then
  raise exception 'User B isolation or admin policy failed';
 end if;
end $$;
reset role;

-- Admin still sees admin-managed content without any broad auth policy.
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
do $$
begin
 if (select count(*) from public.pages)<>1
    or (select count(*) from public.site_settings)<>1
    or (select count(*) from public.applications)<>0 then
  raise exception 'Admin pages/settings or application isolation failed';
 end if;
end $$;
reset role;

-- Migration is idempotent: no new access and no duplicate-policy failure.
\\ir ../migrations/20261029_legacy_public_rls_hardening.sql
do $$
begin
 if (select count(*) from pg_policies
       where schemaname='public' and tablename='applications'
         and policyname='legacy applicant reads own application')<>1 then
   raise exception 'Second application changed policy count';
 end if;
end $$;
\\echo 'PASS: all seven legacy tables RLS hardened; anon CRUD removed; A/B private rows isolated; admin-only read restored'
