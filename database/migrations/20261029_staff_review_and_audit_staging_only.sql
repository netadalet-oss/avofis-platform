-- AVOfis P04/P05: internal review and immutable privilege audit, STAGING ONLY.
-- Runs after staff_work_items_staging_only.sql; NOT real payout, representation
-- or court/IND authorisation. All SQL deployed only to disposable PG17 CI.
begin;

-- Permission changes are logged by DB, not by a browser or modifiable app form.
create table if not exists public.avofis_staff_capability_events (
 id uuid primary key default gen_random_uuid(),
 staff_user_id uuid not null references auth.users(id) on delete restrict,
 capability text not null,
 actor_user_id uuid references auth.users(id) on delete restrict,
 action text not null check(action in('granted','revoked')),
 recorded_at timestamptz not null default clock_timestamp()
);
create index if not exists staff_capability_events_staff_idx
 on public.avofis_staff_capability_events(staff_user_id,recorded_at desc);
alter table public.avofis_staff_capability_events enable row level security;
revoke all on public.avofis_staff_capability_events from public,anon,authenticated;
grant select on public.avofis_staff_capability_events to authenticated;
drop policy if exists "admin reads capability audit" on public.avofis_staff_capability_events;
create policy "admin reads capability audit" on public.avofis_staff_capability_events
 for select to authenticated using(public.avofis_is_admin());
create or replace function public.avofis_record_staff_capability_change()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.avofis_staff_capability_events(staff_user_id,capability,actor_user_id,action)
 values(case when tg_op='INSERT' then new.staff_user_id else old.staff_user_id end,
        case when tg_op='INSERT' then new.capability else old.capability end,
        auth.uid(),
        case when tg_op='INSERT' then 'granted' else 'revoked' end);
 return null;
end; $$;
revoke all on function public.avofis_record_staff_capability_change() from public,anon,authenticated;
drop trigger if exists avofis_staff_capability_audit on public.avofis_staff_capability_grants;
create trigger avofis_staff_capability_audit
 after insert or delete on public.avofis_staff_capability_grants
 for each row execute function public.avofis_record_staff_capability_change();

create table if not exists public.avofis_staff_work_item_events (
 id uuid primary key default gen_random_uuid(),
 work_item_id uuid not null references public.avofis_staff_work_items(id) on delete restrict,
 actor_user_id uuid references auth.users(id) on delete restrict,
 event_kind text not null check(event_kind in('created','updated','review_requested')),
 from_state text,
 to_state text not null check(to_state in('draft','review_requested')),
 recorded_at timestamptz not null default clock_timestamp()
);
create index if not exists staff_work_item_events_item_idx
 on public.avofis_staff_work_item_events(work_item_id,recorded_at desc);
alter table public.avofis_staff_work_item_events enable row level security;
revoke all on public.avofis_staff_work_item_events from public,anon,authenticated;
grant select on public.avofis_staff_work_item_events to authenticated;

-- Admins may inspect internal submissions in order to review them.
-- This doesn't bypass case-specific rules for separate client/court tables.
drop policy if exists "admin reviews staff work drafts" on public.avofis_staff_work_items;
create policy "admin reviews staff work drafts"
 on public.avofis_staff_work_items for select to authenticated
 using(public.avofis_is_admin());

drop policy if exists "owner reads work item events" on public.avofis_staff_work_item_events;
create policy "owner reads work item events"
 on public.avofis_staff_work_item_events for select to authenticated using(
  exists(select 1 from public.avofis_staff_work_items w
    where w.id=work_item_id and
    (public.avofis_is_admin() or
      (w.staff_user_id=(select auth.uid())
       and public.avofis_has_staff_capability(w.module)))));
-- Deny updating an internal item once its review was requested. The staff
-- member must create a new revision rather than overwrite the reviewed draft.
create or replace function public.avofis_guard_internal_work_item()
returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if tg_op='UPDATE' then
  if old.state<>'draft'
   or new.state not in('draft','review_requested')
   or new.id is distinct from old.id
   or new.staff_user_id is distinct from old.staff_user_id
   or new.module is distinct from old.module
   or new.case_id is distinct from old.case_id
   or new.flow is distinct from old.flow
   or new.created_at is distinct from old.created_at
  then raise exception 'P04 internal review lock: cannot modify submitted or immutable fields';
  end if;
  new.updated_at=clock_timestamp();
 end if;
 return new;
end; $$;
revoke all on function public.avofis_guard_internal_work_item() from public,anon,authenticated;
drop trigger if exists avofis_guard_internal_work_item on public.avofis_staff_work_items;
create trigger avofis_guard_internal_work_item
 before update on public.avofis_staff_work_items
 for each row execute function public.avofis_guard_internal_work_item();

create or replace function public.avofis_log_internal_work_item()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 insert into public.avofis_staff_work_item_events(
  work_item_id,actor_user_id,event_kind,from_state,to_state)
 values(new.id,auth.uid(),case when tg_op='INSERT' then 'created'
      when old.state='draft' and new.state='review_requested'
           then 'review_requested' else 'updated' end,
      case when tg_op='INSERT' then null else old.state end,new.state);
 return null;
end; $$;
revoke all on function public.avofis_log_internal_work_item() from public,anon,authenticated;
drop trigger if exists avofis_internal_work_item_audit on public.avofis_staff_work_items;
create trigger avofis_internal_work_item_audit
 after insert or update on public.avofis_staff_work_items
 for each row execute function public.avofis_log_internal_work_item();

-- Two distinct, active admins may separately review an internal task. The
-- record is not 'approved payment' and grants ZERO external action authority.
create table if not exists public.avofis_staff_work_item_signoffs (
 work_item_id uuid not null references public.avofis_staff_work_items(id) on delete restrict,
 reviewer_user_id uuid not null references auth.users(id) on delete restrict,
 decision text not null check(decision in('reviewed_internal','changes_requested')),
 reviewed_at timestamptz not null default clock_timestamp(),
 primary key (work_item_id,reviewer_user_id)
);
create index if not exists staff_work_item_signoffs_reviewed_idx
 on public.avofis_staff_work_item_signoffs(reviewed_at desc);
alter table public.avofis_staff_work_item_signoffs enable row level security;
revoke all on public.avofis_staff_work_item_signoffs from public,anon,authenticated;
grant select,insert on public.avofis_staff_work_item_signoffs to authenticated;
drop policy if exists "owner and admin see internal signoffs" on public.avofis_staff_work_item_signoffs;
create policy "owner and admin see internal signoffs"
 on public.avofis_staff_work_item_signoffs for select to authenticated using(
  public.avofis_is_admin() or exists(select 1 from public.avofis_staff_work_items w
    where w.id=work_item_id and w.staff_user_id=(select auth.uid())
      and public.avofis_has_staff_capability(w.module)));
drop policy if exists "independent admins sign internal work item review" on public.avofis_staff_work_item_signoffs;
create policy "independent admins sign internal work item review"
 on public.avofis_staff_work_item_signoffs for insert to authenticated
 with check(public.avofis_is_admin() and reviewer_user_id=(select auth.uid()) and
  exists(select 1 from public.avofis_staff_work_items w
    where w.id=work_item_id and w.state='review_requested'
      and w.staff_user_id <> (select auth.uid())));
-- No delete/update of any audit, signoff, or privilege event is granted.
commit;
