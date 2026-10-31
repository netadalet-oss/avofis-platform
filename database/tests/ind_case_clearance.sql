\set ON_ERROR_STOP on
-- Disposable PostgreSQL 17 fixture; synthetic identifiers only.
create role anon nologin;
create role authenticated nologin;
create schema auth;
create table auth.users(id uuid primary key);
create function auth.uid() returns uuid language sql stable as $$
 select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid;
$$;
grant usage on schema auth to authenticated;
create table public.avofis_staff(user_id uuid primary key references auth.users(id),role text not null);
create function public.avofis_is_admin() returns boolean
 language sql stable security definer set search_path='' as $$
 select exists(select 1 from public.avofis_staff
               where user_id=auth.uid() and role='admin');
$$;
revoke all on function public.avofis_is_admin() from public,anon;
grant execute on function public.avofis_is_admin() to authenticated;

create table public.avofis_cases (
 id uuid primary key, status text not null, price_eur_cents integer not null default 0
);
create table public.avofis_agreements (
 case_id uuid primary key references public.avofis_cases(id), signed_at timestamptz
);
create table public.avofis_payments (
 case_id uuid references public.avofis_cases(id), status text
);
alter table public.avofis_cases enable row level security;
grant select,update(status) on public.avofis_cases to authenticated;
create policy "test staff selects case" on public.avofis_cases for select
 to authenticated using(public.avofis_is_admin());
create policy "test staff changes status" on public.avofis_cases for update
 to authenticated using(public.avofis_is_admin())
 with check(public.avofis_is_admin());
insert into auth.users(id) values
 ('aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa'),
 ('bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb'),
 ('cccccccc-cccc-4ccc-cccc-cccccccccccc');
insert into public.avofis_staff(user_id,role) values
 ('aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa','admin'),
 ('bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb','operator'),
 ('cccccccc-cccc-4ccc-cccc-cccccccccccc','admin');
insert into public.avofis_cases(id,status) values
 ('11111111-1111-4111-8111-111111111111','awaiting_agreement'),
 ('22222222-2222-4222-8222-222222222222','awaiting_agreement');
insert into public.avofis_agreements(case_id,signed_at)
 values('11111111-1111-4111-8111-111111111111',now()),
       ('22222222-2222-4222-8222-222222222222',now());
\ir ../migrations/20261027_case_transition_guard.sql
\ir ../migrations/20261029_ind_case_activation_guard.sql
\ir ../migrations/20261029_ind_mandate_asylum_regime_guard.sql

-- Privileges: RLS enabled, anon cannot read or write; operator cannot approve.
do $$
begin
 if not (select relrowsecurity from pg_class where oid='public.avofis_case_clearances'::regclass)
    or has_table_privilege('anon','public.avofis_case_clearances','SELECT')
    or has_table_privilege('anon','public.avofis_case_clearances','INSERT')
    or has_table_privilege('anon','public.avofis_case_clearances','UPDATE') then
   raise exception 'Missing clearance RLS or unexpected anon grants';
 end if;
end $$;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',false);
set role authenticated;
-- Refuse activation without a clearance despite a signed agreement.
do $$
begin
 begin
  update public.avofis_cases set status='open'
   where id='11111111-1111-4111-8111-111111111111';
  raise exception 'Activation unexpectedly passed';
 exception when others then
  if sqlerrm not like 'Case activation blocked:%' then raise; end if;
 end;
end $$;

-- Admin may draft; cannot claim approval without mandatory G1-G4 checks.
insert into public.avofis_case_clearances(case_id,procedure_family,ind_procedure)
 values ('11111111-1111-4111-8111-111111111111','ind','ind_objection');
do $$
begin
 begin
  update public.avofis_case_clearances set human_approved=true
   where case_id='11111111-1111-4111-8111-111111111111';
  raise exception 'Incomplete IND review unexpectedly approved';
 exception when others then
  if sqlerrm not like 'Independent second admin approval%' then raise; end if;
 end;
end $$;
update public.avofis_case_clearances
 set jurisdiction='Netherlands',representative_name='Verified Test Jurist',
     representative_role='special gemachtigde',work_right_verified=true,
     professional_authority_verified=true,authority_evidence_reference='staff-verification-ref',
     procedure_reviewed=true,notified_or_filed_on='2026-10-15',
     deadline_reviewed=true,deadline_basis='Human reviewed decision route',
     stay_consequences_reviewed=true,representation_requested=true,
     special_mandate_verified=true,mandate_reference='signed-ind-mandate-ref',
     requested_action='submit_objection',
     mandate_authorised_actions=array['submit_objection'],
     mandate_excluded_actions=array['request_file_copy'],
     mandate_scope_reviewed=true,principal_identity_verified=true,
     principal_signature_verified=true,mandate_signed_on='2026-10-15',
     mandate_valid_until='2099-12-31',mandate_document_sha256=repeat('a',64),
     privacy_legal_basis_reviewed=true,secure_document_channel_verified=true,
     disclosure_and_retention_reviewed=true
 where case_id='11111111-1111-4111-8111-111111111111';

-- Self-approval must fail even for a complete draft.
do $$
begin
 begin
  update public.avofis_case_clearances set human_approved=true
   where case_id='11111111-1111-4111-8111-111111111111';
  raise exception 'Same-admin approval unexpectedly succeeded';
 exception when others then
  if sqlerrm not like 'Independent second admin approval%' then raise; end if;
 end;
end $$;

-- A different verified admin must approve the previously saved evidence.
reset role;
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
do $$
begin
 begin
  update public.avofis_case_clearances
   set human_approved=true, representative_name='Edited during approval'
   where case_id='11111111-1111-4111-8111-111111111111';
  raise exception 'Approval-time evidence modification unexpectedly succeeded';
 exception when others then
  if sqlerrm not like 'Approval cannot change saved review evidence%' then raise; end if;
 end;
end $$;
update public.avofis_case_clearances set human_approved=true
 where case_id='11111111-1111-4111-8111-111111111111';
update public.avofis_cases set status='open'
 where id='11111111-1111-4111-8111-111111111111';
do $$
begin
 if not exists (
  select 1 from public.avofis_cases
  where id='11111111-1111-4111-8111-111111111111' and status='open'
 ) then raise exception 'Valid reviewed case was not opened'; end if;
end $$;
-- An approved clearance for an active case cannot silently be weakened.
do $$
begin
 begin
  update public.avofis_case_clearances set work_right_verified=false
   where case_id='11111111-1111-4111-8111-111111111111';
  raise exception 'Active approval unexpectedly editable';
 exception when others then
  if sqlerrm not like 'Active case clearance is immutable%' then raise; end if;
 end;
end $$;
-- IND file copy request must have its special form reviewed.
insert into public.avofis_case_clearances(
 case_id,procedure_family,ind_procedure,jurisdiction,
 representative_name,representative_role,work_right_verified,
 professional_authority_verified,authority_evidence_reference,
 procedure_reviewed,notified_or_filed_on,deadline_reviewed,deadline_basis,
 stay_consequences_reviewed,representation_requested,special_mandate_verified,
 mandate_reference,privacy_legal_basis_reviewed,
 secure_document_channel_verified,disclosure_and_retention_reviewed
) values (
 '22222222-2222-4222-8222-222222222222','ind','ind_file_request','Netherlands',
 'Verified Test Jurist','special gemachtigde',true,true,'staff-verification-ref',
 true,'2026-10-12',true,'Human reviewed decision route',
 true,true,true,'signed-ind-mandate-ref',true,true,true
);

-- A separate admin now checks the unreviewed IND file request form.
-- The file-request draft above was saved by admin C.
reset role;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',false);
set role authenticated;
do $$
begin
 begin
  update public.avofis_case_clearances set human_approved=true
   where case_id='22222222-2222-4222-8222-222222222222';
  raise exception 'Unreviewed IND file form unexpectedly accepted';
 exception when others then
  if sqlerrm not like 'IND file request requires separate form%' then raise; end if;
 end;
end $$;

-- Operator cannot see internal approvals, even though authenticated has table grants.
reset role;
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',false);
set role authenticated;
do $$
begin
 if exists(select 1 from public.avofis_case_clearances) then
  raise exception 'Non-admin saw clearance records';
 end if;
 begin
  insert into public.avofis_case_clearances(case_id)
    values('22222222-2222-4222-8222-222222222222')
    on conflict (case_id) do update set human_approved=true;
  raise exception 'Operator unexpectedly wrote clearance';
 exception when others then
  if sqlerrm not like 'new row violates row-level security%'
     and sqlerrm not like 'A verified admin must perform%' then raise; end if;
 end;
end $$;
reset role;
\echo 'PASS: IND G1-G4 two-admin review/approval, evidence immutability, RLS and activation'
