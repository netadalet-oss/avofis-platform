'use strict';
// Stage 6 status validator only; no database, network, or deployment actions.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const file=path.join(root,'docs/process/seviye6-onayli-devredilen-isler.json');
const ids=['applications','jobs','media_assets','office_members','offices','posts','topics'].map(x=>'RLS:public.'+x);
function check(d) {
  if(d.stage!==6 || d.stage_status!=='ACTIVE_EXPLICIT_USER_APPROVAL'
    || d.source_stage!==5 || d.stage5_historically_completed!==false
    || d.stage5_completion_percent!==null
    || d.stage7_transition_approved!==false
    || d.all_later_transitions_require_explicit_approval!==true
    || d.per_item_attempts_max_per_level!==2)throw Error('Stage 6 approval and next-stage constraints invalid');
  if(d.approval_evidence?.message!=='Onay'
     || !d.approval_evidence?.context?.includes('Seviye 6')
     || d.original_stage6_task_registry_available!==false
     || d.production_modified!==false || d.main_modified!==false
     || d.historical_open_decisions!==18 || d.original_work_items_approved!==973
     || d.technical_contracts_approved!==973)throw Error('Stage 6 approval evidence or original source constraints invalid');
  if(!Array.isArray(d.carried_open_items)||d.carried_open_items.length!==10
     || !Array.isArray(d.new_work) || d.new_work.length===0)throw Error('Missing open carryovers/new work');
  const items=d.carried_open_items;
  const names=items.map(x=>x.id);
  if(new Set(names).size!==10 || ids.some(id=>!names.includes(id))
    || !names.includes('UYUM:NL-11')||!names.includes('UYUM:NL-14')
    || !names.includes('SEC:S5-PORTAL-CMS-ROLE'))throw Error('Lost or duplicated open issue');
  for(const i of items){
    if(!Number.isInteger(i.attempts_recorded_level5) || i.attempts_recorded_level5<0
       || i.attempts_recorded_level5>2
       || !Number.isInteger(i.attempts_recorded_level6)||i.attempts_recorded_level6!==0
       || !i.evidence || !i.status || !i.carry_reason)throw Error('Carryover attempt or evidence was fabricated');
  }
  const old=items.find(i=>i.id==='SEC:S5-PORTAL-CMS-ROLE');
  if(old.attempts_recorded_level5!==1 || old.status!=='CODE_CI_PASS_NOT_MERGED_NOT_DEPLOYED')throw Error('Stage 5 code status lost');
  for(const w of d.new_work){
    if(!w.id||!Number.isInteger(w.attempts_recorded_level6)
      ||w.attempts_recorded_level6<0||w.attempts_recorded_level6>2)throw Error('Stage 6 work violates attempt limit');
    if(w.status==='PRODUCTION_READY' || w.status==='HISTORICALLY_ACCEPTED')throw Error('Unproved acceptance');
  }
  return {operational_stage:6,stage7_authorized:false,carried_items:10,open_live_rls:7,
          production_modified:false,stage5_historical_complete:false,
          new_stage6_work:d.new_work.length};
}
function load(){return JSON.parse(fs.readFileSync(file,'utf8'));}
if(require.main===module)process.stdout.write(JSON.stringify(check(load()),null,2)+'\n');
module.exports={check,load};
