-- AVOfis regulated-service triage and case-activation controls.
-- Apply ONLY after 20261027_avofis_mvp.sql and 20261028_avofis_expanded_workflows.sql.
-- REVIEW against live schema in a staging database first. Not applied by GitHub/Vercel.
-- Staff must confirm jurisdiction, individual work authorisation and any professional requirements.
-- Entries in this table are INTERNAL reviews, not automatic legal advice or deadline calculation.

create table if not exists public.avofis_case_assessments (
 case_id uuid primary key references public.avofis_cases(id) on delete cascade,
 jurisdiction text not null default 'Netherlands' check(char_length(jurisdiction) between 2 and 100),
 secondary_jurisdiction text not null default '' check(char_length(secondary_jurisdiction)<=100),
 authority_name text not null default '' check(char_length(authority_name)<=160),
 procedure_type text not null default '' check(char_length(procedure_type)<=160),
 notified_on date,
 applicable_deadline_on date,
 deadline_basis text not null default '' check(char_length(deadline_basis)<=900),
 deadline_review text not null default 'pending'
   check(deadline_review in ('pending','confirmed','not_applicable')),
 authorisation text not null default 'unverified'
   check(authorisation in ('unverified','permitted','specialist_confirmed','not_permitted')),
 specialist_reference text not null default '' check(char_length(specialist_reference)<=180),
 decision text not null default 'pending'
   check(decision in ('pending','approved','needs_specialist','declined')),
 review_notes text not null default '' check(char_length(review_notes)<=2400),
 reviewer_id uuid references auth.users(id),
 reviewed_at timestamptz,
 updated_at timestamptz not null default now()
);
create index if not exists avofis_case_assessments_decision_idx
 on public.avofis_case_assessments(decision,updated_at desc);

alter table public.avofis_case_assessments enable row level security;
revoke all on public.avofis_case_assessments from anon,authenticated;
grant select,insert,update on public.avofis_case_assessments to authenticated;
create policy "staff read case assessments"
 on public.avofis_case_assessments for select to authenticated
 using(public.avofis_is_staff());
create policy "staff create case assessments"
 on public.avofis_case_assessments for insert to authenticated
 with check(public.avofis_is_staff() and exists(
  select 1 from public.avofis_cases c where c.id=case_id
 ));
create policy "staff update case assessments"
 on public.avofis_case_assessments for update to authenticated
 using(public.avofis_is_staff()) with check(public.avofis_is_staff());

create or replace function public.avofis_assessment_review_guard()
returns trigger language plpgsql set search_path='' as $$
begin
 new.updated_at=now();
 if tg_op='UPDATE' then
   new.case_id=old.case_id;
 end if;
 -- The case itself is immutable; a review can be revised but approval needs proof.
 if new.decision='approved' then
   if new.authorisation not in ('permitted','specialist_confirmed') then
     raise exception 'Review cannot be approved without confirmed service authorisation';
   end if;
   if new.authorisation='specialist_confirmed' and char_length(btrim(new.specialist_reference))<3 then
     raise exception 'Confirm the independent professional responsible for this service';
   end if;
   if new.deadline_review='pending' then
     raise exception 'Deadline applicability must be reviewed before approval';
   end if;
   if new.deadline_review='confirmed' and
        (new.applicable_deadline_on is null or char_length(btrim(new.deadline_basis))<5) then
     raise exception 'A verified deadline requires a date and source';
   end if;
   if new.deadline_review='not_applicable' and new.applicable_deadline_on is not null then
     raise exception 'No deadline date is allowed if not applicable';
   end if;
   if char_length(btrim(new.review_notes))<12 then
     raise exception 'A written approval rationale is required';
   end if;
 end if;
 -- Stamp the actual authenticated reviewer on every change: supplied reviewer metadata is not trusted.
 new.reviewer_id=auth.uid();
 new.reviewed_at=now();
 return new;
end;
$$;
drop trigger if exists avofis_assessment_guard on public.avofis_case_assessments;
create trigger avofis_assessment_guard before insert or update on public.avofis_case_assessments
 for each row execute function public.avofis_assessment_review_guard();

-- Existing case price and signature immutability triggers remain effective.
-- Active case processing now requires BOTH a signed contract and approved human triage.
create or replace function public.avofis_require_case_clearance()
returns trigger language plpgsql set search_path='' as $$
begin
 -- Deny creating an already-active case: no contract or assessment can exist yet.
 if tg_op='INSERT' then
   if new.status in ('open','completed') then
     raise exception 'New cases must first pass contract acceptance and legal clearance';
   end if;
   return new;
 end if;
 if new.client_user_id is distinct from old.client_user_id then
   raise exception 'The client owner of a case cannot be replaced';
 end if;
 if old.status='closed' and new.status is distinct from old.status then
   raise exception 'Closed case cannot be reopened without separate review';
 end if;
 if exists (select 1 from public.avofis_agreements a
            where a.case_id=old.id and a.signed_at is not null)
     and new.service_key is distinct from old.service_key then
   raise exception 'Signed case service scope is immutable; use a reviewed amendment';
 end if;
 if new.status is distinct from old.status and new.status in ('open','completed') then
   if not exists (
     select 1 from public.avofis_case_assessments a
     where a.case_id=new.id and a.decision='approved'
       and a.authorisation in ('permitted','specialist_confirmed')
       and a.deadline_review in ('confirmed','not_applicable')
   ) then
     raise exception 'Complete the jurisdiction, authorisation and deadline assessment before activating the case';
   end if;
   if not exists (
     select 1 from public.avofis_agreements a
     where a.case_id=new.id and a.signed_at is not null
   ) then
     raise exception 'A signed service agreement is required before activating the case';
   end if;
   if new.status='completed' and old.status<>'open' then
     raise exception 'A case must be opened before completion';
   end if;
 end if;
 return new;
end;
$$;
drop trigger if exists avofis_case_clearance_gate on public.avofis_cases;
create trigger avofis_case_clearance_gate before insert or update on public.avofis_cases
 for each row execute function public.avofis_require_case_clearance();

-- Privacy: no SELECT policy for clients/anonymous users on internal legal reviews.
-- A due date without documented review is never automatically treated as a legal deadline.
