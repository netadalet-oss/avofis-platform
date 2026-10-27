-- AVOfis expanded workflow migration.
-- Run AFTER 20261027_avofis_mvp.sql, and only after security and GDPR review.
-- This migration is stored in source control. It is NOT automatically applied.
alter table public.avofis_leads add column if not exists applicant_role text not null default 'self';
alter table public.avofis_leads add column if not exists issue_stage text not null default 'new';
alter table public.avofis_leads add column if not exists decision_notified_on date;
alter table public.avofis_leads drop constraint if exists avofis_leads_applicant_role_check;
alter table public.avofis_leads add constraint avofis_leads_applicant_role_check
 check(applicant_role in ('self','family','business'));
alter table public.avofis_leads drop constraint if exists avofis_leads_issue_stage_check;
alter table public.avofis_leads add constraint avofis_leads_issue_stage_check
 check(issue_stage in ('new','ongoing','missing','decision','dispute'));

-- Actual client-visible case milestones, reminders and deadlines.
-- Authoritative legal deadline calculation is never automated by this table.
create table if not exists public.avofis_case_tasks (
 id uuid primary key default gen_random_uuid(),
 case_id uuid not null references public.avofis_cases(id) on delete cascade,
 title text not null check(char_length(title) between 3 and 180),
 details text not null default '' check(char_length(details)<=1200),
 due_at timestamptz,
 status text not null default 'pending' check(status in ('pending','in_progress','completed','cancelled')),
 visible_to_client boolean not null default false,
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists avofis_tasks_case_idx on public.avofis_case_tasks(case_id,created_at desc);
create index if not exists avofis_tasks_due_idx on public.avofis_case_tasks(due_at) where status in ('pending','in_progress');
alter table public.avofis_case_tasks enable row level security;
revoke all on public.avofis_case_tasks from anon,authenticated;
grant select,insert,update on public.avofis_case_tasks to authenticated;
create policy "staff and owner read allowed tasks"
 on public.avofis_case_tasks for select to authenticated
 using (
  public.avofis_is_staff()
  or (visible_to_client and exists (
   select 1 from public.avofis_cases c where c.id=case_id and c.client_user_id=auth.uid()
  ))
 );
create policy "staff insert case tasks"
 on public.avofis_case_tasks for insert to authenticated
 with check(public.avofis_is_staff() and created_by=auth.uid());
create policy "staff update case tasks"
 on public.avofis_case_tasks for update to authenticated
 using(public.avofis_is_staff()) with check(public.avofis_is_staff());
create or replace function public.avofis_set_task_updated_at()
 returns trigger language plpgsql set search_path='' as $$
begin
 new.updated_at=now();
 new.created_by=old.created_by;
 new.case_id=old.case_id;
 return new;
end;$$;
drop trigger if exists avofis_task_timestamp on public.avofis_case_tasks;
create trigger avofis_task_timestamp before update on public.avofis_case_tasks
 for each row execute function public.avofis_set_task_updated_at();

-- Staff bootstrap, RLS inspection, legal deadline review and initial data retention
-- settings remain mandatory manual deployment checks.
