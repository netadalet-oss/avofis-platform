\set ON_ERROR_STOP on
-- EK B IND-T02 / IND-T04: new disposable PG17 schema, synthetic identities.
\ir ind_case_clearance.sql

-- Case B is still unapproved. Its original independent draft was saved by C.
-- First prove that file-copy procedure and objection action are not interchangeable.
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
update public.avofis_case_clearances set
 ind_form_reviewed=true,requested_action='submit_objection',
 mandate_authorised_actions=array['request_file_copy'],
 mandate_scope_reviewed=true,principal_identity_verified=true,
 principal_signature_verified=true,mandate_signed_on='2026-10-15',
 mandate_valid_until='2099-12-31',mandate_document_sha256=repeat('b',64)
where case_id='22222222-2222-4222-8222-222222222222';
reset role;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',false);
set role authenticated;
do $$
begin
 begin
  update public.avofis_case_clearances set human_approved=true
   where case_id='22222222-2222-4222-8222-222222222222';
  raise exception 'IND-T02 procedure mismatch incorrectly approved';
 exception when others then
  if sqlerrm not like 'Requested IND action does not match%' then raise; end if;
 end;
end $$;
reset role;

-- Now the exact procedure agrees (objection), but the document is file-copy-only.
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
update public.avofis_case_clearances set
 ind_procedure='ind_objection',mandate_authorised_actions=array['request_file_copy']
where case_id='22222222-2222-4222-8222-222222222222';
reset role;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',false);
set role authenticated;
do $$
begin
 begin
  update public.avofis_case_clearances set human_approved=true
   where case_id='22222222-2222-4222-8222-222222222222';
  raise exception 'IND-T02 file-copy mandate was used to approve objection';
 exception when others then
  if sqlerrm not like 'Mandate scope excludes requested action%' then raise; end if;
 end;
end $$;
reset role;

-- A matching authorised action is still blocked by an explicit exclusion.
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
update public.avofis_case_clearances set
 mandate_authorised_actions=array['submit_objection'],
 mandate_excluded_actions=array['submit_objection']
where case_id='22222222-2222-4222-8222-222222222222';
reset role;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',false);
set role authenticated;
do $$
begin
 begin
  update public.avofis_case_clearances set human_approved=true
   where case_id='22222222-2222-4222-8222-222222222222';
  raise exception 'IND-T02 explicitly excluded action approved';
 exception when others then
  if sqlerrm not like 'Mandate scope excludes requested action%' then raise; end if;
 end;
end $$;
reset role;

-- A fresh C draft with consistent scope can be independently approved by A.
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
update public.avofis_case_clearances set mandate_excluded_actions=array['request_file_copy']
 where case_id='22222222-2222-4222-8222-222222222222';
reset role;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',false);
set role authenticated;
update public.avofis_case_clearances set human_approved=true
 where case_id='22222222-2222-4222-8222-222222222222';
update public.avofis_cases set status='open'
 where id='22222222-2222-4222-8222-222222222222';
reset role;

-- IND-T04: exact same reviewed defaults except asylum submission dates.
-- A single 12 June deadline regime label MUST NOT pass for both dates.
insert into public.avofis_cases(id,status) values
 ('33333333-3333-4333-8333-333333333333','review'),
 ('44444444-4444-4444-8444-444444444444','review'),
 ('55555555-5555-4555-8555-555555555555','review');
update public.avofis_cases set status='awaiting_agreement'
 where id in ('33333333-3333-4333-8333-333333333333',
              '44444444-4444-4444-8444-444444444444',
              '55555555-5555-4555-8555-555555555555');
insert into public.avofis_agreements(case_id,signed_at) values
 ('33333333-3333-4333-8333-333333333333',now()),
 ('44444444-4444-4444-8444-444444444444',now()),
 ('55555555-5555-4555-8555-555555555555',now());

select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
insert into public.avofis_case_clearances(
 case_id,jurisdiction,procedure_family,ind_procedure,representative_name,
 representative_role,work_right_verified,professional_authority_verified,
 authority_evidence_reference,procedure_reviewed,notified_or_filed_on,
 deadline_reviewed,deadline_basis,stay_consequences_reviewed,
 asylum_transition_reviewed,specialist_credential_verified,specialist_name,
 privacy_legal_basis_reviewed,secure_document_channel_verified,
 disclosure_and_retention_reviewed,requested_action,
 asylum_application_date,asylum_transition_regime,
 asylum_transition_source_ref,asylum_transition_expert_reviewed
)
select id,'Netherlands','ind','asylum','Synthetic Independent Counsel',
 'specialist review only',true,true,'fixture-authority-verified',
 true,'2026-10-15',true,'Explicit human source and deadline review',true,
 true,true,'Synthetic Qualified Counsel',true,true,true,'review_only',
 case when id='33333333-3333-4333-8333-333333333333' then date '2026-06-11'
      else date '2026-06-12' end,
 'from_2026_06_12',
 'https://ind.nl/nl/asiel-en-nareis-het-migratiepact-en-andere-ontwikkelingen',
 true
from public.avofis_cases
where id in ('33333333-3333-4333-8333-333333333333',
             '44444444-4444-4444-8444-444444444444');

insert into public.avofis_case_clearances(
 case_id,jurisdiction,procedure_family,ind_procedure,representative_name,
 representative_role,work_right_verified,professional_authority_verified,
 authority_evidence_reference,procedure_reviewed,notified_or_filed_on,
 deadline_reviewed,deadline_basis,stay_consequences_reviewed,
 asylum_transition_reviewed,specialist_credential_verified,specialist_name,
 privacy_legal_basis_reviewed,secure_document_channel_verified,
 disclosure_and_retention_reviewed,requested_action,
 asylum_application_date,asylum_transition_regime,
 asylum_transition_source_ref,asylum_transition_expert_reviewed
) values (
 '55555555-5555-4555-8555-555555555555','Netherlands','ind','asylum',
 'Synthetic Independent Counsel','specialist review only',true,true,
 'fixture-authority-verified',true,'2026-10-15',true,
 'Explicit human source and deadline review',true,true,true,
 'Synthetic Qualified Counsel',true,true,true,'initial_asylum_registration',
 '2026-06-12','from_2026_06_12',
 'https://ind.nl/nl/asiel-en-nareis-het-migratiepact-en-andere-ontwikkelingen',true
);
reset role;

select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',false);
set role authenticated;
-- Pre-12-June applying a from-12-June template must fail.
do $$
begin
 begin
  update public.avofis_case_clearances set human_approved=true
   where case_id='33333333-3333-4333-8333-333333333333';
  raise exception 'IND-T04 pre-transition date accepted the post-transition template';
 exception when others then
  if sqlerrm not like 'Asylum 12 June 2026 transition regime mismatch%' then raise; end if;
 end;
end $$;
-- From 12 June correctly classified case can pass technical internal review.
update public.avofis_case_clearances set human_approved=true
 where case_id='44444444-4444-4444-8444-444444444444';
do $$
begin
 begin
  update public.avofis_case_clearances set human_approved=true
   where case_id='55555555-5555-4555-8555-555555555555';
  raise exception 'IND-T06 personal initial asylum registration was delegated';
 exception when others then
  if sqlerrm not like 'Initial asylum registration cannot be delegated%' then raise; end if;
 end;
end $$;
reset role;

-- Reviewer C corrects the pre-transition regime; A independently approves.
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
update public.avofis_case_clearances set
 asylum_transition_regime='before_2026_06_12'
where case_id='33333333-3333-4333-8333-333333333333';
reset role;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',false);
set role authenticated;
update public.avofis_case_clearances set human_approved=true
 where case_id='33333333-3333-4333-8333-333333333333';
update public.avofis_cases set status='open'
 where id in ('33333333-3333-4333-8333-333333333333',
              '44444444-4444-4444-8444-444444444444');
do $$
begin
 if (select asylum_transition_regime
   from public.avofis_case_clearances
   where case_id='33333333-3333-4333-8333-333333333333') =
   (select asylum_transition_regime
   from public.avofis_case_clearances
   where case_id='44444444-4444-4444-8444-444444444444') then
  raise exception 'IND-T04 separate application-date regimes collapsed';
 end if;
end $$;
reset role;
\echo 'PASS: IND-T02 scoped mandate and exclusions; IND-T04 11/12 June split; IND-T06 no delegated asylum filing (disposable only)'
