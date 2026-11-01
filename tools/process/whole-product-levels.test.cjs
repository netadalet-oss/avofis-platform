"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const m = require("./whole-product-levels.cjs");

test("all twelve stages cover exactly all 101 AV tasks and 594 R requirements", () => {
  for (let level=1; level<=12; level++) {
    const plan=m.stagePlan(level,["RLS:public.offices","STAGING_ABSENT"]);
    assert.equal(plan.level,level);
    assert.equal(plan.depth,m.DEPTHS[level-1]);
    assert.deepEqual(plan.avIds,m.AV_IDS);
    assert.deepEqual(plan.rIds,m.R_IDS);
    assert.equal(new Set(plan.avIds).size,101);
    assert.equal(new Set(plan.rIds).size,594);
    assert.deepEqual(plan.areas,["A0","A1","A2","A3","A4","A5","A6"]);
    assert.deepEqual(plan.otherScope,{
      services:17,audiences:14,journeys:12,staffModules:16,
      indProcedures:8,justiceTasks:16,staffProtocols:10,
      blockers:18,milestones:13,languages:6
    });
    assert.equal(plan.releasePermissionsGranted,false);
    assert.equal(plan.independentRSignoff,0);
    assert.equal(plan.liveRAcceptance,0);
    assert.equal(plan.carryover.length,level===1?0:2);
    for(const item of plan.carryover) {
      assert.equal(item.requiredNewAttempts,2);
      assert.equal(item.recordedNewAttempts,0);
      assert.equal(item.canPreventStageAdvance,false);
    }
  }
});

test("breadth detects omitted staff/IND and a single missing AV or R",()=>{
  const complete={
    avIds:m.AV_IDS,rIds:m.R_IDS,staffModules:m.STAFF_MODULES,
    indProcedures:Array.from({length:8},(_,i)=>"IND-"+String(i+1).padStart(2,"0"))
  };
  assert.deepEqual(m.checkBreadth(complete),{
    allAv:true,allR:true,allStaff:true,allInd:true
  });
  const incomplete=m.checkBreadth({
    ...complete,
    avIds:m.AV_IDS.slice(1),
    rIds:m.R_IDS.slice(0,-1),
    staffModules:m.STAFF_MODULES.filter(s=>s!=="audit"),
    indProcedures:["IND-01"]
  });
  assert.deepEqual(incomplete,{
    allAv:false,allR:false,allStaff:false,allInd:false
  });
});

test("failed item recurs in each following stage with two retry slots",()=>{
  const issue="RLS:public.offices";
  for (let level=2;level<=12;level++){
    const items=m.stagePlan(level,[issue,issue,"AUTH_STAGING_ABSENT"]).carryover;
    assert.equal(items.length,2,"duplicate carryovers coalesce");
    assert.equal(items[0].taskId,issue);
    assert.equal(items[0].requiredNewAttempts,2);
    assert.equal(items[0].canPreventStageAdvance,false);
  }
});

test("retry attempts need distinct concrete evidence, never inferred attempts",()=>{
  const taskId="RLS:public.offices";
  assert.deepEqual(m.carryoverRetryState(taskId,2,[]),{
    taskId,level:2,attempts:0,minimum:2,remaining:2,issueResolved:false
  });
  const one=m.recordCarryoverAttempt([],taskId,{
    level:2,runOrCommit:"ci-real-123",result:"FAILED"
  });
  assert.deepEqual(m.carryoverRetryState(taskId,2,one),{
    taskId,level:2,attempts:1,minimum:2,remaining:1,issueResolved:false
  });
  const two=m.recordCarryoverAttempt(one,taskId,{
    level:2,runOrCommit:"ci-real-124",result:"SUCCESS"
  });
  assert.deepEqual(m.carryoverRetryState(taskId,2,two),{
    taskId,level:2,attempts:2,minimum:2,remaining:0,issueResolved:true
  });
  assert.deepEqual(m.carryoverRetryState(taskId,3,two),{
    taskId,level:3,attempts:0,minimum:2,remaining:2,issueResolved:false
  });
  assert.throws(()=>m.recordCarryoverAttempt(two,taskId,{
    level:2,runOrCommit:"ci-real-124",result:"SUCCESS"
  }),/DUPLICATE_EVIDENCE/);
  assert.throws(()=>m.recordCarryoverAttempt(two,taskId,{
    level:2,runOrCommit:"",result:"FAILED"
  }),/MISSING_VERIFIABLE_ATTEMPT/);
  assert.throws(()=>m.stagePlan(13),/UNSUPPORTED_STAGE/);
  assert.throws(()=>m.stagePlan(0),/UNSUPPORTED_STAGE/);
});
