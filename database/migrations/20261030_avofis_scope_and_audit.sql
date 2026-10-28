-- AVOfis complementary service-authorisation safeguards (STAGING REVIEW REQUIRED).
-- Apply only AFTER 20261027, 20261028, and 20261029_avofis_case_clearance.sql.
-- Creates no authorisations; existing records are NEVER automatically approved.

-- Internal audit is append-only for the authenticated staff UI, and records each decision revision.
create table if not exists public.avofis_assessment_audit (
 id bigint generated always as identity primary key,
 case_id uuid not null references public.avofis_cases(id) on delete cascade,
 reviewer_id uuid,
 previous_decision text,
 decision text not null,
 changed_at timestamptz not null default now(),
 snapshot jsonb not null
);
create index if not exists avofis_assessment_audit_case_idx
 on public.avofis_assessment_audit(case_id,changed_at desc);
alter table public.avofis_assessment_audit enable row level security;
revoke all on public.avofis_assessment_audit from anon,authenticated;
grant select on public.avofis_assessment_audit to authenticated;
create policy "staff read assessment audit" on public.avofis_assessment_audit
 for select to authenticated using(public.avofis_is_staff());

create or replace function public.avofis_log_assessment_change()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 -- No operator may issue a final legal clearance. A verified admin must approve.
 if new.decision='approved' and not public.avofis_is_admin() then
   raise exception 'Manager approval required';
 end if;
 insert into public.avofis_assessment_audit
  (case_id,reviewer_id,previous_decision,decision,snapshot)
 values(new.case_id,auth.uid(),
    case when tg_op='UPDATE' then old.decision else null end,
    new.decision,to_jsonb(new));
 return new;
end;$$;
revoke all on function public.avofis_log_assessment_change() from public,anon,authenticated;
drop trigger if exists avofis_assessment_audit_log on public.avofis_case_assessments;
create trigger avofis_assessment_audit_log
 after insert or update on public.avofis_case_assessments
 for each row execute function public.avofis_log_assessment_change();

-- Only review is allowed at case creation; a contract can be proposed only after
-- an approved jurisdiction/service assessment (not a mechanical claim of licensure).
create or replace function public.avofis_guard_case_precontract()
returns trigger language plpgsql set search_path='' as $$
begin
 if tg_op='INSERT' then
   if new.status<>'review' then
      raise exception 'New cases must start in review';
   end if;
 else
   if new.service_key is distinct from old.service_key and
       exists(select 1 from public.avofis_case_assessments a where a.case_id=old.id)
   then
      raise exception 'Service cannot change after legal screening; open a new case';
   end if;
   if new.status is distinct from old.status and
       new.status in ('awaiting_agreement','open','completed') and
       not exists(
        select 1 from public.avofis_case_assessments a
         where a.case_id=old.id and a.decision='approved'
           and a.authorisation in ('permitted','specialist_confirmed')
           and a.deadline_review in ('confirmed','not_applicable')
       )
   then
       raise exception 'Approved scope assessment required before contract or activation';
   end if;
 end if;
 return new;
end;$$;
drop trigger if exists avofis_case_precontract_guard on public.avofis_cases;
create trigger avofis_case_precontract_guard
 before insert or update on public.avofis_cases
 for each row execute function public.avofis_guard_case_precontract();

-- Block premature agreement issuance even if someone bypasses the staff UI.
create or replace function public.avofis_guard_agreement_issue()
returns trigger language plpgsql set search_path='' as $$
begin
 if not exists(
  select 1 from public.avofis_cases c
  join public.avofis_case_assessments a on a.case_id=c.id
  where c.id=new.case_id and c.status='awaiting_agreement'
    and a.decision='approved' and a.authorisation in ('permitted','specialist_confirmed')
    and a.deadline_review in ('confirmed','not_applicable')
 ) then
   raise exception 'Review and approved service scope required before agreement issuance';
 end if;
 return new;
end;$$;
drop trigger if exists avofis_agreement_issue_guard on public.avofis_agreements;
create trigger avofis_agreement_issue_guard
 before insert on public.avofis_agreements
 for each row execute function public.avofis_guard_agreement_issue();

-- Prevent a newly created acceptance from bypassing a later withdrawn authorisation.
create or replace function public.avofis_accept_agreement(p_case uuid,p_signature text)
returns timestamptz language plpgsql security definer set search_path='' as $$
declare result_time timestamptz;
begin
 if auth.uid() is null or char_length(btrim(p_signature))<3 or char_length(p_signature)>120 then
   raise exception 'Invalid signature';
 end if;
 if not exists (
   select 1 from public.avofis_cases c
   join public.avofis_case_assessments r on r.case_id=c.id
   where c.id=p_case and c.client_user_id=auth.uid()
    and c.status='awaiting_agreement'
    and r.decision='approved'
    and r.authorisation in ('permitted','specialist_confirmed')
    and r.deadline_review in ('confirmed','not_applicable')
 ) then
   raise exception 'Legal screening is required before acceptance';
 end if;
 update public.avofis_agreements
  set client_signature=btrim(p_signature),signed_at=now()
  where case_id=p_case and signed_at is null
  returning signed_at into result_time;
 if result_time is null then raise exception 'Agreement unavailable or already accepted'; end if;
 return result_time;
end;$$;
revoke all on function public.avofis_accept_agreement(uuid,text) from public,anon;
grant execute on function public.avofis_accept_agreement(uuid,text) to authenticated;

-- Revoke the old permissive upload rule and replace it with approved-case access.
-- This does not change SELECT/download access to existing customer documents.
drop policy if exists "clients upload to their accepted cases" on storage.objects;
create policy "clients upload to their accepted cases"
 on storage.objects for insert to authenticated
 with check(
   bucket_id='avofis-private'
   and (storage.foldername(name))[2]=auth.uid()::text
   and exists(
     select 1 from public.avofis_cases c
     join public.avofis_agreements a on a.case_id=c.id and a.signed_at is not null
     join public.avofis_case_assessments r on r.case_id=c.id and r.decision='approved'
     where c.id=(storage.foldername(name))[1]::uuid
       and c.status in ('awaiting_agreement','open')
       and (c.client_user_id=auth.uid() or public.avofis_is_staff())
   )
 );
