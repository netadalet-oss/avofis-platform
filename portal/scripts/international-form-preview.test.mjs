import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {internationalPreviews} from "../src/lib/international-form-preview.ts";
import {sectorPreviews,validateLocalSectorAnswers,evaluateLocalSectorPreview}
 from "../src/lib/sector-intake-preview.ts";
const ids=Array.from({length:17},(_,i)=>"R-"+String(i+379).padStart(3,"0"));
const catalogue=[...sectorPreviews,...internationalPreviews];
test("L4: 17 exact original R379..395 form records, total 31 unique source IDs",()=>{
 assert.deepEqual(internationalPreviews.map(x=>x.sourceId),ids);
 assert.equal(catalogue.length,31);
 assert.equal(new Set(catalogue.map(x=>x.sourceId)).size,31);
 for(const t of internationalPreviews){
  assert.ok(t.originalRequirement.length>40,t.sourceId);
  assert.ok(t.fields.length>0,t.sourceId);
  assert.ok(t.fields.every(f=>f.required===false&&f.unknownAllowed===true));
  assert.equal(t.requiresAuthenticatedDetails,true);
  assert.equal(new Set(t.fields.map(f=>f.key)).size,t.fields.length);
 }
});
test("L4: source-specific international fields and withholding of sensitive identifiers",()=>{
 const map=new Map(internationalPreviews.map(t=>[t.sourceId,t]));
 const expected={
 "R-379":["applicationType","indReferenceAvailable","decisionDate"],
 "R-380":["permitExpiryDate"],
 "R-381":["refusalAuthorityType","decisionDate","applicantCountry"],
 "R-382":["userRole","otherRole"],
 "R-383":["requestKind"],
 "R-384":["marriageCountry","residenceCountry","procedureCountry"],
 "R-385":["caseExists","firstCountry","secondCountry"],
 "R-386":["requestKind"],
 "R-387":["reportedDeathDate","originCountry","otherCountry","documentType"],
 "R-388":["institutionCategory","decisionType","dispatchDate","knowledgeDate"],
 "R-389":["benefitType"],
 "R-390":["issuedCountry","useCountry"],
 "R-391":["decisionType","finalityAvailable"],
 "R-392":["documentType","documentLanguage","authorityType"],
 "R-393":["firstCompanyCountry","secondCompanyCountry","contractLanguage","disputeType"],
 "R-394":["parallelProceedings","firstCountry","secondCountry"],
 "R-395":["briefWrittenIntent"]
 };
 for(const [id,keys] of Object.entries(expected))
  assert.deepEqual(map.get(id)?.fields.map(f=>f.key),keys,id);
 for(const id of ["R-379","R-380","R-382","R-384","R-385","R-386","R-387","R-389","R-394","R-395"])
  assert.equal(map.get(id).sensitiveHold,true,id);
 for(const t of internationalPreviews)
  assert.ok(!t.fields.some(f=>/^(fullName|indNumber|bsn|childName|passport|medicalRecord|email|phone)$/.test(f.key)),t.sourceId);
});
test("L4: unknowns never compel a fabricated date or actual official IND reference",()=>{
 for(const t of internationalPreviews){
  assert.equal(validateLocalSectorAnswers(t,{}),true,t.sourceId);
  const uncertain=Object.fromEntries(t.fields.map(f=>[f.key,"unknown"]));
  assert.equal(validateLocalSectorAnswers(t,uncertain),true,t.sourceId);
  const result=evaluateLocalSectorPreview(t,uncertain,catalogue);
  assert.equal(result.maySubmit,false);
  assert.equal(result.mayCalculateDeadline,false);
  assert.equal(result.mayCollectIdentity,false);
  assert.equal(result.fileUploadAllowed,false);
  assert.equal(result.requiresAuthenticatedDetails,true);
  assert.ok(result.fields.every(f=>f.isUnknown));
  assert.equal(validateLocalSectorAnswers(t,{indReference:"PRIVATE_SENTINEL"}),false);
  for(const f of t.fields){
   if(f.kind==="date")
    assert.equal(validateLocalSectorAnswers(t,{[f.key]:"2026-02-31"}),false,t.sourceId);
  }
 }
});
test("L4 R395: only optional bounded written explanation, no voice processing",()=>{
 const form=internationalPreviews.find(x=>x.sourceId==="R-395");
 assert.equal(form.fields[0].kind,"short_note");
 assert.equal(validateLocalSectorAnswers(form,{briefWrittenIntent:"Question about procedure"}),true);
 assert.equal(validateLocalSectorAnswers(form,{briefWrittenIntent:"x".repeat(161)}),false);
 const text=readFileSync(fileURLToPath(new URL("../src/app/form-hazirlik/page.tsx",import.meta.url)),"utf8");
 assert.ok(text.includes("short_note"));
 assert.ok(!text.includes("MediaRecorder"));
 assert.ok(!text.includes('type="file"'));
 assert.ok(!text.includes('type="submit"'));
 assert.ok(text.includes("internationalPreviews"));
});
test("L4: unknown/invalid other-party or country details remain safe and local",()=>{
 for(const t of internationalPreviews){
  assert.equal(validateLocalSectorAnswers(t,{personalId:"123456789"}),false);
  const approved=evaluateLocalSectorPreview(t,{},catalogue);
  assert.equal(approved.status,"LOCAL_DRAFT_ONLY");
  assert.equal(approved.sensitiveDataNotCollected,true);
  assert.equal(approved.clientRecordCreated,undefined);
 }
});
