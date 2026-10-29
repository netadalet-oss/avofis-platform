-- REVIEW ONLY / STAGING FIRST. NOT APPLIED TO THE CONNECTED SUPABASE PROJECT.
-- Apply after 20261027_avofis_mvp.sql, 20261027_staff_role_hardening.sql,
-- and 20261027_case_transition_guard.sql (also the case tracking migrations).
-- This patch ADDS a database-level fail-closed admission gate. A client UI
-- checkbox or a JavaScript check is not a substitute for this trigger.
-- This is not approval for AVOfis to practise law or represent IND applicants.
create table public.avofis_case_clearances (
 case_id uuid primary key references public.avofis_cases(id) on delete restrict,
 jurisdiction text not null default '' check (char_length(jurisdiction) <= 100),
 procedure_family text not null default 'unclassified'
   check (procedure_family in ('unclassified','ind','other')),
 ind_procedure text check (ind_procedure is null or ind_procedure in (
   'initial_residence_mvv_family','ind_objection','court_appeal',
   'higher_appeal','asylum','detention_or_removal',
   'ind_file_request','naturalisation'
 )),
 representative_name text not null default '' check (char_length(representative_name)<=160),
 representative_role text not null default '' check (char_length(representative_role)<=160),
 work_right_verified boolean not null default false,
 professional_authority_verified boolean not null default false,
 authority_evidence_reference text not null default '' check (char_length(authority_evidence_reference)<=300),
 procedure_reviewed boolean not null default false,
 notified_or_filed_on date,
 deadline_reviewed boolean not null default false,
 deadline_basis text not null default '' check (char_length(deadline_basis)<=900),
 stay_consequences_reviewed boolean not null default false,
 asylum_transition_reviewed boolean not null default false,
 representation_requested boolean not null default false,
 special_mandate_verified boolean not null default false,
 mandate_reference text not null default '' check (char_length(mandate_reference)<=300),
 ind_form_reviewed boolean not null default false,
 privacy_legal_basis_reviewed boolean not null default false,
 secure_document_channel_verified boolean not null default false,
 disclosure_and_retention_reviewed boolean not null default false,
 specialist_credential_verified boolean not null default false,
 specialist_name text not null default '' check (char_length(specialist_name)<=160),
 human_approved boolean not null default false,
 -- The last independent draft reviewer. Only the trigger may assign this ID.
 reviewed_by uuid references auth.users(id),
 approved_by uuid references auth.users(id),
 approved_at timestamptz,
 reviewed_at timestamptz not null default now(),
 constraint avofis_ind_classification_consistent check (
   (procedure_family='ind' and ind_procedure is not null)
   or (procedure_family in ('unclassified','other') and ind_procedure is null)
 )
);
create index avofis_case_clearances_procedure_idx
 on public.avofis_case_clearances(procedure_family,ind_procedure);

alter table public.avofis_case_clearances enable row level security;
revoke all on public.avofis_case_clearances from public,anon,authenticated;
grant select,insert,update on public.avofis_case_clearances to authenticated;

-- The admin membership comes only from the protected avofis_staff table,
-- never from user-editable JWT user_metadata or submitted browser fields.
create policy "admin reads internal clearance"
 on public.avofis_case_clearances for select to authenticated
 using (public.avofis_is_admin());
create policy "admin creates internal clearance"
 on public.avofis_case_clearances for insert to authenticated
 with check (public.avofis_is_admin());
create policy "admin revises internal clearance"
 on public.avofis_case_clearances for update to authenticated
 using (public.avofis_is_admin()) with check (public.avofis_is_admin());

-- SECURITY DEFINER is needed only to validate case transitions from operator
-- status updates; the function has no direct EXECUTE grant. All data stays
-- in Postgres RLS for direct Data API access.
create or replace function public.avofis_guard_clearance_review()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if auth.uid() is null or not public.avofis_is_admin() then
   raise exception 'A verified admin must perform case-clearance review';
 end if;
 -- The approving admin must be distinct from the admin who last saved G1-G4.
 -- A single INSERT cannot silently certify a complete case.
 if tg_op='INSERT' and new.human_approved then
   raise exception 'Independent second admin approval required';
 end if;
 if tg_op='UPDATE' then
   if new.case_id is distinct from old.case_id then
     raise exception 'The clearance case cannot be reassigned';
   end if;
   if old.human_approved and new.human_approved then
     raise exception 'Approved clearance must be revoked before re-review';
   end if;
   if old.human_approved and exists (
       select 1 from public.avofis_cases c
       where c.id=old.case_id and c.status in ('open','completed')
   ) then
     raise exception 'Active case clearance is immutable; use supervised re-review';
   end if;
 end if;
 if new.human_approved then
   if old.reviewed_by is null or old.reviewed_by=auth.uid() then
     raise exception 'Independent second admin approval required';
   end if;
   -- No evidence, procedure, mandate or reviewer may be modified while
   -- approving. The second admin must approve the previously saved version.
   if (to_jsonb(new)-'human_approved'-'approved_by'-'approved_at'-'reviewed_at')
      is distinct from
      (to_jsonb(old)-'human_approved'-'approved_by'-'approved_at'-'reviewed_at') then
     raise exception 'Approval cannot change saved review evidence';
   end if;
   if new.procedure_family='unclassified' or char_length(btrim(new.jurisdiction))<2
     or not new.procedure_reviewed then
     raise exception 'Country and specific procedure must be reviewed';
   end if;
   if char_length(btrim(new.representative_name))<3
      or char_length(btrim(new.representative_role))<3
      or not new.work_right_verified
      or not new.professional_authority_verified
      or char_length(btrim(new.authority_evidence_reference))<5 then
     raise exception 'Individual professional and work authorisation unverified';
   end if;
   if not new.deadline_reviewed or char_length(btrim(new.deadline_basis))<5
      or not new.stay_consequences_reviewed then
     raise exception 'Deadline and stay consequences must be human reviewed';
   end if;
   if new.procedure_family='ind' then
     if new.notified_or_filed_on is null then
       raise exception 'IND notice/filing date must be reviewed';
     end if;
     if new.ind_procedure='asylum' and not new.asylum_transition_reviewed then
       raise exception '12 June 2026 asylum transition review required';
     end if;
     if new.ind_procedure='ind_file_request' and not new.ind_form_reviewed then
       raise exception 'IND file request requires separate form review';
     end if;
     if new.ind_procedure in ('court_appeal','higher_appeal','asylum','detention_or_removal')
       and (not new.specialist_credential_verified
         or char_length(btrim(new.specialist_name))<3) then
       raise exception 'Authorised specialist must be verified';
     end if;
   end if;
   if new.representation_requested and
      (not new.special_mandate_verified
       or char_length(btrim(new.mandate_reference))<5) then
     raise exception 'Procedure-scoped signed special mandate is required';
   end if;
   if not new.privacy_legal_basis_reviewed
      or not new.secure_document_channel_verified
      or not new.disclosure_and_retention_reviewed then
     raise exception 'Privacy and secure-document G4 review required';
   end if;
   new.approved_by=auth.uid();
   new.approved_at=now();
 else
   new.reviewed_by=auth.uid();
   new.approved_by=null;
   new.approved_at=null;
 end if;
 new.reviewed_at=now();
 return new;
end;
$$;
revoke all on function public.avofis_guard_clearance_review() from public,anon,authenticated;
create trigger avofis_clearance_review_guard
 before insert or update on public.avofis_case_clearances
 for each row execute function public.avofis_guard_clearance_review();

create or replace function public.avofis_require_clearance_before_activation()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 -- This is an additional, independent gate to the existing agreement/payment
 -- case-status trigger. Both must pass before the UPDATE can commit.
 if tg_op='UPDATE'
    and new.status is distinct from old.status
    and new.status in ('open','completed')
    and not exists (
       select 1 from public.avofis_case_clearances a
       where a.case_id=new.id
         and a.human_approved
         and a.approved_by is not null
         and a.approved_at is not null
         and a.procedure_family in ('ind','other')
    ) then
   raise exception 'Case activation blocked: human G1-G4 clearance required';
 end if;
 return new;
end;
$$;
revoke all on function public.avofis_require_clearance_before_activation()
 from public,anon,authenticated;
create trigger avofis_case_clearance_activation_guard
 before update of status on public.avofis_cases
 for each row execute function public.avofis_require_clearance_before_activation();

-- No grants to anon, no public read, no bypass using user_metadata.
-- Two distinct authenticated admin identities are enforced for draft/release.\n-- This is not proof that either individual holds a professional licence.\n-- Human sign-off is a recorded internal control, not proof of actual licensing.
-- The production rollout remains blocked until staging BOLA/RLS and role tests.
