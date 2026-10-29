-- AVOfis v17 EK B IND-T02 / IND-T04: un-applied, staging-only.
-- Not an IND filing authorisation, legal deadline calculator or legal opinion.
-- Apply AFTER the v17 independent G1-G4 approval migration.
begin;
alter table public.avofis_case_clearances
 add column requested_action text not null default 'review_only'
   check (requested_action in ('review_only','request_file_copy','submit_objection',
       'court_appeal','higher_appeal','initial_asylum_registration')),
 add column mandate_authorised_actions text[] not null default '{}',
 add column mandate_excluded_actions text[] not null default '{}',
 add column mandate_scope_reviewed boolean not null default false,
 add column principal_identity_verified boolean not null default false,
 add column principal_signature_verified boolean not null default false,
 add column mandate_signed_on date,
 add column mandate_valid_until date,
 add column mandate_document_sha256 text,
 add column asylum_application_date date,
 add column asylum_transition_regime text
    check (asylum_transition_regime is null or
           asylum_transition_regime in ('before_2026_06_12','from_2026_06_12')),
 add column asylum_transition_source_ref text not null default '',
 add column asylum_transition_expert_reviewed boolean not null default false;

-- Called from database triggers only. No direct anonymous or client EXECUTE.
-- Prevents accepting a file-copy-only mandate for an objection, and never
-- converts an initial asylum filing into a delegate-initiated process.
create or replace function public.avofis_assert_ind_scope(
  p_clearance public.avofis_case_clearances
) returns void language plpgsql security invoker set search_path='' as $$
declare
 expected_action text;
begin
 if p_clearance.procedure_family <> 'ind' then return; end if;
 if p_clearance.requested_action = 'initial_asylum_registration' then
   raise exception 'Initial asylum registration cannot be delegated by this service';
 end if;

 expected_action := case p_clearance.ind_procedure
   when 'ind_file_request' then 'request_file_copy'
   when 'ind_objection' then 'submit_objection'
   when 'court_appeal' then 'court_appeal'
   when 'higher_appeal' then 'higher_appeal'
   else null end;
 if p_clearance.requested_action <> 'review_only' and
    (expected_action is null or p_clearance.requested_action <> expected_action) then
   raise exception 'Requested IND action does not match the reviewed procedure';
 end if;
 if p_clearance.requested_action <> 'review_only'
    and not p_clearance.representation_requested then
   raise exception 'Official action requires a specifically reviewed representation request';
 end if;
 if p_clearance.representation_requested then
   if p_clearance.requested_action = 'review_only'
     or not p_clearance.mandate_scope_reviewed
     or not p_clearance.principal_identity_verified
     or not p_clearance.principal_signature_verified
     or p_clearance.mandate_signed_on is null
     or p_clearance.mandate_signed_on > current_date
     or p_clearance.mandate_valid_until is null
     or p_clearance.mandate_valid_until < current_date
     or p_clearance.mandate_valid_until < p_clearance.mandate_signed_on
     or p_clearance.mandate_document_sha256 is null
     or p_clearance.mandate_document_sha256 !~ '^[a-fA-F0-9]{64}$'
     or p_clearance.requested_action <> all(p_clearance.mandate_authorised_actions)
     or p_clearance.requested_action = any(p_clearance.mandate_excluded_actions) then
     raise exception 'Mandate scope excludes requested action or evidence is incomplete';
   end if;
 end if;

 if p_clearance.ind_procedure = 'asylum' then
   if p_clearance.requested_action <> 'review_only'
       or p_clearance.representation_requested then
     raise exception 'Asylum needs independent legal review; filing not delegated';
   end if;
   if p_clearance.asylum_application_date is null
     or not p_clearance.asylum_transition_reviewed
     or not p_clearance.asylum_transition_expert_reviewed
     or char_length(btrim(p_clearance.asylum_transition_source_ref)) < 12 then
     raise exception 'Asylum date-regime source and expert review required';
   end if;
   if (p_clearance.asylum_application_date < date '2026-06-12'
         and p_clearance.asylum_transition_regime <> 'before_2026_06_12')
       or (p_clearance.asylum_application_date >= date '2026-06-12'
         and p_clearance.asylum_transition_regime <> 'from_2026_06_12')
       or p_clearance.asylum_transition_regime is null then
     raise exception 'Asylum 12 June 2026 transition regime mismatch';
   end if;
 end if;
end;
$$;
revoke all on function public.avofis_assert_ind_scope(
 public.avofis_case_clearances) from public,anon,authenticated;

create or replace function public.avofis_check_ind_scope_on_review()
returns trigger language plpgsql security definer set search_path='' as $$
begin
 if new.human_approved then
  perform public.avofis_assert_ind_scope(new);
 end if;
 return new;
end;
$$;
revoke all on function public.avofis_check_ind_scope_on_review()
 from public,anon,authenticated;
-- Runs after avofis_clearance_review_guard (alphabetical trigger name order).
drop trigger if exists zz_avofis_ind_scope_review_guard
 on public.avofis_case_clearances;
create trigger zz_avofis_ind_scope_review_guard
 before insert or update on public.avofis_case_clearances
 for each row execute function public.avofis_check_ind_scope_on_review();

-- Defense-in-depth for cases that had clearance before this migration:
-- an old approved row with no newly required scope cannot activate.
create or replace function public.avofis_check_ind_scope_on_activation()
returns trigger language plpgsql security definer set search_path='' as $$
declare c public.avofis_case_clearances%rowtype;
begin
 if tg_op='UPDATE' and new.status is distinct from old.status
    and new.status in ('open','completed') then
   select * into c from public.avofis_case_clearances where case_id=new.id;
   if found and c.procedure_family='ind' then
      perform public.avofis_assert_ind_scope(c);
   end if;
 end if;
 return new;
end;
$$;
revoke all on function public.avofis_check_ind_scope_on_activation()
 from public,anon,authenticated;
drop trigger if exists zz_avofis_ind_scope_activation_gate on public.avofis_cases;
create trigger zz_avofis_ind_scope_activation_gate
 before update of status on public.avofis_cases
 for each row execute function public.avofis_check_ind_scope_on_activation();
commit;

-- Reviewer must still inspect official decisions, actual mandate, signature,
-- real identity, deadlines, court/IND filing requirements and residency effects.
-- No real asylum/dossier information may be copied into CI fixtures.
