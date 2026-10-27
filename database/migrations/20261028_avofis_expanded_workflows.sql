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


-- Administration-only internal company programme. Never expose through public APIs.
-- Records are internal operating decisions, not commitments or public marketing copy.
create or replace function public.avofis_is_admin()
returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.avofis_staff s where s.user_id=auth.uid() and s.role='admin');
$$;
revoke all on function public.avofis_is_admin() from public,anon;
grant execute on function public.avofis_is_admin() to authenticated;

create table if not exists public.avofis_internal_tasks(
 id uuid primary key default gen_random_uuid(),
 title text not null check(char_length(title) between 3 and 180),
 group_key text not null check(group_key in ('company','legal','finance','services','partners','operations','security','marketing','quality')),
 owner_label text not null default '' check(char_length(owner_label)<=100),
 status text not null default 'todo' check(status in ('todo','in_progress','blocked','done')),
 priority text not null default 'normal' check(priority in ('low','normal','high','critical')),
 due_on date,
 budget_eur_cents integer check(budget_eur_cents is null or budget_eur_cents>=0),
 notes text not null default '' check(char_length(notes)<=2000),
 created_by uuid not null references auth.users(id),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists avofis_internal_tasks_group_idx
on public.avofis_internal_tasks(group_key,status);
alter table public.avofis_internal_tasks enable row level security;
revoke all on public.avofis_internal_tasks from anon,authenticated;
grant select,insert,update on public.avofis_internal_tasks to authenticated;
create policy "administrators read company tasks" on public.avofis_internal_tasks
 for select to authenticated using(public.avofis_is_admin());
create policy "administrators create company tasks" on public.avofis_internal_tasks
 for insert to authenticated with check(public.avofis_is_admin() and created_by=auth.uid());
create policy "administrators update company tasks" on public.avofis_internal_tasks
 for update to authenticated using(public.avofis_is_admin()) with check(public.avofis_is_admin());
create or replace function public.avofis_set_internal_task_updated_at()
returns trigger language plpgsql set search_path='' as $$
begin
 new.updated_at=now();
 new.created_by=old.created_by;
 return new;
end;$$;
drop trigger if exists avofis_internal_tasks_touch on public.avofis_internal_tasks;
create trigger avofis_internal_tasks_touch
 before update on public.avofis_internal_tasks for each row
 execute function public.avofis_set_internal_task_updated_at();
