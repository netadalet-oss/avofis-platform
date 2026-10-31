-- AVOfis P03: staging-only staff drafts and work queue.
-- No real filing, bank instruction, PSP settlement, or client intake.
-- Depends on 20261029_staff_personal_capability_scope_staging_only.sql.
begin;
create table if not exists public.avofis_staff_work_items (
 id uuid primary key default gen_random_uuid(),
 staff_user_id uuid not null references public.avofis_staff(user_id) on delete restrict,
 case_id uuid references public.avofis_cases(id) on delete restrict,
 module text not null check(module in(
  'inbox','triage','matters','calendar','documents','pleadings',
  'research','judicial','ind','messages','billing','payables',
  'reporting','audit','people','settings')),
 title text not null check(char_length(trim(title)) between 4 and 160),
 summary text not null default '' check(char_length(summary) <= 2500),
 state text not null default 'draft' check(state in('draft','review_requested')),
 flow text check(flow in('income','expense')),
 amount_eur_cents integer check(amount_eur_cents between 0 and 100000000),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 check((module in('billing','payables')) =
  (flow is not null and amount_eur_cents is not null)),
 check(flow is null or (module='billing' and flow='income')
                or (module='payables' and flow='expense'))
);
create index if not exists avofis_staff_work_items_staff_idx
 on public.avofis_staff_work_items(staff_user_id,module,created_at desc);
alter table public.avofis_staff_work_items enable row level security;
revoke all on public.avofis_staff_work_items from public,anon,authenticated;
grant select,insert,update(title,summary,state,amount_eur_cents) on public.avofis_staff_work_items to authenticated;
drop policy if exists "owner views own scoped staff work items" on public.avofis_staff_work_items;
create policy "owner views own scoped staff work items"
 on public.avofis_staff_work_items for select to authenticated
 using(staff_user_id=(select auth.uid()) and
  public.avofis_has_staff_capability(module) and
  (case_id is null or public.avofis_staff_scope_access(case_id)));
drop policy if exists "owner inserts own scoped draft only" on public.avofis_staff_work_items;
create policy "owner inserts own scoped draft only"
 on public.avofis_staff_work_items for insert to authenticated
 with check(staff_user_id=(select auth.uid()) and state='draft'
  and public.avofis_has_staff_capability(module)
  and (case_id is null or (public.avofis_staff_scope_access(case_id)
                        and public.avofis_has_staff_capability('matters'))));
drop policy if exists "owner edits own review drafts" on public.avofis_staff_work_items;
create policy "owner edits own review drafts"
 on public.avofis_staff_work_items for update to authenticated
 using(staff_user_id=(select auth.uid()) and
  public.avofis_has_staff_capability(module)
  and (case_id is null or public.avofis_staff_scope_access(case_id)))
 with check(staff_user_id=(select auth.uid()) and
  public.avofis_has_staff_capability(module)
  and state in('draft','review_requested')
  and (case_id is null or public.avofis_staff_scope_access(case_id)));
-- No DELETE grant; no 'approved', 'filed', 'paid' or 'sent' status.
-- These are not accounting source-of-truth entries and do not trigger payments.
commit;
