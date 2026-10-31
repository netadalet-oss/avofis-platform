'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {load,validate}=require('./stage7-gate.cjs');
const source=load(),copy=()=>structuredClone(source);
test('consented Level 7 active, Level 8 locked, 14 carryovers preserved',()=>{
 assert.deepEqual(validate(source),{current_level:7,next_level_approved:false,carryover_count:14,open_rls:7,
 historic_open_decisions:18,past_level6_failed_attempts:2,new_level7_attempts:9,
 code_ci_passed:true,production_modified:false});
});
test('no Level 8 without renewed explicit consent',()=>{
 const d=copy();d.next_stage_approved=true;assert.throws(()=>validate(d),/approval gates/);
});
test('generic non-specific approval is insufficient',()=>{
 const d=copy();d.transition_approval_evidence='Devam et';assert.throws(()=>validate(d),/consent falsified/);
});
test('cannot reinterpret Level 6 as completed',()=>{
 const d=copy();d.previous_stage_historically_completed=true;assert.throws(()=>validate(d),/approval gates/);
});
test('cannot fabricate historical percent',()=>{
 const d=copy();d.previous_stage_completion_ratio=80;assert.throws(()=>validate(d),/approval gates/);
});
test('original 973 work items and 18 open decisions cannot be changed',()=>{
 const d=copy();d.original_approved_work_items=972;assert.throws(()=>validate(d),/constraints/);
 const e=copy();e.original_open_decisions=0;assert.throws(()=>validate(e),/constraints/);
});
test('all fourteen carried open items must survive',()=>{
 const d=copy();d.carried_items.pop();assert.throws(()=>validate(d),/14 carried/);
});
test('duplicate carryover cannot masquerade as another',()=>{
 const d=copy();d.carried_items[13].id=d.carried_items[12].id;
 assert.throws(()=>validate(d),/identity/);
});
test('any previous first failure remains recorded as failure',()=>{
 for(const id of ['SEC:S6-CMS-CONCURRENT-EDIT-GUARD','SEC:S6-CMS-DEFAULTS-PARTIAL-RESET']){
  const d=copy();d.carried_items.find(x=>x.id===id).attempts_level6[0].result='CODE_AND_CI_VERIFIED';
  assert.throws(()=>validate(d),/history lost/);
 }
});
test('Stage 6 prior attempt 2 result cannot be deleted',()=>{
 const d=copy();d.carried_items.find(x=>x.id==='SEC:S6-CMS-DEFAULTS-PARTIAL-RESET').attempts_level6.pop();
 assert.throws(()=>validate(d),/history lost/);
});
test('historical Stage 6 production acceptance cannot be invented',()=>{
 const d=copy();d.carried_items.find(x=>x.id==='SEC:S6-CMS-EXISTING-ROW-UPDATE').stage6_lifecycle_production_deployed=true;
 assert.throws(()=>validate(d),/history lost/);
});
test('Stage 7 new work cannot claim two attempts after one verified',()=>{
 const d=copy();d.new_work[0].attempts_recorded_level7=2;
 assert.throws(()=>validate(d),/falsely claims/);
});
test('Stage 7 CI evidence must name actual workflow',()=>{
 const d=copy();d.new_work[0].attempts[0].ci_run='';
 assert.throws(()=>validate(d),/lacks evidence/);
});
test('code CI success cannot be promoted to production without evidence',()=>{
 const d=copy();d.new_work[0].production_deployed=true;
 assert.throws(()=>validate(d),/falsely claims/);
});
test('no secret rewrites of live risk count',()=>{
 const d=copy();d.live_security_readonly_observations.other_public_tables_rls_disabled=0;
 assert.throws(()=>validate(d),/ungrounded/);
});

test('new functional portal areas are separate works with only one verified code attempt',()=>{
  const work=source.new_work;
  assert.equal(work.length,7);
  assert.deepEqual(work.slice(1).map(x=>x.attempts_recorded_level7),[1,1,1,1,2,2]);
  assert.ok(work.every(x=>x.production_deployed===false));
  assert.ok(work.every(x=>x.staging_browser_tested===false));
});
test('cannot inflate new stage work count without source evidence',()=>{
  const d=copy();d.new_work[1].test_sources=[];
  assert.throws(()=>validate(d),/New portal code item lacks/);
});
test('cannot mark new portal research as deployed or historically accepted',()=>{
  const d=copy();d.new_work[1].production_deployed=true;
  assert.throws(()=>validate(d),/invent/);
});
test('cannot count an invented second attempt for new work',()=>{
  const d=copy();d.new_work[1].attempts_recorded_level7=2;
  assert.throws(()=>validate(d),/per-task evidence/);
});

test('expanded module first failed test remains an explicit failure',()=>{
 const d=copy(),x=d.new_work.find(w=>w.id==='UX:S7-LOCAL-MODULE-EXPANSION');
 x.attempts[0].result='CODE_AND_CI_VERIFIED';
 assert.throws(()=>validate(d),/attempt history/);
});
test('expanded modules cannot execute a third attempt within Stage 7',()=>{
 const d=copy(),x=d.new_work.find(w=>w.id==='UX:S7-LOCAL-MODULE-EXPANSION');
 x.attempts_recorded_level7=3;
 assert.throws(()=>validate(d),/attempt history/);
});
test('unverified metric removal cannot be called production deployed',()=>{
 const d=copy(),x=d.new_work.find(w=>w.id==='SEC:S7-UNVERIFIED-METRICS-HIDE');
 x.production_deployed=true;
 assert.throws(()=>validate(d),/live acceptance/);
});
test('stage progress cannot turn code coverage into live acceptance',()=>{
 const d=copy();d.stage7_code_test_proxy.new_accepted_live_journeys=17;
 assert.throws(()=>validate(d),/misrepresented/);
});

test('two public-claims revisions are preserved and a third is disallowed',()=>{
 const d=copy(),item=d.new_work.find(x=>x.id==='SEC:S7-UNVERIFIED-METRICS-HIDE');
 assert.equal(item.attempts_recorded_level7,2);
 item.attempts_recorded_level7=3;
 assert.throws(()=>validate(d),/live acceptance/);
});
