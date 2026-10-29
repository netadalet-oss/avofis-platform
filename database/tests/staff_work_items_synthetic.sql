\set ON_ERROR_STOP on
-- P03 synthetic staff work drafts; disposable PG17 after P01 migration.
\ir ../migrations/20261029_staff_work_items_staging_only.sql
begin;
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
insert into public.avofis_staff_work_items(staff_user_id,module,title,summary,flow,amount_eur_cents)
values(auth.uid(),'payables','Synthetic internal expense','Not a bank transfer','expense',1000);
reset role;
select set_config('request.jwt.claim.sub','dddddddd-dddd-4ddd-8ddd-dddddddddddd',false);
set role authenticated;
do $test$
begin
 if (select count(*) from public.avofis_staff_work_items)<>0
 then raise exception 'P03 operator saw admin-only draft'; end if;
 begin
  insert into public.avofis_staff_work_items(staff_user_id,module,title,summary,flow,amount_eur_cents)
  values(auth.uid(),'payables','Unauthorized invoice note','','expense',500);
  raise exception 'P03 operator bypassed missing payables grant';
 exception when insufficient_privilege then null; end;
end
$test$;
reset role;
-- A verified admin individually grants access to employee D.
select set_config('request.jwt.claim.sub','cccccccc-cccc-4ccc-cccc-cccccccccccc',false);
set role authenticated;
insert into public.avofis_staff_capability_grants(staff_user_id,capability,granted_by)
values('dddddddd-dddd-4ddd-8ddd-dddddddddddd','payables',auth.uid());
reset role;
select set_config('request.jwt.claim.sub','dddddddd-dddd-4ddd-8ddd-dddddddddddd',false);
set role authenticated;
insert into public.avofis_staff_work_items(staff_user_id,module,title,summary,flow,amount_eur_cents)
values(auth.uid(),'payables','Synthetic payable draft','Not a paid or approved transfer','expense',550);
do $test$
begin
 if (select count(*) from public.avofis_staff_work_items)<>1
 then raise exception 'P03 operator cannot see own granted draft'; end if;
 begin
  insert into public.avofis_staff_work_items(staff_user_id,module,title,flow,amount_eur_cents)
  values(auth.uid(),'payables','Forged payment','income',700);
  raise exception 'P03 income inserted through payables';
 exception when check_violation then null; end;
 begin
  insert into public.avofis_staff_work_items(staff_user_id,module,title,state,flow,amount_eur_cents)
  values(auth.uid(),'payables','Forged approved state','approved','expense',500);
  raise exception 'P03 fake approved finance state';
 exception when check_violation then null; end;
 begin
  insert into public.avofis_staff_work_items(staff_user_id,module,title,flow,amount_eur_cents)
  values('cccccccc-cccc-4ccc-cccc-cccccccccccc','payables','Forged admin ownership','expense',500);
  raise exception 'P03 operator forged another employee ownership';
 exception when insufficient_privilege then null; end;
end
$test$;
reset role;
select set_config('request.jwt.claim.sub','aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa',false);
set role authenticated;
do $test$
begin
 if (select count(*) from public.avofis_staff_work_items)<>0
 then raise exception 'P03 client can view staff financial notes'; end if;
end
$test$;
reset role;
rollback;
\echo 'PASS: P03 internal work drafts, finance direction validation, personal staff ownership, no fake approved/paid status, client privacy'
