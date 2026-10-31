'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {check,load}=require('./stage6-gate.cjs');
const source=load(), copy=x=>structuredClone(x);
test('Stage 6 approval with ten unresolved work records is valid',()=>{
  assert.deepEqual(check(source),{operational_stage:6,stage7_authorized:false,
    carried_items:10,open_live_rls:7,production_modified:false,
    stage5_historical_complete:false,new_stage6_work:1});
});
test('no Stage 7 transition without new approval',()=>{
  const d=copy(source);d.stage7_transition_approved=true;assert.throws(()=>check(d));
});
test('a generic message not tied to Stage 6 is insufficient',()=>{
  const d=copy(source);d.approval_evidence.context='Unknown';assert.throws(()=>check(d));
});
test('Stage 5 may not be marked historically completed',()=>{
  const d=copy(source);d.stage5_historically_completed=true;assert.throws(()=>check(d));
});
test('open RLS risk cannot disappear',()=>{
  const d=copy(source);d.carried_open_items.pop();assert.throws(()=>check(d));
});
test('RLS risk duplication is rejected',()=>{
  const d=copy(source);d.carried_open_items[6].id=d.carried_open_items[0].id;assert.throws(()=>check(d));
});
test('unapproved 3rd attempt in Stage 6 rejected',()=>{
  const d=copy(source);d.new_work[0].attempts_recorded_level6=3;assert.throws(()=>check(d));
});
test('previous Stage 5 attempt evidence is retained',()=>{
  const d=copy(source);d.carried_open_items.find(i=>i.id==='SEC:S5-PORTAL-CMS-ROLE').attempts_recorded_level5=0;
  assert.throws(()=>check(d));
});
test('no invented Stage 6 carryover attempts',()=>{
  const d=copy(source);d.carried_open_items[0].attempts_recorded_level6=1;assert.throws(()=>check(d));
});
test('no fabricated production modification',()=>{
  const d=copy(source);d.production_modified=true;assert.throws(()=>check(d));
});
test('open 18 decisions remain open',()=>{
  const d=copy(source);d.historical_open_decisions=0;assert.throws(()=>check(d));
});
test('no fabricated completion of new Stage 6 work',()=>{
  const d=copy(source);d.new_work[0].status='PRODUCTION_READY';assert.throws(()=>check(d));
});

test('Stage 6 CMS code/CI success is not production acceptance',()=>{
  const d=copy(source),w=d.new_work[0];
  assert.equal(w.status,'DRAFT_CODE_CI_PASS_NOT_MERGED');
  assert.equal(w.attempts_recorded_level6,1);
  assert.equal(w.production_deployed,false);
  assert.equal(w.staging_integration_verified,false);
});
test('a successful CI claim must have an existing workflow evidence reference',()=>{
  const d=copy(source);delete d.new_work[0].attempts[0].ci_run;
  assert.throws(()=>check(d),/CI success/);
});
test('attempt total must equal number of recorded attempts',()=>{
  const d=copy(source);d.new_work[0].attempts_recorded_level6=2;
  assert.throws(()=>check(d),/matching evidence/);
});
test('no false production deployment or live DB change may be claimed',()=>{
  const d=copy(source);d.new_work[0].production_deployed=true;
  assert.throws(()=>check(d),/live or historical/);
  const e=copy(source);e.new_work[0].live_db_modified=true;
  assert.throws(()=>check(e),/live or historical/);
});
