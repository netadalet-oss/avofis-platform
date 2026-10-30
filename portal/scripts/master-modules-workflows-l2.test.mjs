import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read=(name)=>JSON.parse(readFileSync(new URL("../../ops/"+name,import.meta.url),"utf8"));
const root=read("avofis-master-skeleton-l0.json");
const l1=read("avofis-master-subprograms-l1.json");
const l1index=read("avofis-l1-work-index.json");
const l2=read("avofis-master-modules-workflows-l2.json");
const l2index=read("avofis-l2-workflow-index.json");
const ledger=read("avofis-work-progress.json");
const types={requirements:594,staff:192,auxiliary:113,content:74};
const modmap=new Map(l2.modules.map(m=>[m.id,m]));
const flowmap=new Map(l2.programWorkflows.map(f=>[f.id,f]));
const byL1=new Map(l1.programs.map(p=>[p.id,p]));
test("L2: explicit L1 approval opens L2 only; L3 stays locked",()=>{
 assert.equal(root.approvalStatus,"APPROVED_BY_USER");
 assert.equal(l1.approvalStatus,"APPROVED_BY_USER");
 assert.equal(l1.depthL3,"LOCKED_UNTIL_EXPLICIT_L2_APPROVAL");
 assert.equal(l2.proposalStatus,"APPROVED_BY_USER");
 assert.equal(l2.approvals.L2,"USER_APPROVED_2026-10-30");
 assert.equal(l2.approvals.L3,"OPEN_FOR_DESIGN_AWAITING_USER_APPROVAL");
 assert.equal(l2index.l1UserApproved,true);
 assert.equal(l2index.l2UserApproved,true);
 assert.equal(l2index.l3Locked,false);
 assert.equal(l2index.l4Locked,true);
 assert.equal(ledger.productionStatus,"NO_GO");
 assert.equal(ledger.groups.reduce((s,g)=>s+g.accepted.length,0),0);
});
test("L2: 63 true L1-linked modules, 142 flows and 12 cross-module journeys",()=>{
 assert.equal(l2.modules.length,63);
 assert.equal(new Set(l2.modules.map(m=>m.id)).size,63);
 assert.equal(l2.programWorkflows.length,142);
 assert.equal(new Set(l2.programWorkflows.map(f=>f.id)).size,142);
 assert.equal(l2.crossModuleJourneys.length,12);
 assert.equal(new Set(l2.crossModuleJourneys.map(j=>j.id)).size,12);
 assert.equal(l2.modules.reduce((n,m)=>n+m.scopeCount,0),973);
 for(const m of l2.modules){
  const p=byL1.get(m.parentL1);
  assert.ok(p,"orphan module "+m.id);
  assert.equal(p.parentL0,m.parentL0);
  assert.equal(p.count,m.scopeCount);
  assert.equal(p.kind,m.sourceKind);
  assert.equal(m.humanAcceptance,0);
  assert.equal(m.detailedUIApiSql,"LOCKED_TO_L3");
  assert.equal(m.status,"L2_SKELETON_AWAITING_USER_APPROVAL");
  assert.equal(l2.programWorkflows.filter(f=>f.moduleId===m.id).length,
   m.sourceKind==="staff"?3:2,"flow count "+m.id);
  for(const dst of m.downstreamModules)assert.ok(modmap.has(dst),m.id+" -> "+dst);
 }
 for(const f of l2.programWorkflows){
  assert.ok(modmap.has(f.moduleId));
  assert.equal(f.status,"L2_DRAFT");
  assert.equal(f.notOfficialFiling,true);
  assert.ok(f.steps.length>=3);
  assert.ok(f.actor);
  assert.ok(f.gate);
 }
 for(const j of l2.crossModuleJourneys){
  assert.ok(j.modulePath.length>=4);
  for(const m of j.modulePath)assert.ok(modmap.has(m),j.id+" -> "+m);
  assert.equal(j.actualExternalSubmission,false);
 }
});
test("L2: all and only 973 original IDs assigned exactly once to module and two verified flow references",()=>{
 const items=l2index.items;
 assert.equal(items.length,973);
 assert.equal(l2index.workCount,973);
 assert.equal(new Set(items.map(x=>x.id)).size,973);
 assert.deepEqual(Object.fromEntries(Object.keys(types).map(k=>[k,items.filter(x=>x.sourceKind===k).length])),types);
 const old=new Map(l1index.items.map(x=>[x.id,x]));
 assert.equal(old.size,973);
 for(const item of items){
  const previous=old.get(item.id);
  assert.ok(previous,"L2 invented or moved ID "+item.id);
  assert.equal(item.sourceKind,previous.group,item.id);
  assert.equal(item.l0,previous.parentL0,item.id);
  assert.equal(item.l1,previous.parentL1,item.id);
  const module=modmap.get(item.l2Module);
  assert.ok(module,"unknown module "+item.id);
  assert.equal(module.parentL1,item.l1,item.id);
  const main=flowmap.get(item.primaryWorkflow),approval=flowmap.get(item.compulsoryAcceptanceWorkflow);
  assert.ok(main,"missing primary flow "+item.id);
  assert.ok(approval,"missing acceptance flow "+item.id);
  assert.equal(main.moduleId,module.id);
  assert.equal(approval.moduleId,module.id);
  assert.equal(approval.kind,"ACCEPTANCE");
  assert.equal(item.sourceRequirementUnchanged,true);
  assert.equal(item.evidenceStatus,"NOT_INDEPENDENTLY_ACCEPTED");
  assert.equal(item.l3Detail,"LOCKED");
 }
 for(const p of l1.programs){
  assert.equal(items.filter(x=>x.l1===p.id).length,p.count,"task loss "+p.id);
 }
 for(const p of root.pillars){
  assert.equal(items.filter(x=>x.l0===p.id).length,p.total,"pillar loss "+p.id);
 }
});
test("L2: staff work checks mapped according to operation, authorization and QA (no fake approval)",()=>{
 for(const x of l2index.items.filter(x=>x.sourceKind==="staff")){
  const suffix=x.id.split("-").at(-1);
  const kind=flowmap.get(x.primaryWorkflow).kind;
  assert.equal(kind,["VER","REV"].includes(suffix)?"AUTHORIZATION":
    ["FILE","I18N","UNIT","E2E"].includes(suffix)?"ACCEPTANCE":"CORE",
    x.id);
 }
 assert.equal(l2.modules.filter(m=>m.sourceKind==="requirements").length,33);
 assert.equal(l2.modules.filter(m=>m.sourceKind==="staff").length,16);
 assert.equal(l2.modules.filter(m=>m.sourceKind==="auxiliary").length,8);
 assert.equal(l2.modules.filter(m=>m.sourceKind==="content").length,6);
 assert.match(l2.modules.find(m=>m.parentL1==="L1-CHK").sourceCaveat,/Do NOT invent/);
 assert.equal(l2.scope.independentAccepted,0);
 assert.equal(l2.scope.partialR,46);
 assert.equal(l2.scope.syntheticAuxiliary,4);
});
