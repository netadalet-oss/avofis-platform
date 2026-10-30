import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
const read = (path) => JSON.parse(readFileSync(new URL(path,import.meta.url),"utf8"));
const root=read("../../ops/avofis-master-skeleton-l0.json");
const progress=read("../../ops/avofis-work-progress.json");
const sum=(xs,key)=>xs.reduce((s,x)=>s+x[key],0);
const p0=new Set([1,2,4,5,6,7,15,17,20,21,22,23,26,28,29,30,32,33]);
const canonical={B01:18,J01:16,P01:10,IND:8,G:4,IND_CASE:15,FOUNDING:29,T:13,STAFF:192,CONTENT:74};
test("L0 immutable source: 8 pillars partition 33 original 18-item sections exactly once",()=>{
 assert.equal(root.schemaVersion,1);
 assert.equal(root.pillars.length,8);
 const sections=root.pillars.flatMap(x=>x.sections);
 assert.equal(sections.length,33);
 assert.deepEqual([...sections].sort((a,b)=>a-b),Array.from({length:33},(_,i)=>i+1));
 assert.equal(sum(root.pillars,"rCount"),594);
 assert.equal(sum(root.pillars,"p0"),324);
 assert.equal(sum(root.pillars,"p1"),270);
 for(const p of root.pillars){
  assert.equal(p.rCount,p.sections.length*18,p.id);
  assert.equal(p.p0,p.sections.filter(s=>p0.has(s)).length*18,p.id);
  assert.equal(p.p1,p.rCount-p.p0,p.id);
  assert.equal(p.additionalCount,p.packages.reduce((n,k)=>n+k.count,0),p.id);
  assert.equal(p.total,p.rCount+p.additionalCount,p.id);
  assert.equal(p.ranges.length,p.sections.length,p.id);
  for(let i=0;i<p.sections.length;i++){
   const s=p.sections[i],id=number=>String(number).padStart(3,"0");
   assert.equal(p.ranges[i],`R-${id((s-1)*18+1)}..R-${id(s*18)}`,p.id);
  }
 }
});
test("L0 complete: all 973 tracked records and cross-checked 113+192+74 package families",()=>{
 assert.equal(sum(root.pillars,"additionalCount"),379);
 assert.equal(sum(root.pillars,"total"),973);
 assert.equal(root.denominator.trackedWork,973);
 assert.equal(root.denominator.sourceR,594);
 const extras=root.pillars.flatMap(p=>p.packages);
 assert.equal(extras.reduce((n,p)=>n+p.count,0),379);
 const list=new Map(extras.map(z=>[z.id,z.count]));
 assert.equal(list.size,10);
 for(const [key,count] of Object.entries({
  "KURULUS-24+5":29,"KATALOG-66+CHK-8":74,
  "IND-01..08":8,"G1..G4":4,"IND-SENARYO-15":15,
  "B01..B18":18,"PERSONEL-16x12":192,"P01..P10":10,
  "J01..J16":16,"T01..T13":13
 }))assert.equal(list.get(key),count,key);
 assert.deepEqual(progress.groups.map(g=>g.total),[594,192,113,74]);
 assert.equal(progress.groups.reduce((n,g)=>n+g.accepted.length,0),0);
 assert.equal(progress.groups[0].partial.length,69);
 assert.equal(progress.groups[2].syntheticTechnical.length,4);
 assert.equal(root.evidence.independentAccepted,0);
 assert.equal(root.evidence.syntheticExtraPackages,4);
});
test("L0 cannot silently approve itself or expand depth levels",()=>{
 assert.equal(root.currentExpansionLevel,"L2");
 assert.equal(root.approvalStatus,"APPROVED_BY_USER");
 assert.deepEqual(root.hierarchy.map(x=>x.level),["L0","L1","L2","L3","L4","L5"]);
 assert.equal(root.hierarchy[0].stage,"APPROVED");
 assert.equal(root.hierarchy[1].stage,"APPROVED");
 assert.equal(root.hierarchy[2].stage,"CURRENT_AWAITING_USER_APPROVAL");
 for(const x of root.hierarchy.slice(3))assert.equal(x.stage,"REQUIRES_APPROVAL");
 assert.match(root.approvalRules.required,/L0 and L1 explicitly approved by user on 2026-10-30/);
 assert.equal(root.evidence.production,"NO_GO");
 assert.equal(root.evidence.stagingE2E,"NOT_VERIFIED");
 assert.equal(progress.productionStatus,"NO_GO");
});
