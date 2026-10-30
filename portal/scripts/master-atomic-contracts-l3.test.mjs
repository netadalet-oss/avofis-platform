import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=(p)=>JSON.parse(readFileSync(new URL("../../ops/"+p,import.meta.url),"utf8"));
const l0=load("avofis-master-skeleton-l0.json");
const l1=load("avofis-master-subprograms-l1.json");
const l2=load("avofis-master-modules-workflows-l2.json");
const l2idx=load("avofis-l2-workflow-index.json");
const l3=load("avofis-l3-module-contracts.json");
const flow=load("avofis-l3-flow-contracts.json");
const issues=load("avofis-l3-open-decisions.json");
const ledger=load("avofis-work-progress.json");
const shards=Array.from({length:8},(_,i)=>load("l3/avofis-l3-atomic-L0-"+String(i+1).padStart(2,"0")+".json"));
const all=shards.flatMap(s=>s.items);
test("L3: user approved L0–L3; L4 authorized, L5 locked",()=>{
 assert.equal(l0.approvalStatus,"APPROVED_BY_USER");
 assert.equal(l1.approvalStatus,"APPROVED_BY_USER");
 assert.equal(l2.proposalStatus,"APPROVED_BY_USER");
 assert.equal(l2.approvals.L3,"OPEN_FOR_DESIGN_AWAITING_USER_APPROVAL");
 assert.equal(l2.approvals.L4,"LOCKED_UNTIL_EXPLICIT_L3_APPROVAL");
 assert.equal(l2idx.l2UserApproved,true);
 assert.equal(l2idx.l4Locked,true);
 assert.equal(l3.approvalStatus,"APPROVED_BY_USER");
 assert.equal(flow.approvalStatus,"APPROVED_BY_USER");
 assert.equal(l3.nextLevelL4,"OPEN_FOR_IMPLEMENTATION_AWAITING_INDEPENDENT_ACCEPTANCE");
 assert.equal(l3.nextLevelL5,"LOCKED_UNTIL_EXPLICIT_L4_APPROVAL");
 assert.equal(ledger.productionStatus,"NO_GO");
 assert.equal(ledger.groups.reduce((s,g)=>s+g.accepted.length,0),0);
});
test("L3: exactly 63 module contracts, 154 workflow contracts and original 973 mapped ID records",()=>{
 assert.equal(l3.modules.length,63);
 assert.equal(l3.modules.reduce((s,m)=>s+m.trackedWork,0),973);
 assert.equal(flow.flows.length,154);
 assert.equal(flow.inModule,142);
 assert.equal(flow.crossModule,12);
 assert.equal(all.length,973);
 assert.equal(new Set(all.map(x=>x.id)).size,973);
 assert.equal(new Set(l3.modules.map(x=>x.id)).size,63);
 assert.equal(new Set(flow.flows.map(x=>x.id)).size,154);
 assert.equal(l3.totals.independentAccepted,0);
});
test("L3: eight exact L0 distributions and all four original source categories",()=>{
 const original={requirements:594,staff:192,auxiliary:113,content:74};
 const distributions=[83,218,189,90,54,72,220,47];
 assert.deepEqual(shards.map(s=>s.workCount),distributions);
 assert.deepEqual(Object.fromEntries(Object.keys(original).map(k=>[k,all.filter(x=>x.sourceKind===k).length])),original);
 for(let i=0;i<shards.length;i++){
  assert.equal(shards[i].parentL0,"L0-"+String(i+1).padStart(2,"0"));
  assert.equal(shards[i].items.length,shards[i].workCount);
 }
});
test("L3: immutable trace from L2 primary and acceptance flows; no fake physical APIs",()=>{
 const old=new Map(l2idx.items.map(x=>[x.id,x]));
 const mods=new Map(l3.modules.map(m=>[m.id,m]));
 const flows=new Set(flow.flows.map(f=>f.id));
 assert.equal(old.size,973);
 for(const x of all){
  const prev=old.get(x.id);
  assert.ok(prev,"not in source L2: "+x.id);
  assert.equal(x.parentL0,prev.l0,x.id);
  assert.equal(x.parentL1,prev.l1,x.id);
  assert.equal(x.moduleId,prev.l2Module.replace(/^L2-M-/,"L3-M-"),x.id);
  assert.equal(x.primaryWorkflow,prev.primaryWorkflow,x.id);
  assert.equal(x.mandatoryAcceptanceWorkflow,prev.compulsoryAcceptanceWorkflow,x.id);
  assert.ok(mods.has(x.moduleId));
  assert.ok(flows.has("L3-"+x.primaryWorkflow));
  assert.ok(flows.has("L3-"+x.mandatoryAcceptanceWorkflow));
  assert.equal(x.physicalEndpoint,"NOT_CREATED_L3_LOGICAL_ONLY");
  assert.equal(x.physicalSQLTable,"NOT_CREATED_L3_LOGICAL_ONLY");
  assert.equal(x.l4,"LOCKED");
  assert.equal(x.accepted,false);
 }
 // The pre-approval L3 atomic shards are immutable source snapshots; only the
 // separately signed L3 approval unlocks L4 without implying implementation.
 for(const m of l3.modules)assert.equal(m.l4Implementation,"AUTHORIZED_NOT_IMPLEMENTED");
 for(const f of flow.flows){
   assert.equal(f.l4,"LOCKED");
   assert.equal(f.actualExternalSubmission,false);
 }
});
test("L3: R-398 DOCX conflict, checklist source gap and production gates persist as OPEN",()=>{
 assert.equal(issues.total,18);
 assert.equal(issues.items.length,18);
 assert.equal(issues.items[0].id,"L3-DEC-01");
 assert.match(issues.items[0].sourceBackedGap,/DOCX/);
 assert.match(issues.items[0].sourceBackedGap,/PDF\/PNG\/JPEG\/WebP/);
 assert.ok(issues.items.some(i=>i.scope.includes("CHK-01")));
 assert.ok(issues.items.some(i=>i.sourceBackedGap.includes("Seven live public tables")));
 assert.ok(issues.items.every(i=>i.state==="OPEN" && i.liveChanged===false && i.l4==="LOCKED"));
 assert.equal(all.filter(x=>x.id.startsWith("CHK-")).length,8);
 assert.equal(ledger.groups[0].partial.length,46);
 assert.equal(ledger.groups[2].syntheticTechnical.length,4);
});
