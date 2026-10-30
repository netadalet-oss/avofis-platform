\set ON_ERROR_STOP on
-- Disposable T10 PG17 fixture, loaded AFTER customer_tenant_isolation.sql.
-- No Supabase Auth, signed Storage URL, provider webhooks or real customer data.
begin;
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
insert into public.avofis_cases(id,client_user_id,title,service_key,price_eur_cents)
values('99999999-9999-4999-8999-999999999999',
 'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa','Synthetic workflow only','documents',8500);
insert into public.avofis_agreements(id,case_id,agreement_version,legal_text)
values('88888888-8888-4888-8888-888888888888',
 '99999999-9999-4999-8999-999999999999','synthetic-v1',
 'Synthetic contractual fixture for database tests only; this is not a real client contract and is not legally binding.');
insert into public.avofis_case_clearances(
 case_id,jurisdiction,procedure_family,representative_name,representative_role,
 work_right_verified,professional_authority_verified,authority_evidence_reference,
 procedure_reviewed,notified_or_filed_on,deadline_reviewed,deadline_basis,
 stay_consequences_reviewed,privacy_legal_basis_reviewed,
 secure_document_channel_verified,disclosure_and_retention_reviewed)
values('99999999-9999-4999-8999-999999999999','Netherlands','other',
 'Synthetic Reviewer','administrative reviewer',true,true,'test-evidence-only',
 true,current_date,true,'Human review simulated in disposable fixture',true,true,true,true);
insert into public.avofis_case_assignments(case_id,staff_user_id,assigned_by)
values('99999999-9999-4999-8999-999999999999',
 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',auth.uid());
reset role;

-- Real signature does not occur: synthetic Auth A invokes existing accept RPC.
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',false);
set role authenticated;
select public.avofis_accept_agreement('99999999-9999-4999-8999-999999999999','Synthetic Client A');
reset role;
select set_config('request.jwt.claim.sub','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',false);
set role authenticated;
update public.avofis_case_clearances set human_approved=true
 where case_id='99999999-9999-4999-8999-999999999999';
reset role;
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
update public.avofis_cases set status='awaiting_agreement'
 where id='99999999-9999-4999-8999-999999999999';
update public.avofis_cases set status='open'
 where id='99999999-9999-4999-8999-999999999999';
reset role;

select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',false);
set role authenticated;
insert into storage.objects(bucket_id,name) values('avofis-private',
 '99999999-9999-4999-8999-999999999999/aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa/97777777-7777-4777-8777-777777777777.pdf');
insert into public.avofis_messages(case_id,sender_id,body)
values('99999999-9999-4999-8999-999999999999',auth.uid(),'Synthetic owner A message');
reset role;
select set_config('request.jwt.claim.sub','dddddddd-dddd-4ddd-8ddd-dddddddddddd',false);
set role authenticated;
insert into public.avofis_document_requests(case_id,requested_by,title)
values('99999999-9999-4999-8999-999999999999',auth.uid(),'Synthetic file request');
insert into public.avofis_messages(case_id,sender_id,body)
values('99999999-9999-4999-8999-999999999999',auth.uid(),'Synthetic assigned operator reply');
reset role;

select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',false);
set role authenticated;
do $$
begin
 if exists(select 1 from public.avofis_cases where id='99999999-9999-4999-8999-999999999999')
 or exists(select 1 from public.avofis_messages where case_id='99999999-9999-4999-8999-999999999999')
 or exists(select 1 from storage.objects where name like '99999999-9999-4999-8999-999999999999/%')
 then raise exception 'Customer B viewed case A resources'; end if;
 begin
  insert into public.avofis_messages(case_id,sender_id,body)
  values('99999999-9999-4999-8999-999999999999',auth.uid(),'B impersonation');
  raise exception 'Customer B posted to A';
 exception when check_violation then null; when insufficient_privilege then null; end;
end $$;
reset role;

-- T10: owner A cannot spoof another principal while posting within its own file.
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',false);
set role authenticated;
do $$
begin
 begin
  insert into public.avofis_messages(case_id,sender_id,body)
  values('99999999-9999-4999-8999-999999999999',
    'bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb','Synthetic forged sender');
  raise exception 'Client A forged B as sender';
 exception when check_violation then null; when insufficient_privilege then null; end;
end $$;
reset role;

-- The payment row below is not sent to Mollie and represents no funds.
insert into public.avofis_payments(id,case_id,mollie_id,amount_eur_cents,status,checkout_url)
values('87777777-7777-4777-8777-777777777777',
 '99999999-9999-4999-8999-999999999999',
 'synthetic-provider-never-contacted',8500,'open','https://example.invalid/no-payment');
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
do $$
begin
 begin
  update public.avofis_cases set status='completed'
  where id='99999999-9999-4999-8999-999999999999';
  raise exception 'Unpaid case unexpectedly completed';
 exception when others then
  if sqlerrm not like 'Verified payment required before completion%' then raise; end if; end;
end $$;
reset role;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',false);
set role authenticated;
do $$
begin
 begin
  update public.avofis_payments set status='paid'
  where case_id='99999999-9999-4999-8999-999999999999';
  raise exception 'Client directly forged payment';
 exception when insufficient_privilege then null; end;
end $$;
reset role;

-- Only the exact 'paid' state may advance the synthetic fee-bearing case.
-- Payment mutations are fixture-owner operations, never customer UI/API writes.
update public.avofis_payments set status='pending' where case_id='99999999-9999-4999-8999-999999999999';
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
do $$ 
begin
 begin
  update public.avofis_cases set status='completed' where id='99999999-9999-4999-8999-999999999999';
  raise exception 'Non-paid status pending unexpectedly completed case';
 exception when others then
  if sqlerrm not like 'Verified payment required before completion%' then raise; end if;
 end;
end $$;
reset role;
update public.avofis_payments set status='authorized' where case_id='99999999-9999-4999-8999-999999999999';
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
do $$ 
begin
 begin
  update public.avofis_cases set status='completed' where id='99999999-9999-4999-8999-999999999999';
  raise exception 'Non-paid status authorized unexpectedly completed case';
 exception when others then
  if sqlerrm not like 'Verified payment required before completion%' then raise; end if;
 end;
end $$;
reset role;
update public.avofis_payments set status='failed' where case_id='99999999-9999-4999-8999-999999999999';
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
do $$ 
begin
 begin
  update public.avofis_cases set status='completed' where id='99999999-9999-4999-8999-999999999999';
  raise exception 'Non-paid status failed unexpectedly completed case';
 exception when others then
  if sqlerrm not like 'Verified payment required before completion%' then raise; end if;
 end;
end $$;
reset role;
update public.avofis_payments set status='refunded' where case_id='99999999-9999-4999-8999-999999999999';
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
do $$ 
begin
 begin
  update public.avofis_cases set status='completed' where id='99999999-9999-4999-8999-999999999999';
  raise exception 'Non-paid status refunded unexpectedly completed case';
 exception when others then
  if sqlerrm not like 'Verified payment required before completion%' then raise; end if;
 end;
end $$;
reset role;
update public.avofis_payments set status='charged_back' where case_id='99999999-9999-4999-8999-999999999999';
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
do $$ 
begin
 begin
  update public.avofis_cases set status='completed' where id='99999999-9999-4999-8999-999999999999';
  raise exception 'Non-paid status charged_back unexpectedly completed case';
 exception when others then
  if sqlerrm not like 'Verified payment required before completion%' then raise; end if;
 end;
end $$;
reset role;
update public.avofis_payments set status='open' where case_id='99999999-9999-4999-8999-999999999999';

-- Database owner simulates a *verified PSP* callback; not a real PSP E2E.
update public.avofis_payments set status='paid'
 where case_id='99999999-9999-4999-8999-999999999999';
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
update public.avofis_cases set status='completed'
 where id='99999999-9999-4999-8999-999999999999';
update public.avofis_cases set status='closed'
 where id='99999999-9999-4999-8999-999999999999';
do $$
begin
 if (select count(*) from public.avofis_case_events
 where case_id='99999999-9999-4999-8999-999999999999')<>5 then
  raise exception 'Full status-event chain was not recorded'; end if;
end $$;
reset role;
-- Closing a synthetic case must not allow new private uploads or staff
-- document requests, even if the agreement remains signed and the operator is assigned.
reset role;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',false);
set role authenticated;
do $$
begin
 begin
  insert into storage.objects(bucket_id,name) values('avofis-private',
   '99999999-9999-4999-8999-999999999999/aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa/96666666-6666-4666-8666-666666666666.pdf');
  raise exception 'Closed case accepted a private object';
 exception when check_violation then null; when insufficient_privilege then null; end;
end $$;
reset role;
select set_config('request.jwt.claim.sub','dddddddd-dddd-4ddd-8ddd-dddddddddddd',false);
set role authenticated;
do $$
begin
 begin
  insert into public.avofis_document_requests(case_id,requested_by,title)
   values('99999999-9999-4999-8999-999999999999',auth.uid(),
    'Staff tried request on closed matter');
  raise exception 'Closed case accepted an operator document request';
 exception when check_violation then null; when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
\echo 'PASS: T10 synthetic agreement, independent clearance, assigned staff, tenant document/message, unpaid deny, simulated provider-paid, case close and events'
