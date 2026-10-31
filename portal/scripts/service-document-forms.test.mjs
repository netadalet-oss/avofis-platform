import test from "node:test";
import assert from "node:assert/strict";
import {serviceSlugs,draftLocales,newPreparation,validatePreparation,
 isPreparationReadyForReview,preparationDocx} from "../src/lib/document-preparation.ts";
import {fieldsByService,serviceFieldTypes,localizedFieldLabels,
 serviceSchemaCoverage,isCalendarDate} from "../src/lib/service-document-forms.ts";
test("FORM03 exactly preserves all seventeen historical services; each has four tailored fields",()=>{
 assert.deepEqual(serviceSchemaCoverage(),{count:17,complete:true});
 assert.deepEqual(Object.keys(fieldsByService).sort(),[...serviceSlugs].sort());
 const shapes=new Set();
 for(const slug of serviceSlugs){
  const keys=fieldsByService[slug];
  assert.equal(keys.length,4);
  assert.equal(keys.filter(x=>x==="requestedAction").length,1);
  keys.forEach(x=>assert.ok(x in serviceFieldTypes));
  shapes.add(keys.join(","));
 }
 assert.ok(shapes.size>=15,"service-specific rather than copied generic forms");
});
test("FORM03 field labels cover all six locales without falling back to English",()=>{
 for(const locale of draftLocales){
  for(const key of Object.keys(serviceFieldTypes)){
   const label=localizedFieldLabels[locale][key];
   assert.equal(typeof label,"string");
   assert.ok(label.trim().length>=8);
  }
 }
});
test("FORM03 every service round trips strictly through v2 and DOCX safely",()=>{
 for(const service of serviceSlugs)for(const locale of draftLocales){
  const draft=newPreparation(service,locale);
  assert.equal(draft.version,2);
  assert.deepEqual(validatePreparation(draft),draft);
  const first=fieldsByService[service][0];
  draft.answers={[first]:"",requestedAction:"Request review of situation"};
  assert.deepEqual(validatePreparation(draft),draft);
  const serialized=JSON.parse(JSON.stringify(draft));
  assert.deepEqual(validatePreparation(serialized),draft);
  assert.ok(preparationDocx(draft,"Relevant service").length>1000);
  assert.equal(validatePreparation({...draft,answers:{...draft.answers,foreignField:"data"}}),null);
 }
});
test("FORM03 dates reject rollover/leap errors and amounts reject negative/overprecision",()=>{
 assert.equal(isCalendarDate("2024-02-29"),true);
 for(const date of ["2025-02-29","2026-02-30","2026-13-01","2026-00-01",
  "26-11-02","2026-11-2","9999-01-01","2026-01-01T00:00:00Z"])
  assert.equal(isCalendarDate(date),false,date);
 const rent=newPreparation("konut-kira-sigorta","tr");
 rent.answers={incidentDate:"2025-02-29"};
 assert.equal(validatePreparation(rent),null);
 const claim=newPreparation("alacak-takibi","tr");
 claim.answers={invoiceAmount:"-5.00"};
 assert.equal(validatePreparation(claim),null);
 for(const value of ["1.234","10,123","123456789012"]){
  claim.answers={invoiceAmount:value};assert.equal(validatePreparation(claim),null);
 }
 claim.answers={invoiceAmount:"123.50"};
 assert.deepEqual(validatePreparation(claim),claim);
});
test("FORM03 draft save accepts partial values; actual review requires context and request",()=>{
 const d=newPreparation("vize-oturum-vatandaslik","ar");
 assert.deepEqual(validatePreparation(d),d);
 assert.equal(isPreparationReadyForReview(d),false);
 d.country="NL";d.purpose="Review permit decision";d.chronology="Applicant chronology";
 d.answers={requestedAction:"Please review the refusal",expiryDate:"2026-12-15"};
 assert.equal(isPreparationReadyForReview(d),true);
 d.answers={...d.answers,decisionReference:"\u0000"};
 assert.equal(validatePreparation(d),null);
 assert.equal(isPreparationReadyForReview(d),false);
});
