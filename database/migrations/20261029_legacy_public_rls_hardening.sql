-- AVOfis legacy public-schema RLS hardening.
-- REVIEW/STAGING ONLY. Never run on the connected production project before
-- confirming affected consumers, backup, human policy approval and E2E tests.
--
-- Observed 29 Oct 2026: seven RLS-disabled public tables with anon CRUD grants,
-- plus two overly permissive admin read policies on RLS-enabled tables.
--
-- Exact legacy tables have no published/approved flag, no audited moderation,
-- and no trusted office ownership workflow. Therefore default to DENY ALL
-- public use; do NOT guess that office/forum/job content is publishable.
-- Existing data are preserved. No privileged functions or SECURITY DEFINER.
begin;

-- Fail closed if a policy was added since the observed audit. PostgreSQL
-- PERMISSIVE policies combine by OR: preserving an unreviewed one would
-- silently defeat an otherwise correct RLS hardening migration.
do $
declare unexpected_policies text;
begin
 select string_agg(p.tablename||'.'||p.policyname,', ' order by p.tablename,p.policyname)
 into unexpected_policies
 from pg_policies p
 where p.schemaname='public' and p.tablename in
   ('offices','office_members','topics','posts','jobs','applications','media_assets')
 and not (
   (p.tablename='office_members' and p.policyname='legacy member reads own membership')
   or (p.tablename='applications' and p.policyname='legacy applicant reads own application')
 );
 if unexpected_policies is not null then
    raise exception 'B01/B02 unexpected legacy policies; manual review required: %',unexpected_policies;
 end if;
 if not exists(select 1 from information_schema.columns
   where table_schema='public' and table_name='office_members' and column_name='user_id')
 or not exists(select 1 from information_schema.columns
   where table_schema='public' and table_name='applications' and column_name='user_id') then
   raise exception 'B01/B02 source schema drift: user_id column missing';
 end if;
 if not exists(select 1 from pg_policies
    where schemaname='public' and tablename='pages' and policyname='Only admins can read pages')
 or not exists(select 1 from pg_policies
    where schemaname='public' and tablename='site_settings' and policyname='Only admins can read settings') then
   raise exception 'B02 source schema drift: reviewed restrictive admin policies missing';
 end if;
end $;

alter table public.offices enable row level security;
alter table public.office_members enable row level security;
alter table public.topics enable row level security;
alter table public.posts enable row level security;
alter table public.jobs enable row level security;
alter table public.applications enable row level security;
alter table public.media_assets enable row level security;

-- Revoke inherited broad grants as well as explicit role grants. Use separate
-- explicit owner-only permissions instead of relying on RLS alone.
revoke all privileges on table
 public.offices, public.office_members, public.topics, public.posts,
 public.jobs, public.applications, public.media_assets
from public, anon, authenticated;

-- Only a signed-in member may inspect their OWN membership row.
-- No client INSERT, UPDATE or DELETE; all provisioning is on hold.
grant select on table public.office_members to authenticated;
drop policy if exists "legacy member reads own membership" on public.office_members;
create policy "legacy member reads own membership"
 on public.office_members for select to authenticated
 using (user_id is not null and (select auth.uid()) = user_id);

-- Applicants may read the rows associated with their own auth identity.
-- No client INSERT until private CV storage, ownership and consent are reviewed.
grant select on table public.applications to authenticated;
drop policy if exists "legacy applicant reads own application" on public.applications;
create policy "legacy applicant reads own application"
 on public.applications for select to authenticated
 using (user_id is not null and (select auth.uid()) = user_id);

-- The old admin read predicates were combined using permissive OR.
-- "Allow admin read" was actually true for ALL authenticated users,
-- so it made "Only admins can read ..." ineffective.
-- Retain the existing admin-specific policies, removing ONLY the broad ones.
drop policy if exists "Allow admin read" on public.pages;
drop policy if exists "Allow admin read settings" on public.site_settings;

-- Other legacy records intentionally have neither public grants nor policies.
-- Public read and author/write must wait for a moderation/publish state,
-- trusted ownership model, and a separately approved privilege migration.
commit;
