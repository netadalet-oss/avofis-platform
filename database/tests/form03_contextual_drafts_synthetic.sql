\set ON_ERROR_STOP on
-- FORM03 PostgreSQL17 real constraints on disposable A/B Auth/RLS fixture.
-- Must follow customer_tenant_isolation, P01-P09 and FORM02 tests.
\ir ../migrations/20261030_form03_contextual_service_schemas.sql
begin;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',false);
select set_config('request.jwt.claims','{"aal":"aal1"}',false);
set role authenticated;
-- Existing v1 format remains readable/writable for backwards compatibility.
insert into public.avofis_client_document_drafts(owner_user_id,service_slug,locale,content)
values(auth.uid(),'egitim-diploma','tr',
'{"version":1,"service":"egitim-diploma","locale":"tr","country":"NL","institution":"","purpose":"","chronology":"","documentList":""}'::jsonb)
returning id \gset v1_
-- A valid v2 draft may be saved with missing answers and revised later.
insert into public.avofis_client_document_drafts(owner_user_id,case_id,service_slug,locale,content)
values(auth.uid(),'11111111-1111-4111-8111-111111111111',
'konut-kira-sigorta','ar',
'{"version":2,"schemaRevision":1,"service":"konut-kira-sigorta","locale":"ar","country":"","institution":"","purpose":"","chronology":"","documentList":"","answers":{}}'::jsonb)
returning id \gset v2_
select set_config('avofis.form03.id',:'v2_id',false);
do $proof$
begin
 if (select count(*) from public.avofis_client_document_versions
     where draft_id=current_setting('avofis.form03.id')::uuid)<>1
  then raise exception 'FORM03 initial v2 revision was not recorded'; end if;
 begin
  update public.avofis_client_document_drafts
   set status='review_requested',consent_to_staff=true
   where id=current_setting('avofis.form03.id')::uuid;
  raise exception 'FORM03 handed off incomplete form to staff';
 exception when check_violation then null; end;
end $proof$;
-- Invalid foreign field is rejected by immutable database constraint.
do $bad$
begin
 begin
  insert into public.avofis_client_document_drafts(owner_user_id,service_slug,locale,content)
  values(auth.uid(),'konut-kira-sigorta','en',
  '{"version":2,"schemaRevision":1,"service":"konut-kira-sigorta","locale":"en","country":"NL","institution":"","purpose":"","chronology":"","documentList":"","answers":{"invoiceAmount":"10.00"}}'::jsonb);
  raise exception 'FORM03 accepted amount field in housing schema';
 exception when check_violation then null; end;
 begin
  insert into public.avofis_client_document_drafts(owner_user_id,service_slug,locale,content)
  values(auth.uid(),'konut-kira-sigorta','en',
  '{"version":2,"schemaRevision":1,"service":"konut-kira-sigorta","locale":"en","country":"NL","institution":"","purpose":"","chronology":"","documentList":"","answers":{"incidentDate":"2026-02-30"}}'::jsonb);
  raise exception 'FORM03 accepted impossible calendar date';
 exception when check_violation then null; end;
 begin
  insert into public.avofis_client_document_drafts(owner_user_id,service_slug,locale,content)
  values(auth.uid(),'konut-kira-sigorta','en',
  '{"version":2,"schemaRevision":1,"service":"konut-kira-sigorta","locale":"en","country":"NL","institution":"","purpose":"","chronology":"","documentList":"","answers":{},"staffApproved":true}'::jsonb);
  raise exception 'FORM03 accepted forged staff approval field';
 exception when check_violation then null; end;
end $bad$;
-- Valid context, self-reported chronology, and explicit requested action;
-- the owner can hand off a genuine draft without creating a filing record.
update public.avofis_client_document_drafts
set content=jsonb_set(
 jsonb_set(
  jsonb_set(
   jsonb_set(content,'{country}','"NL"'::jsonb),
    '{purpose}','"Lease and repairs"'::jsonb),
   '{chronology}','"The applicant describes a faulty roof and water damage."'::jsonb),
  '{answers,requestedAction}','"Ask staff to review repair request."'::jsonb),
 status='review_requested',consent_to_staff=true
where id=current_setting('avofis.form03.id')::uuid and revision=1;
do $proof$
begin
 if (select revision from public.avofis_client_document_drafts
     where id=current_setting('avofis.form03.id')::uuid)<>2
  or (select count(*) from public.avofis_client_document_versions
     where draft_id=current_setting('avofis.form03.id')::uuid)<>2
  or (select content->>'version' from public.avofis_client_document_drafts
     where id=current_setting('avofis.form03.id')::uuid)<>'2'
 then raise exception 'FORM03 versioned handoff did not persist complete v2 form'; end if;
end $proof$;
reset role;
-- A's confidential service answers and version history are opaque to B.
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',false);
set role authenticated;
do $isolation$
begin
 if (select count(*) from public.avofis_client_document_drafts
      where id=current_setting('avofis.form03.id')::uuid)<>0
  or (select count(*) from public.avofis_client_document_versions
      where draft_id=current_setting('avofis.form03.id')::uuid)<>0
 then raise exception 'FORM03 A/B tenant isolation failed'; end if;
end $isolation$;
reset role;
rollback;
\echo 'PASS FORM03: existing v1 retained, v2 self-reported data saved, invalid fields/dates/approval rejected, review gate and A/B isolation'
