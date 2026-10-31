'use strict';
const fs = require('node:fs');
const path = require('node:path');
const file = path.resolve(__dirname,'../../docs/process/seviye7-onayli-devredilen-isler.json');
const rlsIds=['applications','jobs','media_assets','office_members','offices','posts','topics'].map(n=>'RLS:public.'+n);
const s6=[
 ['SEC:S6-CMS-EXISTING-ROW-UPDATE',['CODE_AND_CI_VERIFIED']],
 ['SEC:S6-ADMIN-CMS-EXISTING-ROWS',['CODE_AND_CI_VERIFIED']],
 ['SEC:S6-CMS-CONCURRENT-EDIT-GUARD',['FAILED_TEST_ASSERTION','CODE_AND_CI_VERIFIED']],
 ['SEC:S6-CMS-DEFAULTS-PARTIAL-RESET',['FAILED_TEST_ASSERTION','CODE_AND_CI_VERIFIED']]
];
function validate(d){
 if(d.project!=='AVOfis' || d.stage!==7 || d.source_stage!==6
   ||d.stage_status!=='ACTIVE_EXPLICIT_USER_APPROVAL'
   ||d.next_stage!==8 || d.next_stage_approved!==false
   ||d.all_future_transitions_require_explicit_advance_approval!==true
   ||d.maximum_real_attempts_per_item_per_stage!==2
   ||d.previous_stage_historically_completed!==false || d.previous_stage_completion_ratio!==null)
   throw Error('Stage 7 open and Stage 8 approval gates inconsistent');
 if(!d.transition_approval_evidence?.includes("Seviye 6'dan Seviye 7'ye geçişi açıkça onaylıyorum")
   ||!d.transition_approval_evidence?.includes("Seviye 8'e geçmeden önce yeniden açık onayımı iste")
   ||d.original_approved_work_items!==973 || d.original_technical_contracts!==973
   ||d.original_total_workflows!==154 || d.original_open_decisions!==18
   ||d.original_stage7_task_ids_available!==false
   ||d.production_modified!==false || d.main_merged!==false)throw Error('Original project constraints or user consent falsified');
 if(!Array.isArray(d.carried_items) || d.carried_items.length!==14)throw Error('14 carried open records required');
 const ids=d.carried_items.map(x=>x.id);
 if(new Set(ids).size!==14 ||
    [...rlsIds,'UYUM:NL-11','UYUM:NL-14','SEC:S5-PORTAL-CMS-ROLE',...s6.map(x=>x[0])]
     .some(id=>!ids.includes(id)))throw Error('Unexpected or missing carried work identity');
 for(const item of d.carried_items){
   if(item.to_stage!==7 || item.attempts_recorded_level7!==0
     ||item.carry_status?.startsWith('COMPLETED')
     ||item.carry_status?.startsWith('ACCEPTED'))throw Error('Carryover falsely marked complete/attempted');
 }
 for(const [id,results] of s6){
  const w=d.carried_items.find(x=>x.id===id);
  if(w.attempts_recorded_level6!==results.length || !Array.isArray(w.attempts_level6)
    ||w.attempts_level6.length!==results.length ||
    w.attempts_level6.some((a,i)=>a.result!==results[i] || a.index!==i+1 || !a.ci_run)
    || w.stage6_lifecycle_production_deployed!==false
    || w.stage6_lifecycle_accepted_as_historical_deliverable!==false)
    throw Error('Past work or failure history lost: '+id);
 }
 if(!Array.isArray(d.new_work)||d.new_work.length!==5)throw Error('Stage 7 new work list invalid');
 const newly=[
  'UX:S7-CASES-LOCAL-RESEARCH','UX:S7-STATUTES-LOCAL-RESEARCH',
  'UX:S7-WORKSPACE-LOCAL-TASKS','SEC:S7-HEADER-NAV-ADMIN-ROLE'
 ];
 if(d.new_work.some((x,i)=>d.new_work.findIndex(y=>y.id===x.id)!==i) ||
    newly.some(id=>!d.new_work.some(x=>x.id===id)))
    throw Error('New stage work omitted or duplicated');
 for(const item of d.new_work.slice(1)){
   if(item.status!=='DRAFT_CODE_CI_PASS_NOT_MERGED'
      ||item.attempts_recorded_level7!==1
      ||!Array.isArray(item.attempts)||item.attempts.length!==1
      ||item.attempts[0].index!==1||item.attempts[0].result!=='CODE_AND_CI_VERIFIED'
      ||item.attempts[0].total_tests_passed!==261 || !item.attempts[0].ci_run
      ||!item.attempts[0].ci_job_id ||item.production_deployed!==false
      ||item.staging_browser_tested!==false||item.historical_work_id!==null
      ||item.accepted_as_historical_deliverable!==false
      ||!Array.isArray(item.source_paths) ||item.source_paths.length<2
      ||!Array.isArray(item.test_sources)||item.test_sources.length===0)
      throw Error('New portal code item lacks per-task evidence or invents acceptance');
 }
 const w=d.new_work[0];
 if(w.id!=='SEC:S7-ADMIN-CMS-SESSION-WRITE-GUARD'
   ||w.status!=='DRAFT_CODE_CI_PASS_NOT_MERGED'
   ||w.attempts_recorded_level7!==1
   ||!Array.isArray(w.attempts)||w.attempts.length!==1
   ||w.attempts[0].index!==1||w.attempts[0].result!=='CODE_AND_CI_VERIFIED'
   ||w.attempts[0].total_tests_passed!==211
   ||!w.attempts[0].ci_run || !w.attempts[0].ci_job_id
   ||w.production_deployed!==false || w.live_db_modified!==false
   ||w.historical_work_id!==null || w.accepted_as_historical_deliverable!==false
   ||w.staging_browser_tested!==false)
   throw Error('Stage 7 change lacks evidence or falsely claims delivery');
 const live=d.live_security_readonly_observations;
 if(live?.profiles?.rls_enabled!==true
   ||live?.profiles?.select_own_policy!=='Users can read own profile'
   ||live?.other_public_tables_rls_disabled!==7
   ||live?.other_auth_password_protection_warnings!==1)
   throw Error('Live read-only Supabase risk summary ungrounded');
 return {current_level:7,next_level_approved:false,carryover_count:14,open_rls:7,
         historic_open_decisions:18,past_level6_failed_attempts:2,
         new_level7_attempts:5,code_ci_passed:true,production_modified:false};
}
function load(){return JSON.parse(fs.readFileSync(file,'utf8'));}
if(require.main===module)process.stdout.write(JSON.stringify(validate(load()),null,2)+'\n');
module.exports={load,validate};
