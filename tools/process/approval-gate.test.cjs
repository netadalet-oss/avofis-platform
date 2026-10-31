'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {validate,load}=require('./approval-gate.cjs');
const [base,reg]=load();const copy=o=>structuredClone(o);
test('explicit approved 4-to-5 is active, 5-to-6 not authorized',()=>assert.deepEqual(validate(base,reg),{
 active_stage:5,next_stage_authorized:false,open_rls:7,security_fixes_confirmed:0,
 scope_inventories:2,legal_compliance_accepted:0,historical_stage4_completed:false,attempts_invented:0
}));
test('revoke approval is rejected',()=>{const s=copy(base);s.stage5_transition_authorized=false;assert.throws(()=>validate(s,reg));});
test('implicit or mistaken approval status is rejected',()=>{const s=copy(base);s.stage5_transition_status='PENDING_EXPLICIT_USER_APPROVAL';assert.throws(()=>validate(s,reg));});
test('stage 6 cannot be presumed authorized',()=>{const s=copy(base);s.stage6_transition_authorized=true;assert.throws(()=>validate(s,reg));});
test('future preapproval cannot be disabled',()=>{const s=copy(base);s.all_later_transitions_require_new_explicit_user_approval=false;assert.throws(()=>validate(s,reg));});
test('user evidence is mandatory',()=>{const s=copy(base);s.transition_approval_evidence='continue';assert.throws(()=>validate(s,reg));});
test('completion of earlier stage cannot be invented',()=>{const s=copy(base);s.stage_4_historically_completed=true;assert.throws(()=>validate(s,reg));});
test('historical completion ratio cannot be guessed',()=>{const s=copy(base);s.stage_4_historical_completion_ratio=80;assert.throws(()=>validate(s,reg));});
test('18 open decisions preserved',()=>{const s=copy(base);s.open_decisions=0;assert.throws(()=>validate(s,reg));});
test('973 original work items preserved',()=>{const s=copy(base);s.approved_original_work_count=200;assert.throws(()=>validate(s,reg));});
test('all 7 outstanding RLS risk entries required',()=>{const r=copy(reg);r.carried_rls.pop();assert.throws(()=>validate(base,r));});
test('duplicated risk entries rejected',()=>{const r=copy(reg);r.carried_rls[6].id=r.carried_rls[0].id;assert.throws(()=>validate(base,r));});
test('no false production remediation',()=>{const r=copy(reg);r.carried_rls[0].live_db_modified=true;assert.throws(()=>validate(base,r));});
test('no made-up execution attempts',()=>{const r=copy(reg);r.carried_rls[0].attempts_recorded_level_4=2;assert.throws(()=>validate(base,r));});
test('per-item level attempt cap fixed at 2',()=>{const r=copy(reg);r.attempt_limit_per_item_per_level=3;assert.throws(()=>validate(base,r));});
test('both GDPR and DSA source reviews retained',()=>{const r=copy(reg);r.scope_reviews.pop();assert.throws(()=>validate(base,r));});
test('source inventory cannot imply legal compliance',()=>{const r=copy(reg);r.scope_reviews[0].legal_conclusion='COMPLIANT';assert.throws(()=>validate(base,r));});
test('compliance source evidence is required',()=>{const r=copy(reg);r.scope_reviews[1].technical_sources=[];assert.throws(()=>validate(base,r));});
