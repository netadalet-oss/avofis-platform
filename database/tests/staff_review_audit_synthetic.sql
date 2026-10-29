\set ON_ERROR_STOP on
-- Disposable PG17 AFTER P03 synthetic tests; no live users or payments.
\ir ../migrations/20261029_staff_review_and_audit_staging_only.sql
begin;
-- C grants a narrowly scoped payables privilege to D; audit must record this.
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
insert into public.avofis_staff_capability_grants(staff_user_id,capability,granted_by)
values('dddddddd-dddd-4ddd-8ddd-dddddddddddd','payables',auth.uid());
reset role;
select set_config('request.jwt.claim.sub','dddddddd-dddd-4ddd-8ddd-dddddddddddd',false);
set role authenticated;
insert into public.avofis_staff_work_items(staff_user_id,module,title,summary,flow,amount_eur_cents)
 values(auth.uid(),'payables','Synthetic invoice payable','Internal preparatory note','expense',640)
 returning id \gset d_
select set_config('avofis.test_d_id', :'d_id', false);
-- Work item owner submits for independent internal review.
update public.avofis_staff_work_items
 set state='review_requested' where id=current_setting('avofis.test_d_id')::uuid;
do $locked$
begin
 begin
  update public.avofis_staff_work_items
  set title='Tampered after review' where id=current_setting('avofis.test_d_id')::uuid;
  raise exception 'P04 submitted note mutated';
 exception when others then
   if sqlerrm not like 'P04 internal review lock:%'
      then raise; end if;
 end;
 if (select count(*) from public.avofis_staff_work_item_events
     where work_item_id=current_setting('avofis.test_d_id')::uuid)<>2 then
  raise exception 'P04 event sequence not complete'; end if;
 begin
  insert into public.avofis_staff_work_item_signoffs(work_item_id,reviewer_user_id,decision)
  values(current_setting('avofis.test_d_id')::uuid,auth.uid(),'reviewed_internal');
  raise exception 'P04 owner self signed review';
 exception when insufficient_privilege then null; end;
end $locked$;
reset role;
-- Admin C may sign the staff item but not own submitted item.
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
insert into public.avofis_staff_work_item_signoffs(work_item_id,reviewer_user_id,decision)
values(current_setting('avofis.test_d_id')::uuid,auth.uid(),'reviewed_internal');
do $twice$
begin
 begin
  insert into public.avofis_staff_work_item_signoffs(work_item_id,reviewer_user_id,decision)
  values(current_setting('avofis.test_d_id')::uuid,auth.uid(),'reviewed_internal');
  raise exception 'P05 reviewer signed twice';
 exception when unique_violation then null; end;
end $twice$;
-- Admin C's self-owned draft cannot be self-reviewed.
insert into public.avofis_staff_work_items(staff_user_id,module,title,summary,flow,amount_eur_cents)
values(auth.uid(),'payables','Admin-owned expense note','Internal only','expense',700)
 returning id \gset c_
select set_config('avofis.test_c_id', :'c_id', false);
update public.avofis_staff_work_items set state='review_requested' where id=current_setting('avofis.test_c_id')::uuid;
do $own$
begin
 begin
  insert into public.avofis_staff_work_item_signoffs(work_item_id,reviewer_user_id,decision)
  values(current_setting('avofis.test_c_id')::uuid,auth.uid(),'reviewed_internal');
  raise exception 'P05 admin self reviewed';
 exception when insufficient_privilege then null; end;
end $own$;
reset role;
-- Independent admin E signs D item, but cannot impersonate admin C.
select set_config('request.jwt.claim.sub','eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',false);
set role authenticated;
do $spoof$
begin
 begin
  insert into public.avofis_staff_work_item_signoffs(work_item_id,reviewer_user_id,decision)
  values(current_setting('avofis.test_c_id')::uuid,'cccccccc-cccc-4ccc-cccc-cccccccccccc','reviewed_internal');
  raise exception 'P05 reviewer impersonation permitted';
 exception when insufficient_privilege then null; end;
end $spoof$;
insert into public.avofis_staff_work_item_signoffs(work_item_id,reviewer_user_id,decision)
 values(current_setting('avofis.test_d_id')::uuid,auth.uid(),'reviewed_internal');
do $count$
begin
 if (select count(distinct reviewer_user_id) from public.avofis_staff_work_item_signoffs
     where work_item_id=current_setting('avofis.test_d_id')::uuid)<>2 then
  raise exception 'P05 distinct reviewers not recorded'; end if;
 if exists(select 1 from public.avofis_staff_work_item_signoffs
     where decision not in('reviewed_internal','changes_requested')) then
  raise exception 'P05 official/payment success state unexpectedly allowed'; end if;
end $count$;
reset role;
-- Privilege revoke has an immutable event: staff retains no unseen payables.
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
delete from public.avofis_staff_capability_grants
 where staff_user_id='dddddddd-dddd-4ddd-8ddd-dddddddddddd' and capability='payables';
do $audit$
begin
 if (select count(*) from public.avofis_staff_capability_events
    where staff_user_id='dddddddd-dddd-4ddd-8ddd-dddddddddddd'
      and capability='payables')<>2 then
   raise exception 'P04 capability grant/revoke not audited'; end if;
 begin
  delete from public.avofis_staff_capability_events;
  raise exception 'P04 capability audit tampering succeeded';
 exception when insufficient_privilege then null; end;
 begin
  update public.avofis_staff_work_item_events set event_kind='updated';
  raise exception 'P04 work item audit tampering succeeded';
 exception when insufficient_privilege then null; end;
 begin
  update public.avofis_staff_work_item_signoffs set decision='changes_requested';
  raise exception 'P04 independent signoff tampering succeeded';
 exception when insufficient_privilege then null; end;
end $audit$;
reset role;
select set_config('request.jwt.claim.sub','dddddddd-dddd-4ddd-8ddd-dddddddddddd',false);
set role authenticated;
do $revoked$
begin
 if (select count(*) from public.avofis_staff_work_items where id=current_setting('avofis.test_d_id')::uuid)<>0
    or (select count(*) from public.avofis_staff_work_item_signoffs
      where work_item_id=current_setting('avofis.test_d_id')::uuid)<>0 then
  raise exception 'P05 revoked operator retained finance drafts/reviews'; end if;
end $revoked$;
reset role;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',false);
set role authenticated;
do $client$
begin
 if (select count(*) from public.avofis_staff_work_item_signoffs)<>0 then
  raise exception 'P05 unrelated client sees staff review'; end if;
end $client$;
reset role;
rollback;
\echo 'PASS: P04/P05 immutable grant/revoke audit, draft lock, no self-review, two distinct admin internal signoffs, immediate revoke and client isolation (synthetic)'
