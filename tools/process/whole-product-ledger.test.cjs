"use strict";
const test=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const model=require("./whole-product-levels.cjs");
const file=path.resolve(__dirname,"../../docs/program/SEVIYE1_YATAY_DEVIR_RISK_DENEME_DEFTERI_2026-11-01.json");
function ledger(){return JSON.parse(fs.readFileSync(file,"utf8"))}
const validStates=new Set(["OPEN_EXTERNAL","REGRESSION_FIXED_IN_CODE","REGRESSION_UNRESOLVED"]);

test("the whole-product ledger cannot pass as Stage 2 or independent product acceptance",()=>{
 const d=ledger();
 assert.equal(d.product,"AVOfis");
 assert.equal(d.activeStage,1);
 assert.equal(d.stageStatus,"IN_PROGRESS");
 assert.equal(d.independentAcceptedR,0);
 assert.equal(d.liveAcceptedR,0);
 assert.equal(d.policy.nextStageRetryMinimumPerCarriedItem,2);
 assert.equal(d.policy.independentEvidenceRequiredForEveryAttempt,true);
 assert.equal(d.policy.failedTasksCannotBlockUnrelatedModuleDevelopment,true);
 assert.equal(d.policy.releaseActionsStillRequireSeparateAuthorization,true);
 assert.equal(d.policy.stageBreadthIsNotIndependentOrLiveAcceptance,true);
});

test("all known outstanding items are unique, attributable and do not fabricate attempts",()=>{
 const d=ledger();
 assert.ok(d.items.length>=11);
 assert.equal(new Set(d.items.map(x=>x.id)).size,d.items.length);
 for(const item of d.items){
  assert.match(item.id,/^[A-Z0-9_]+$/);
  assert.ok(validStates.has(item.status),item.id);
  assert.ok(item.detail.length>=30,item.id);
  assert.ok(Array.isArray(item.areas)&&item.areas.length>0,item.id);
  assert.ok(item.areas.every(area=>/^A[0-6]$/.test(area)),item.id);
  assert.ok(Array.isArray(item.evidence)&&item.evidence.length>0,item.id);
  assert.ok(Array.isArray(item.level1Attempts),item.id);
  const runs=new Set();
  for(const entry of item.level1Attempts){
   assert.match(entry.run,/^[0-9]{8,13}$/);
   assert.ok(["SUCCESS","FAILED","BLOCKED_EXTERNAL"].includes(entry.result));
   assert.ok(!runs.has(entry.run),"duplicate attempt: "+item.id);
   runs.add(entry.run);
   assert.ok(item.evidence.some(s=>s.includes(entry.run)),
    "attempt without referenced source: "+item.id+"/"+entry.run);
  }
  if(item.status==="REGRESSION_FIXED_IN_CODE"){
   assert.ok(item.level1Attempts.some(x=>x.result==="FAILED"),"fixed regression lacks failure: "+item.id);
   assert.ok(item.level1Attempts.some(x=>x.result==="SUCCESS"),"fixed regression lacks pass: "+item.id);
  }
  if(item.status==="OPEN_EXTERNAL"){
   assert.equal(item.level1Attempts.length,0,"external blocker must not be marked attempted: "+item.id);
  }
 }
});

test("every prior item is carried into each later whole-product level with two NEW slots",()=>{
 const d=ledger();
 const ids=d.items.map(x=>x.id);
 for(let level=2;level<=12;level++){
  const plan=model.stagePlan(level,ids);
  assert.deepEqual(plan.carryover.map(x=>x.taskId),ids);
  for(const item of plan.carryover){
   assert.equal(item.requiredNewAttempts,2);
   assert.equal(item.recordedNewAttempts,0);
   assert.equal(item.canPreventStageAdvance,false);
   assert.equal(item.status,"PENDING_CARRYOVER");
  }
  assert.equal(plan.releasePermissionsGranted,false);
  assert.equal(plan.independentRSignoff,0);
  assert.equal(plan.liveRAcceptance,0);
 }
});

test("historical Seviye 1 evidence is never silently counted as two new retries",()=>{
 const d=ledger();
 for(const item of d.items){
  const stage2=model.carryoverRetryState(item.id,2,[]);
  assert.equal(stage2.attempts,0);
  assert.equal(stage2.remaining,2);
  assert.equal(stage2.issueResolved,false);
 }
});
