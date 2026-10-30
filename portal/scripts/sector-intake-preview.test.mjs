import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {sectorPreviews,validDate,validateLocalSectorAnswers,evaluateLocalSectorPreview}
 from "../src/lib/sector-intake-preview.ts";
const ids=Array.from({length:14},(_,i)=>"R-"+String(i+361).padStart(3,"0"));
test("L4: all original R-361..374 distinct source-ID form blueprints exist",()=>{
 assert.deepEqual(sectorPreviews.map(x=>x.sourceId),ids);
 assert.equal(new Set(sectorPreviews.map(x=>x.sourceId)).size,14);
 for(const t of sectorPreviews){
  assert.ok(t.originalRequirement.length>30,t.sourceId);
  assert.ok(t.fields.length>=1,t.sourceId);
  assert.ok(t.fields.every(f=>f.required===false&&f.unknownAllowed===true),t.sourceId);
  assert.equal(new Set(t.fields.map(f=>f.key)).size,t.fields.length);
  assert.equal(t.requiresAuthenticatedDetails,true);
 }
});
test("L4: exact required field scopes present, including confidentiality holds",()=>{
 const byId=new Map(sectorPreviews.map(x=>[x.sourceId,x]));
 const keys={
  "R-361":["contractType","employmentStartDate","noticeDate","decisionDate"],
  "R-362":["vsoSigned","responseDate"],
  "R-363":["period","approxUnpaidEur","payslip","correspondence"],
  "R-364":["employeeCount","documentType","otherPartyRole"],
  "R-365":["sensitiveDisclosure"],
  "R-366":["housingRole","propertyType"],
  "R-367":["rentalEndDate","depositEur","lastCorrespondenceDate"],
  "R-368":["maintenanceKind","reportedDate","photosAvailable"],
  "R-369":["officialNotice","reportedDeadline"],
  "R-370":["writtenNotice","newRentEur","effectiveDate"],
  "R-371":["purchaseType","purchaseChannel","deliveryDate"],
  "R-372":["sellerNotified","sellerResponse"],
  "R-373":["subscriptionStartDate","cancelRequested","feeDisputed"],
  "R-374":["creditorCategory","collectionStage","serviceDate"]
 };
 for(const [id,fields] of Object.entries(keys)){
  const actual=byId.get(id)?.fields.map(x=>x.key);
  assert.deepEqual(actual,fields,id);
 }
 assert.equal(byId.get("R-365").sensitiveHold,true);
 assert.equal(byId.get("R-374").highRisk,true);
 assert.ok(!byId.get("R-374").fields.some(f=>/name|identity|contact/i.test(f.key)));
});
test("L4: missing fields, unknown choices and uncertain dates do not force guesses",()=>{
 for(const t of sectorPreviews){
  assert.equal(validateLocalSectorAnswers(t,{}),true,t.sourceId);
  const blanks=Object.fromEntries(t.fields.map(f=>[f.key,"unknown"]));
  assert.equal(validateLocalSectorAnswers(t,blanks),true,t.sourceId);
  const a=evaluateLocalSectorPreview(t,blanks);
  assert.equal(a.status,"LOCAL_DRAFT_ONLY");
  assert.equal(a.maySubmit,false);
  assert.equal(a.mayCalculateDeadline,false);
  assert.equal(a.mayCollectIdentity,false);
  assert.equal(a.fileUploadAllowed,false);
  assert.equal(a.requiresAuthenticatedDetails,true);
  assert.equal(a.sensitiveDataNotCollected,true);
  assert.ok(a.fields.every(f=>f.isUnknown),t.sourceId);
 }
});
test("L4: reject injected identity, invalid enum, noncalendar date, oversized amount",()=>{
 for(const t of sectorPreviews){
  assert.equal(validateLocalSectorAnswers(t,{fullName:"PERSONAL_DATA"}),false,t.sourceId);
  assert.throws(()=>evaluateLocalSectorPreview(t,{secretIdentity:"PRIVATE"}),/INVALID_LOCAL_PREVIEW_INPUT/);
  for(const f of t.fields){
   if(f.kind==="date"){
    assert.equal(validateLocalSectorAnswers(t,{[f.key]:"2026-02-31"}),false);
   }
   if(f.kind==="choice"){
    assert.equal(validateLocalSectorAnswers(t,{[f.key]:"invented"}),false);
   }
   if(f.kind==="approx_money"){
    assert.equal(validateLocalSectorAnswers(t,{[f.key]:"-99999"}),false);
   }
   if(f.kind==="count"){
    assert.equal(validateLocalSectorAnswers(t,{[f.key]:"12 people"}),false);
   }
  }
 }
 assert.equal(validDate("2024-02-29"),true);
 assert.equal(validDate("2025-02-29"),false);
});
test("L4: risk flags require humans, never automatic outcome",()=>{
 for(const id of ["R-361","R-362","R-365","R-369","R-374"]){
  const t=sectorPreviews.find(x=>x.sourceId===id);
  const r=evaluateLocalSectorPreview(t,{});
  assert.equal(r.attention,"PRIORITY_HUMAN_REVIEW");
  assert.equal(r.maySubmit,false);
 }
});
test("L4: only visible local UI; no account, payment, uploads or backend sends",()=>{
 const page=readFileSync(fileURLToPath(new URL("../src/app/form-hazirlik/page.tsx",import.meta.url)),"utf8");
 const model=readFileSync(fileURLToPath(new URL("../src/lib/sector-intake-preview.ts",import.meta.url)),"utf8");
 assert.ok(page.includes('catalogue.map'));
 assert.ok(page.includes('result.fields.map'));
 assert.ok(page.includes('checked={valid&&confirmed===signature}'));
 assert.ok(page.includes('setAnswers({})'));
 assert.ok(page.includes('Gizlilik metni'));
 assert.ok(page.includes('sensitiveHold'));
 assert.ok(page.includes('unknown'));
 for(const source of [page,model]){
  assert.doesNotMatch(source,/\b(fetch|localStorage|sessionStorage|sendBeacon|createClient)\s*\(/);
 }
 assert.doesNotMatch(page,/<input[^>]*type="file"/);
 assert.doesNotMatch(page,/<button[^>]*type="submit"/);
});
