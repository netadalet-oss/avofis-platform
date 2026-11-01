"use strict";
/**
 * AVOfis independent 12-stage execution model (breadth-first).
 * An entire product area can be addressed at any depth without asserting
 * independent R acceptance or activating production. This is a work planner,
 * not an authorization system for DB/merges/deployment/legal action.
 */
const AV_AREAS = Object.freeze([
  { id:"A0", first:1, last:10 },
  { id:"A1", first:11, last:25 },
  { id:"A2", first:26, last:51 },
  { id:"A3", first:52, last:61 },
  { id:"A4", first:62, last:77 },
  { id:"A5", first:78, last:92 },
  { id:"A6", first:93, last:101 }
]);
const STAFF_MODULES = Object.freeze([
  "inbox","triage","matters","calendar","documents","pleadings",
  "research","judicial","ind","messages","billing","payables",
  "reporting","audit","people","settings"
]);
const DEPTHS = Object.freeze([
  "Ana ekran, temel işlev ve güvenli yayın/ret sınırı",
  "Kaynak-sözleşme, temel alan ve durum makinesi",
  "Ana işlemlerin pozitif sentetik davranışı",
  "Yetki, geçersiz girdi ve olumsuz akışlar",
  "Ana iş akışının detaylı modül işlevleri",
  "Gerçek izole staging entegrasyonu ve veri sahipliği",
  "Modüller arası senaryo, olay ve durum tutarlılığı",
  "Altı dil ve erişilebilirliğin ayrıntılı kapsamı",
  "Dayanıklılık, güvenlik ve hata/geri alma denemeleri",
  "Kurum/finans/hukuk insan onayı ve adaptör sınırları",
  "Uçtan uca çok cihazlı gerçek ortam kabul denemeleri",
  "Her alt koşulun son bağımsız kabulü ve yetkili yayın kararı"
]);
function id(prefix,n) { return prefix+"-"+String(n).padStart(3,"0"); }
const AV_IDS = Object.freeze(AV_AREAS.flatMap(area=>Array.from(
  {length:area.last-area.first+1},(_,i)=>id("AV",area.first+i)
)));
const R_IDS = Object.freeze(Array.from({length:594},(_,i)=>id("R",i+1)));
const OTHER_SCOPES = Object.freeze({
  services:17,audiences:14,journeys:12,staffModules:STAFF_MODULES.length,
  indProcedures:8,justiceTasks:16,staffProtocols:10,
  blockers:18,milestones:13,languages:6
});

function stagePlan(level, previouslyFailedIds=[]) {
  if(!Number.isInteger(level)||level<1||level>12) throw Error("UNSUPPORTED_STAGE");
  if(!Array.isArray(previouslyFailedIds)) throw TypeError("expected failure IDs");
  const ids=[...new Set(previouslyFailedIds)];
  if(ids.some(x=>typeof x!=="string"||!x.trim())) throw TypeError("invalid carryover ID");
  return {
    level, depth:DEPTHS[level-1],
    avIds:[...AV_IDS],rIds:[...R_IDS],areas:AV_AREAS.map(x=>x.id),
    otherScope:{...OTHER_SCOPES},
    carryover:level===1?[]:ids.map(taskId=>({
      taskId, requiredNewAttempts:2, recordedNewAttempts:0,
      status:"PENDING_CARRYOVER",canPreventStageAdvance:false
    })),
    releasePermissionsGranted:false,
    independentRSignoff:0,
    liveRAcceptance:0
  };
}

function checkBreadth({avIds, rIds, staffModules, indProcedures}) {
  const foundAV=new Set(avIds||[]), foundR=new Set(rIds||[]);
  const foundStaff=new Set(staffModules||[]);
  const foundIND=new Set(indProcedures||[]);
  return {
    allAv:AV_IDS.every(id=>foundAV.has(id)),
    allR:R_IDS.every(id=>foundR.has(id)),
    allStaff:STAFF_MODULES.every(id=>foundStaff.has(id)),
    allInd:Array.from({length:8},(_,i)=>"IND-"+String(i+1).padStart(2,"0"))
      .every(id=>foundIND.has(id))
  };
}

/**
 * Record only actual, independently distinguishable attempts. A failed
 * historical task remains in future stages, but cannot block processing of
 * other modules. Never turn an unperformed retry into a recorded result.
 */
function recordCarryoverAttempt(register, taskId, evidence) {
  if(!Array.isArray(register)) throw TypeError("expected register");
  if(!evidence || !Number.isInteger(evidence.level) || evidence.level<2 ||
    evidence.level>12 || !evidence.runOrCommit ||
    !["SUCCESS","FAILED","BLOCKED_EXTERNAL"].includes(evidence.result)) {
    throw Error("MISSING_VERIFIABLE_ATTEMPT");
  }
  const existing=register.filter(row=>row.taskId===taskId&&row.level===evidence.level);
  if(existing.some(row=>row.runOrCommit===evidence.runOrCommit)) {
    throw Error("DUPLICATE_EVIDENCE");
  }
  return [...register,{taskId,level:evidence.level,
    runOrCommit:evidence.runOrCommit,result:evidence.result}];
}
function carryoverRetryState(taskId,level,register) {
  if(!Number.isInteger(level)||level<2||level>12) throw Error("UNSUPPORTED_STAGE");
  const attempts=register.filter(x=>x.taskId===taskId&&x.level===level);
  return {
    taskId,level,attempts:attempts.length,minimum:2,
    remaining:Math.max(0,2-attempts.length),
    issueResolved:attempts.some(x=>x.result==="SUCCESS")
  };
}
module.exports={
  AV_AREAS,STAFF_MODULES,DEPTHS,AV_IDS,R_IDS,OTHER_SCOPES,
  stagePlan,checkBreadth,recordCarryoverAttempt,carryoverRetryState
};
