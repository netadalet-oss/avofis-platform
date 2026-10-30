import {readFileSync,existsSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {resolve,sep} from "node:path";
import assert from "node:assert/strict";
const repoRoot=fileURLToPath(new URL("../../",import.meta.url));
const source=name=>JSON.parse(readFileSync(new URL("../../ops/"+name,import.meta.url),"utf8"));

export function inspectL4Evidence({plan,l3,l2index,decisions,ledger,atomic,root=repoRoot}){
 assert.equal(plan.schemaVersion,1);
 assert.equal(plan.level,"L4");
 assert.equal(l3.approvalStatus,"APPROVED_BY_USER");
 assert.equal(plan.approvals.L3,true);
 assert.equal(plan.approvals.L4,"WORK_AUTHORIZED_NOT_APPROVED");
 assert.equal(plan.approvals.L5,"LOCKED");
 assert.equal(l3.nextLevelL5,"LOCKED_UNTIL_EXPLICIT_L4_APPROVAL");
 assert.equal(plan.constraints.noL5,true);
 assert.equal(plan.constraints.productionNoGo,true);
 assert.equal(plan.constraints.allL3DecisionsStayOpen,true);
 assert.equal(ledger.productionStatus,"NO_GO");
 assert.equal(ledger.e2eStagingVerified,false);
 assert.equal(ledger.groups.reduce((n,g)=>n+g.accepted.length,0),0);
 assert.equal(plan.denominator.tracked,973);
 const ids=atomic.map(x=>x.id),sourceIds=new Set(ids);
 assert.equal(ids.length,sourceIds.size,"duplicate canonical source IDs");
 assert.equal(ids.length,973,"wrong canonical source denominator");
 const previous=new Map(l2index.items.map(x=>[x.id,x]));
 assert.equal(previous.size,973);
 for(const item of atomic){
   const prior=previous.get(item.id);
   assert.ok(prior,"noncanonical L3 ID: "+item.id);
   assert.equal(item.parentL0,prior.l0,item.id);
   assert.equal(item.parentL1,prior.l1,item.id);
   assert.equal(item.accepted,false,item.id);
 }
 assert.equal(decisions.items.length,18);
 assert.equal(decisions.total,18);
 assert.equal(plan.openDecisions.length,18);
 assert.equal(new Set(plan.openDecisions).size,18);
 const decisionIds=new Set(decisions.items.map(x=>x.id));
 for(const id of plan.openDecisions)assert.ok(decisionIds.has(id),"missing decision "+id);
 for(const x of decisions.items){
   assert.equal(x.state,"OPEN",x.id);
   assert.equal(x.liveChanged,false,x.id);
 }
 assert.ok(Array.isArray(plan.implementationEvidence));
 const seen=new Set();
 for(const claim of plan.implementationEvidence){
   assert.ok(sourceIds.has(claim.id),"fabricated implementation ID "+claim.id);
   assert.ok(!seen.has(claim.id),"duplicate implementation claim "+claim.id);
   seen.add(claim.id);
   assert.ok(["CODE_CHANGED_PENDING_CI","CI_SYNTHETIC_VERIFIED"].includes(claim.status));
   assert.equal(claim.independentAcceptance,false,"no code/CI as independent acceptance");
   assert.equal(claim.realAuthStorageE2E,false);
   assert.equal(claim.legalReview,false);
   assert.ok(typeof claim.claim==="string"&&claim.claim.length>=40);
   for(const key of ["codePaths","testPaths"]){
     assert.ok(Array.isArray(claim[key])&&claim[key].length>0);
     for(const rel of claim[key]){
       assert.match(rel,/^portal\/(src|scripts)\/[\w./-]+$/,"unapproved code path "+rel);
       assert.ok(!rel.split("/").includes(".."),"path traversal "+rel);
       const absolute=resolve(root,rel);
       assert.ok(absolute.startsWith(resolve(root)+sep),"outside repository");
       assert.ok(existsSync(absolute),"missing actual source/test file "+rel);
     }
   }
   if(claim.status==="CI_SYNTHETIC_VERIFIED")
     assert.ok(/^https:\/\/github\.com\/netadalet-oss\/avofis-platform\/actions\/runs\/\d+$/.test(claim.ciRun??""),
       "CI verification requires a real actions/runs link");
   else assert.equal(claim.ciRun,null);
 }
 assert.equal(plan.unprovenImplementationCount,973-seen.size);
 return {tracked:973,codeChanged:seen.size,unproven:973-seen.size,
         accepted:0,openDecisions:18,l5Locked:true,
         ciSynthetic:plan.implementationEvidence.filter(x=>x.status==="CI_SYNTHETIC_VERIFIED").length};
}
export function readL4Sources(){
 return {
  plan:source("avofis-l4-implementation-evidence.json"),
  l3:source("avofis-l3-module-contracts.json"),
  l2index:source("avofis-l2-workflow-index.json"),
  decisions:source("avofis-l3-open-decisions.json"),
  ledger:source("avofis-work-progress.json"),
  atomic:Array.from({length:8},(_,i)=>source("l3/avofis-l3-atomic-L0-"+String(i+1).padStart(2,"0")+".json")).flatMap(x=>x.items)
 };
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===resolve(process.argv[1])){
 const r=inspectL4Evidence(readL4Sources());
 for(const [key,value] of Object.entries(r))console.log("AVOFIS_L4_"+key.toUpperCase()+"="+value);
}
