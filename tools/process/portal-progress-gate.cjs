'use strict';
const fs=require('node:fs'),path=require('node:path');
const file=path.resolve(__dirname,'../../docs/process/seviye7-portal-60-kullanici-senaryosu-ilerleme.json');
function validate(p){
 if(p.scope!=='60 explicitly defined portal-facing acceptance journeys, 12 groups x 5, including CMS that controls portal'
   ||p.stage!==7 ||p.stage8_approved!==false
   ||p.denominator_fixed!==60||p.minimum_incremental_target_pct_points!==10
   ||p.original_approved_jobs!==973||p.original_accepted_item_ids_available!==false
   ||p.original_project_completion_percent!==null
   ||p.baseline_from_original_approved_register!==null
   ||p.full_project_target_proven!==false
   ||p.next_stage_requires_separate_explicit_user_approval!==true)
   throw Error('Progress gate incorrectly claims historical completion or authorizes stage 8');
 if(!Array.isArray(p.items)||p.items.length!==60||new Set(p.items.map(x=>x.id)).size!==60)
   throw Error('The fixed 60 functional scenarios were silently changed');
 const groups=new Map();
 for(const i of p.items){
   const group=i.id.split(':')[0];groups.set(group,(groups.get(group)||0)+1);
   if(!i.area || !['UNKNOWN_OR_NOT_VERIFIED','NEW_CODE_WITH_TESTS_PENDING_LIVE_ACCEPTANCE',
    'STAGING_BROWSER_ACCEPTED','PRODUCTION_ACCEPTED'].includes(i.status))throw Error('Unknown acceptance status');
   if(i.status==='NEW_CODE_WITH_TESTS_PENDING_LIVE_ACCEPTANCE'
      && (!Array.isArray(i.source)||i.source.length<3
          ||!i.source.some(x=>x.includes('tests/'))))throw Error('Claimed functional code without test evidence');
 }
 if(groups.size!==12 || [...groups.values()].some(n=>n!==5))
   throw Error('12 groups x 5 each no longer fixed');
 const code=p.items.filter(i=>i.status==='NEW_CODE_WITH_TESTS_PENDING_LIVE_ACCEPTANCE');
 if(code.length!==p.new_source_level_journeys
    ||Math.abs(p.new_source_level_pct_points-(code.length/60*100))>0.011
    ||p.real_browser_journeys_accepted!==0
    ||p.real_browser_acceptance_pct_points!==0)
   throw Error('Code progress was exaggerated as real browser acceptance');
 // Manually tracked opportunities and private forum drafts are not equivalent
 // to live vacancy search, real application or public discussion workflows.
 for(const id of ['careers:search-real-vacancies','careers:submit-application',
                  'forum:create-topic','forum:reply-to-topic','documents:validate-citations']){
   const item=p.items.find(x=>x.id===id);
   if(!item || item.status!=='UNKNOWN_OR_NOT_VERIFIED')
     throw Error('Provisional local demo falsely counted as live platform capability');
 }
 const groupsWithNew=[...new Set(code.map(i=>i.id.split(':')[0]))].sort();
 if(groupsWithNew.join(',')!=='cases,documents,statutes,workspace'
   ||code.length!==17)throw Error('Scope coverage changed without dedicated evidence review');
 return {
   operational_level:7,next_level_approved:false,
   fixed_portal_proxy_denominator:60,new_code_test_scenarios:17,
   provisional_code_delta_pct_points:28.33,
   staging_browser_accepted:0,original_portal_completion_percent:null,
   original_project_10_percent_gain_proven:false
 };
}
const load=()=>JSON.parse(fs.readFileSync(file,'utf8'));
if(require.main===module)process.stdout.write(JSON.stringify(validate(load()),null,2)+'\n');
module.exports={validate,load};
