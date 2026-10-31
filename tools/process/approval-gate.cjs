'use strict';
// Read-only approval and carryover checker. NO database connections, deploys, or PR merges.
const fs = require('node:fs');
const path = require('node:path');
const expected = ['applications','jobs','media_assets','office_members','offices','posts','topics'].map(x=>'RLS:public.'+x);
function validate(stage, register) {
  if(stage.current_operational_level !== 5 || stage.stage5_transition_authorized !== true
      || stage.stage5_transition_status !== 'APPROVED_EXPLICITLY_BY_USER'
      || stage.stage5_operationally_active !== true
      || stage.stage6_transition_authorized !== false
      || stage.all_later_transitions_require_new_explicit_user_approval !== true) {
    throw Error('Missing valid explicit approval, unauthorized next stage, or inconsistent active stage');
  }
  if (!stage.transition_approval_evidence ||
      !stage.transition_approval_evidence.includes("Seviye 4'ten Seviye 5'e geçişi açıkça onaylıyorum") ||
      !stage.transition_approval_evidence.includes('Her sonraki seviye geçişinden önce yeniden onayımı iste')) {
    throw Error('Specific consent evidence absent');
  }
  if(stage.stage_4_historically_completed !== false || stage.stage_4_historical_completion_ratio !== null
      || stage.prior_80_percent_threshold !== 'INFORMATIONAL_ONLY_NOT_GATE'
      || stage.original_stage5_contracts_verified !== false
      || stage.open_decisions !== 18 || stage.approved_original_work_count !== 973) {
    throw Error('Original history or unresolved decisions falsified');
  }
  if(register.stage !== 5 || register.approval !== 'EXPLICIT_APPROVAL_RECORDED'
    || register.next_stage_approved !== false || register.historical_completion_ratio !== null
    || register.open_decisions !== 18 || register.attempt_limit_per_item_per_level !== 2) {
    throw Error('Carryover register/attempt/approval inconsistency');
  }
  if(!Array.isArray(register.carried_rls) || register.carried_rls.length !== 7
    || !Array.isArray(stage.carry_live_RLS_items) || stage.carry_live_RLS_items.length !== 7) {
    throw Error('Seven carried RLS issues must remain tracked');
  }
  const names=register.carried_rls.map(i=>i.id);
  if(new Set(names).size!==7 || expected.some(i=>!names.includes(i))
    || expected.some(i=>!stage.carry_live_RLS_items.includes(i))) {
    throw Error('Incorrect or duplicate RLS risk identifier');
  }
  for (const item of register.carried_rls) {
    if (item.from_level!==4 || item.to_level!==5 || item.status!=='OPEN_UNREMEDIATED'
      || item.attempts_recorded_level_4!==0 || item.attempts_recorded_level_5!==0
      || item.live_db_modified!==false || !item.evidence) {
      throw Error('Risk/attempt/carryover unexpectedly changed: '+item.id);
    }
  }
  if (!Array.isArray(register.scope_reviews) || register.scope_reviews.length!==2
    || !['UYUM:NL-11','UYUM:NL-14'].every(id=>register.scope_reviews.some(x=>x.id===id))) {
    throw Error('Stage 5 compliance intake missing');
  }
  for (const item of register.scope_reviews) {
    if (item.status!=='SOURCE_INVENTORY_REVIEWED_LEGAL_SCOPE_OPEN'
      || item.legal_conclusion!=='NOT_ESTABLISHED'
      || item.attempts_recorded_level_5!==0
      || !Array.isArray(item.technical_sources) || item.technical_sources.length===0
      || !Array.isArray(item.outstanding) || item.outstanding.length===0) {
      throw Error('Legal conclusion/attempt count cannot be fabricated: '+item.id);
    }
  }
  return {active_stage:5,next_stage_authorized:false,open_rls:7,
          security_fixes_confirmed:0,scope_inventories:2,legal_compliance_accepted:0,
          historical_stage4_completed:false,attempts_invented:0};
}
function load() {
  const root=path.resolve(__dirname,'../..');
  return [
    JSON.parse(fs.readFileSync(path.join(root,'docs/process/seviye5-operasyonel-baslangic.json'),'utf8')),
    JSON.parse(fs.readFileSync(path.join(root,'docs/process/seviye5-onayli-devreden-isler-ve-uyum-kapsami.json'),'utf8'))
  ];
}
if(require.main===module) process.stdout.write(JSON.stringify(validate(...load()),null,2)+'\n');
module.exports={validate,load};
