import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";

export const GROUP_TOTALS=Object.freeze({requirements:594,staff:192,auxiliary:113,content:74});
export const EXPECTED_WORK_COUNT=973;
const ranges=(prefix,n,fmt=(i)=>String(i).padStart(2,"0"))=>
 Array.from({length:n},(_,k)=>prefix+fmt(k+1));
const acceptedIds={
 requirements:new Set(ranges("R-",594,i=>String(i).padStart(3,"0"))),
 staff:new Set(["inbox","triage","matters","calendar","documents","pleadings","research",
  "judicial","ind","messages","billing","payables","reporting","audit","people","settings"]
  .flatMap(mod=>["LST","NEW","UPD","DEL","STA","TASK","VER","REV","FILE","I18N","UNIT","E2E"]
   .map(check=>mod.toUpperCase()+"-"+check))),
 auxiliary:new Set([...ranges("B",18),...ranges("J",16),...ranges("P",10),
  ...ranges("IND-",8),...ranges("IND-G",4,i=>String(i)),
  ...ranges("IND-T",15),...ranges("G-",29),...ranges("T",13)]),
 content:null // all content records require explicit source archive ID check before promotion
};
if(Object.values(acceptedIds).some(x=>x&&x.size!==GROUP_TOTALS[
 Object.keys(acceptedIds).find(k=>acceptedIds[k]===x)]))throw Error("Internal work-ID catalogue mismatch");
const unique=(xs)=>new Set(xs).size===xs.length;
function assert(condition,reason){if(!condition)throw Error("PROGRESS_LEDGER_INVALID: "+reason);}
function checkAccepted(group,record){
 assert(record&&typeof record==="object"&&!Array.isArray(record),"acceptance must be a reviewed record");
 const {id,owner,reviewer,sourceUrl,testUrl,humanApprovalUrl,verifiedAt}=record;
 assert(typeof id==="string"&&acceptedIds[group]?.has(id),"unknown accepted ID "+id);
 assert([owner,reviewer,verifiedAt].every(s=>typeof s==="string"&&s.trim().length>4),
  "missing responsible person, reviewer or acceptance date");
 assert(owner!==reviewer,"approval must not be self-signed");
 assert([sourceUrl,testUrl,humanApprovalUrl].every(s=>
  typeof s==="string"&&s.startsWith("https://")&&s.length>20),
  "independent primary evidence/test/human approval required");
 // These are metadata checks, NOT cryptographic validation of the signatures.
 // Human audit must separately verify the authenticity of each linked record.
}
export function calculateProgress(ledger){
 assert(ledger?.schemaVersion===1,"unsupported ledger schema");
 assert(Array.isArray(ledger.groups)&&ledger.groups.length===4,"expected exactly four scoped groups");
 assert(ledger.groups.every(g=>g&&GROUP_TOTALS[g.key]===g.total),"denominator/ID group drift");
 assert(unique(ledger.groups.map(g=>g.key)),"duplicate group");
 let accepted=0,partial=0,synthetic=0;
 const breakdown=[];
 for(const g of ledger.groups){
  assert(Array.isArray(g.accepted)&&Array.isArray(g.partial),"status arrays missing");
  assert(unique(g.partial)&&unique(g.accepted.map(x=>x.id)),"duplicate status ID");
  for(const id of g.partial)assert(acceptedIds[g.key]?.has(id),"unknown partial ID "+id);
  for(const record of g.accepted)checkAccepted(g.key,record);
  const acceptedSet=new Set(g.accepted.map(x=>x.id));
  assert(g.partial.every(id=>!acceptedSet.has(id)),"item cannot be partial and accepted");
  const synthetics=g.syntheticTechnical??[];
  assert(Array.isArray(synthetics)&&unique(synthetics.map(x=>x.id)),"duplicate synthetic test");
  for(const t of synthetics){
   assert(acceptedIds[g.key]?.has(t.id),"synthetic test has unknown work ID");
   assert(t.ciRun?.startsWith("https://github.com/")&&t.scope?.includes("synthetic"),
    "synthetic proof must identify its limited test and CI trace");
  }
  accepted+=g.accepted.length;partial+=g.partial.length;synthetic+=synthetics.length;
  breakdown.push({key:g.key,total:g.total,accepted:g.accepted.length,
   partial:g.partial.length,synthetic:synthetics.length});
 }
 assert(breakdown.reduce((n,g)=>n+g.total,0)===EXPECTED_WORK_COUNT,"total work count drift");
 assert(ledger.productionStatus!=="GO"||accepted===EXPECTED_WORK_COUNT,
  "release cannot be called GO with unaccepted tracked work");
 return {accepted,total:EXPECTED_WORK_COUNT,remaining:EXPECTED_WORK_COUNT-accepted,
  percent:100*accepted/EXPECTED_WORK_COUNT,partial,synthetic,breakdown,
  productionStatus:ledger.productionStatus,e2eStagingVerified:ledger.e2eStagingVerified===true};
}
export function readProgressLedger(){
 return JSON.parse(readFileSync(fileURLToPath(new URL("../../ops/avofis-work-progress.json",import.meta.url)),"utf8"));
}
export function reportLines(data){
 const p=calculateProgress(data);
 return [
  "AVOFIS_ACCEPTED="+p.accepted+"/"+p.total,
  "AVOFIS_REMAINING="+p.remaining+"/"+p.total,
  "AVOFIS_PARTIAL_REQUIREMENTS="+p.breakdown.find(x=>x.key==="requirements").partial+"/594",
  "AVOFIS_SYNTHETIC_AUXILIARY="+p.breakdown.find(x=>x.key==="auxiliary").synthetic+"/113",
  "AVOFIS_PRODUCTION="+p.productionStatus,
  "AVOFIS_STAGING_E2E="+(p.e2eStagingVerified?"VERIFIED":"NOT_VERIFIED")
 ];
}
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 console.log(reportLines(readProgressLedger()).join("\n"));
}
