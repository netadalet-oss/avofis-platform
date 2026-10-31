'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {load,validate}=require('./stage7-gate.cjs');
const source=load(),copy=()=>structuredClone(source);
test('consented Level 7 active, Level 8 locked, 14 carryovers preserved',()=>{
 assert.deepEqual(validate(source),{current_level:7,next_level_approved:false,carryover_count:14,open_rls:7,
 historic_open_decisions:18,past_level6_failed_attempts:2,new_level7_attempts:1,
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
