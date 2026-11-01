"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const page=fs.readFileSync(path.join(root,"src/app/seviye-2-akis/page.tsx"),"utf8");
const home=fs.readFileSync(path.join(root,"src/app/page.tsx"),"utf8");
const s1=fs.readFileSync(path.join(root,"src/app/seviye-1-onizleme/page.tsx"),"utf8");
const directory=fs.readFileSync(path.join(root,"src/lib/staff-module-directory.ts"),"utf8");
const detail=fs.readFileSync(path.join(root,"src/app/personel/[module]/page.tsx"),"utf8");
const demo=fs.readFileSync(path.join(root,"src/components/StaffSyntheticDemonstration.tsx"),"utf8");

test("Stage 2 admin previews 16 real module entry, preparation and result links from one source",()=>{
 const canonical=[...directory.matchAll(/slug:"([a-z]+)"/g)].map(x=>x[1]);
 assert.equal(canonical.length,16);
 assert.equal(new Set(canonical).size,16);
 assert.match(page,/import \{ STAFF_TOP_LEVEL \} from "@\/lib\/staff-module-directory"/);
 assert.match(page,/STAFF_TOP_LEVEL\.map/);
 assert.match(page,/module\.firstAction/);
 assert.match(page,/module\.output/);
 assert.ok(page.includes('href={"/personel/" + module.slug}'));
 assert.ok(home.includes('href="/seviye-2-akis"'));
 assert.ok(s1.includes('href="/seviye-2-akis"'));
 assert.match(detail,/StaffSyntheticDemonstration slug=\{item\.slug\}/);
 for(const action of ["prepare","review","reset"]){
   assert.ok(demo.includes('advance("'+action+'")'),action);
 }
});

test("Stage 2 admin has no secrets, credentials, provider submission or fabricated acceptance",()=>{
 assert.match(page,/robots: \{ index: false, follow: false \}/);
 assert.match(page,/0\/594/);
 for(const bad of ["fetch(","supabase.","createClient(","localStorage","sessionStorage",
   "<form","<input","process.env",".insert(",".update(","sendBeacon"]){
   assert.equal(page.includes(bad),false,bad);
 }
});


test("Stage 2 common horizontal scope remains closed for all seven program areas",()=>{
  const contract=JSON.parse(fs.readFileSync(path.join(root,"../docs/program/AVOFIS_LEVEL2_HORIZONTAL_FLOW_CONTRACT_2026-11-01.json"),"utf8"));
  assert.deepEqual(contract.horizontalAreas.map(area=>area.id),["A0","A1","A2","A3","A4","A5","A6"]);
  assert.equal(contract.levelTwo.scopeCounts.staffModules,16);
  assert.equal(contract.levelTwo.scopeCounts.apiModules,10);
  assert.equal(contract.levelTwo.scopeCounts.indProcedures,8);
  assert.deepEqual(contract.apiFlow.enabledOperations,[]);
  assert.equal(contract.levelTwo.status,"IN_PROGRESS_NOT_ACCEPTED");
  assert.equal(contract.controls.mainMergeAuthorized,false);
  assert.equal(contract.controls.liveDatabaseWriteAuthorized,false);
  assert.equal(contract.controls.realPaymentAllowed,false);
  assert.equal(contract.controls.officialSubmissionAllowed,false);
});
