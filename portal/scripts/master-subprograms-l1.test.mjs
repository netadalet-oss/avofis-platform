import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const load=f=>JSON.parse(readFileSync(new URL("../../ops/"+f,import.meta.url),"utf8"));
const root=load("avofis-master-skeleton-l0.json");
const l1=load("avofis-master-subprograms-l1.json");
const index=load("avofis-l1-work-index.json");
const prog=load("avofis-work-progress.json");
const sums=(arr,field)=>arr.reduce((n,a)=>n+a[field],0);
const byKey=(g)=>index.items.filter(x=>x.group===g);
test("L1: full 63 programs and 973 immutable work-ID mappings",()=>{
 assert.equal(l1.level,"L1");
 assert.equal(l1.approvalStatus,"APPROVED_BY_USER");
 assert.equal(l1.depthL2,"OPEN_TO_STRUCTURE_AWAITING_USER_APPROVAL");
 assert.equal(l1.depthL3,"LOCKED_UNTIL_EXPLICIT_L2_APPROVAL");
 assert.equal(root.approvalStatus,"APPROVED_BY_USER");
 assert.equal(index.workCount,973);
 assert.equal(index.items.length,973);
 assert.equal(new Set(index.items.map(x=>x.id)).size,973);
 assert.equal(l1.programs.length,63);
 assert.equal(new Set(l1.programs.map(p=>p.id)).size,63);
 const counts={requirements:594,staff:192,auxiliary:113,content:74};
 for(const [g,n] of Object.entries(counts))assert.equal(byKey(g).length,n,g);
 assert.equal(sums(l1.programs,"count"),973);
 assert.equal(sums(l1.programs,"independentAccepted"),0);
 assert.equal(l1.trackingTotals.accepted,0);
 assert.equal(l1.trackingTotals.partialRequirements,43);
 assert.equal(l1.trackingTotals.syntheticAuxiliary,4);
 assert.equal(prog.groups.reduce((n,x)=>n+x.accepted.length,0),0);
});
test("L1: no orphan, no duplicate, no moved or deleted item in any parent pillar",()=>{
 const programs=new Map(l1.programs.map(p=>[p.id,p]));
 for(const item of index.items){
  const p=programs.get(item.parentL1);
  assert.ok(p,"missing program for "+item.id);
  assert.equal(p.parentL0,item.parentL0,item.id);
  assert.equal(p.kind,item.group,item.id);
  assert.ok(root.pillars.some(x=>x.id===item.parentL0),item.id);
 }
 for(const p of l1.programs){
  assert.equal(index.items.filter(x=>x.parentL1===p.id).length,p.count,p.id);
  assert.equal(p.status,"L1_APPROVED_BY_USER",p.id);
  assert.equal(p.independentAccepted,0,p.id);
 }
 for(const parent of root.pillars){
  assert.equal(index.items.filter(x=>x.parentL0===parent.id).length,parent.total,parent.id);
  assert.equal(l1.programs.filter(p=>p.parentL0===parent.id).reduce((n,p)=>n+p.count,0),
   parent.total,parent.id);
 }
});
test("L1: each of 594 original section IDs, priorities and dependency waves retained",()=>{
 const rp=l1.programs.filter(p=>p.kind==="requirements");
 assert.equal(rp.length,33);
 assert.equal(sums(rp,"p0"),324);
 assert.equal(sums(rp,"p1"),270);
 for(let i=0;i<33;i++){
  const p=rp.find(p=>p.sourceSection===String(i+1).padStart(2,"0"));
  assert.ok(p,"missing section "+(i+1));
  assert.equal(p.count,18);
  assert.equal(p.p0+p.p1,18);
  assert.match(p.blockingGates,/B0|B1/);
  assert.match(p.wave,/^W[1-7]$/);
  assert.ok(p.sourceTitle.length>8);
  for(let j=0;j<18;j++){
   const id="R-"+String(i*18+j+1).padStart(3,"0");
   const item=index.items.find(x=>x.id===id);
   assert.equal(item.parentL1,p.id,id);
  }
 }
});
test("L1: staff 16x12, eight auxiliary families, six sourced content families",()=>{
 const staff=l1.programs.filter(p=>p.kind==="staff");
 assert.equal(staff.length,16);
 assert.equal(sums(staff,"count"),192);
 const suffix=["LST","NEW","UPD","DEL","STA","TASK","VER","REV","FILE","I18N","UNIT","E2E"];
 for(const p of staff){
  const mod=p.id.slice("L1-ST-".length).toUpperCase();
  for(const s of suffix)assert.ok(index.items.some(x=>x.id===mod+"-"+s&&x.parentL1===p.id),p.id+"-"+s);
 }
 const af=l1.programs.filter(p=>p.kind==="auxiliary"),cf=l1.programs.filter(p=>p.kind==="content");
 assert.equal(af.length,8);assert.equal(sums(af,"count"),113);
 assert.equal(cf.length,6);assert.equal(sums(cf,"count"),74);
 assert.deepEqual(af.map(p=>p.count).sort((a,b)=>a-b),[4,8,10,13,15,16,18,29]);
 assert.deepEqual(cf.map(p=>p.count).sort((a,b)=>a-b),[7,8,12,14,16,17]);
 const chk=cf.find(p=>p.id==="L1-CHK");
 assert.match(chk.sourceCaveat,/Do NOT invent original 8 checklist names/);
 assert.equal(index.items.filter(x=>x.id.startsWith("CHK-")).length,8);
});
