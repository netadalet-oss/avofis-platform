\set ON_ERROR_STOP on
-- FORM-02 synthetic PG17 only, after customer_tenant_isolation and P01 migration.
\ir ../migrations/20261029_form02_versioned_client_drafts_staging_only.sql
begin;
-- Existing P09 synthetic fixture requires and tests employee AAL2.
select set_config('request.jwt.claims','{"aal":"aal2"}',false);
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',false);
set role authenticated;
insert into public.avofis_client_document_drafts(owner_user_id,service_slug,locale,content)
values(auth.uid(),'konut-kira-sigorta','ar','{"version":1,"service":"konut-kira-sigorta","locale":"ar","country":"NL","institution":"","purpose":"","chronology":"أولاً","documentList":""}'::jsonb)
returning id \gset private_
insert into public.avofis_client_document_drafts(owner_user_id,case_id,service_slug,locale,content)
values(auth.uid(),'11111111-1111-4111-8111-111111111111','konut-kira-sigorta','nl',
 '{"version":1,"service":"konut-kira-sigorta","locale":"nl","country":"NL","institution":"","purpose":"huur","chronology":"","documentList":""}'::jsonb)
returning id \gset shared_
select set_config('avofis.test.private',:'private_id',false);
select set_config('avofis.test.shared',:'shared_id',false);
do $test$
begin
 if (select count(*) from public.avofis_client_document_drafts)<>2 or
    (select count(*) from public.avofis_client_document_versions)<>2 then
  raise exception 'FORM02 owner or initial versions missing'; end if;
 begin
  update public.avofis_client_document_drafts set status='review_requested',consent_to_staff=true
  where id=current_setting('avofis.test.private')::uuid;
  raise exception 'FORM02 unlinked document shared';
 exception when check_violation then null; end;
 begin
  insert into public.avofis_client_document_drafts(owner_user_id,case_id,service_slug,locale,content)
  values(auth.uid(),'22222222-2222-4222-8222-222222222222','konut-kira-sigorta','nl',
  '{"version":1,"service":"konut-kira-sigorta","locale":"nl","country":"","institution":"","purpose":"","chronology":"","documentList":""}'::jsonb);
  raise exception 'FORM02 forged foreign case link';
 exception when check_violation or insufficient_privilege then null; end;
end $test$;
update public.avofis_client_document_drafts
set content='{"version":1,"service":"konut-kira-sigorta","locale":"ar","country":"NL","institution":"","purpose":"","chronology":"ثانياً","documentList":""}'::jsonb
where id=current_setting('avofis.test.private')::uuid and revision=1;
do $test$
begin
 if (select revision from public.avofis_client_document_drafts where id=current_setting('avofis.test.private')::uuid)<>2
 or (select count(*) from public.avofis_client_document_versions where draft_id=current_setting('avofis.test.private')::uuid)<>2
 then raise exception 'FORM02 optimistic revision history missing'; end if;
 begin
  insert into public.avofis_client_document_versions(draft_id,revision,content,status,consent_to_staff)
  values(current_setting('avofis.test.private')::uuid,999,'{}','draft',false);
  raise exception 'FORM02 client inserted fake revision';
 exception when insufficient_privilege then null; end;
end $test$;
reset role;
-- Admin status alone cannot read private or pending customer content.
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
do $test$ begin
 if (select count(*) from public.avofis_client_document_drafts)<>0
 then raise exception 'FORM02 admin obtained unshared client data'; end if;
end $test$;
insert into public.avofis_staff_capability_grants(staff_user_id,capability,granted_by)
values('dddddddd-dddd-4ddd-8ddd-dddddddddddd','documents',auth.uid()),
 ('dddddddd-dddd-4ddd-8ddd-dddddddddddd','pleadings',auth.uid());
reset role;
select set_config('request.jwt.claim.sub','dddddddd-dddd-4ddd-8ddd-dddddddddddd',false);
set role authenticated;
do $test$ begin
 if (select count(*) from public.avofis_client_document_drafts)<>0
 then raise exception 'FORM02 staff access before explicit consent'; end if;
end $test$;
reset role;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',false);
set role authenticated;
update public.avofis_client_document_drafts set status='review_requested',consent_to_staff=true
where id=current_setting('avofis.test.shared')::uuid and revision=1;
do $test$ begin
 begin
  update public.avofis_client_document_drafts set content='{}'::jsonb
   where id=current_setting('avofis.test.shared')::uuid;
  raise exception 'FORM02 review lock bypassed';
 exception when others then
  if sqlerrm not like 'FORM02 reviewed content is immutable%' then raise; end if;
 end;
end $test$;
reset role;
select set_config('request.jwt.claim.sub','dddddddd-dddd-4ddd-8ddd-dddddddddddd',false);
set role authenticated;
do $test$ begin
 if (select count(*) from public.avofis_client_document_drafts)<>1 or
    (select count(*) from public.avofis_client_document_versions)<>2 then
  raise exception 'FORM02 assignment+two personal capabilities not sufficient'; end if;
 update public.avofis_client_document_drafts set status='draft';
 if found then raise exception 'FORM02 staff edited client authored text'; end if;
end $test$;
insert into public.avofis_client_document_review_notes(draft_id,author_user_id,note)
values(current_setting('avofis.test.shared')::uuid,auth.uid(),'Synthetic staff review only');
reset role;
select set_config('request.jwt.claim.sub','bbbbbbbb-bbbb-4bbb-bbbb-bbbbbbbbbbbb',false);
set role authenticated;
do $test$ begin
 if (select count(*) from public.avofis_client_document_drafts)<>0
 or (select count(*) from public.avofis_client_document_versions)<>0
 or (select count(*) from public.avofis_client_document_review_notes)<>0 then
  raise exception 'FORM02 customer B saw A data'; end if;
end $test$;
reset role;
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
delete from public.avofis_staff_capability_grants
 where staff_user_id='dddddddd-dddd-4ddd-8ddd-dddddddddddd' and capability='pleadings';
reset role;
select set_config('request.jwt.claim.sub','dddddddd-dddd-4ddd-8ddd-dddddddddddd',false);
set role authenticated;
do $test$ begin
 if (select count(*) from public.avofis_client_document_drafts)<>0 or
    (select count(*) from public.avofis_client_document_versions)<>0 or
    (select count(*) from public.avofis_client_document_review_notes)<>0 then
  raise exception 'FORM02 revoked employee retained access'; end if;
 begin
  insert into public.avofis_client_document_review_notes(draft_id,author_user_id,note)
  values(current_setting('avofis.test.shared')::uuid,auth.uid(),'Forged note');
  raise exception 'FORM02 revoked employee wrote review note';
 exception when check_violation or insufficient_privilege then null; end;
end $test$;
reset role;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',false);
set role authenticated;
update public.avofis_client_document_drafts
 set status='withdrawn',consent_to_staff=false
 where id=current_setting('avofis.test.shared')::uuid
 and status='review_requested' and revision=2;
do $test$ begin
 if (select count(*) from public.avofis_client_document_drafts)<>2 or
    (select count(*) from public.avofis_client_document_versions)<>5 or
    (select count(*) from public.avofis_client_document_review_notes)<>1 or
    (select status from public.avofis_client_document_drafts
      where id=current_setting('avofis.test.shared')::uuid)<>'withdrawn' then
  raise exception 'FORM02 owner withdrawal lost revisions or review note'; end if;
 begin
  update public.avofis_client_document_drafts set consent_to_staff=true,status='review_requested'
   where id=current_setting('avofis.test.shared')::uuid;
  raise exception 'FORM02 withdrawn consent silently restored';
 exception when others then
  if sqlerrm not like 'FORM02 withdrawn document is immutable%' then raise; end if;
 end;
end $test$;
reset role;
-- Regrant employee privilege after withdrawal; withdrawn consent MUST still deny access.
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
insert into public.avofis_staff_capability_grants(staff_user_id,capability,granted_by)
values('dddddddd-dddd-4ddd-8ddd-dddddddddddd','pleadings',auth.uid());
reset role;
select set_config('request.jwt.claim.sub','dddddddd-dddd-4ddd-8ddd-dddddddddddd',false);
set role authenticated;
do $test$ begin
 if (select count(*) from public.avofis_client_document_drafts)<>0 or
    (select count(*) from public.avofis_client_document_versions)<>0 or
    (select count(*) from public.avofis_client_document_review_notes)<>0 then
   raise exception 'FORM02 withdrawn consent resurrected staff access'; end if;
end $test$;
reset role;
rollback;
\echo 'PASS FORM02: owner draft, A/B isolation, scoped consent, lock, immutable history, revoke'
