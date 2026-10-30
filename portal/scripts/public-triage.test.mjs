import test from "node:test";
import assert from "node:assert/strict";
import {countries,preferredLanguages,contactPreferences,topics,personRoles,counterpartyTypes,requestTypes,evidenceKinds,noticeCategories,timeBands,evaluatePublicTriage}
 from "../src/lib/public-triage.ts";
const valid=()=>({
 country:"nl",residenceCountry:"nl",preferredLanguage:"tr",topic:"document",personRole:"self",
 counterpartyType:"person",requestType:"general_information",evidenceKind:"none",
 noticeCategory:"no_notice",timeBand:"later",
 immediateHarm:false,professionalNeeded:false
});
test("T09: all non-identifying select options are bounded and distinct",()=>{
 for(const values of [countries,preferredLanguages,contactPreferences,topics,personRoles,counterpartyTypes,requestTypes,evidenceKinds,noticeCategories,timeBands]){
  assert.ok(values.length>=3);
  assert.equal(values.length,new Set(values).size);
 }
});
test("T09: administrative notice cannot be treated as safely actionable",()=>{
 const a=evaluatePublicTriage({...valid(),topic:"administrative_objection",
 noticeCategory:"notice_received",timeBand:"within_7d"});
 assert.equal(a.disposition,"SPECIALIST_REVIEW");
 assert.ok(a.issues.includes("NOTICE_AND_SERVICE_DATE_REQUIRES_HUMAN_REVIEW"));
 assert.equal(a.deadlineCalculated,false);
});
test("T09: self-reported short deadline always routes urgently, never calculates deadline",()=>{
 const a=evaluatePublicTriage({...valid(),timeBand:"less_than_48h"});
 assert.equal(a.disposition,"URGENT_SPECIALIST");
 assert.equal(a.deadlineCalculated,false);
 assert.equal(a.maySubmitOfficialAction,false);
});
test("T09: IND removal and detention urgent even with no notice or selected long band",()=>{
 const a=evaluatePublicTriage({...valid(),topic:"detention_or_removal"});
 assert.equal(a.disposition,"URGENT_SPECIALIST");
 assert.ok(a.issues.includes("URGENT_DETENTION_REMOVAL_ROUTE"));
});
test("T09: unknown country/role/topic fail closed without fabricated deadline or specialist",()=>{
 const a=evaluatePublicTriage({...valid(),country:"unknown",
 topic:"unknown",personRole:"representative"});
 assert.equal(a.disposition,"SPECIALIST_REVIEW");
 assert.equal(a.officialSource,null);
 assert.ok(a.issues.includes("JURISDICTION_UNVERIFIED"));
 assert.ok(a.issues.includes("ROLE_OR_MANDATE_REQUIRES_REVIEW"));
});
test("T09: home and foreign-country options cannot inherit Dutch representation rights",()=>{
 const a=evaluatePublicTriage({...valid(),country:"de",personRole:"representative"});
 assert.equal(a.disposition,"SPECIALIST_REVIEW");
 assert.notEqual(a.officialSource,"https://www.rechtspraak.nl/");
});
test("T09: asylum requests stay specialist review and forbid filing",()=>{
 const a=evaluatePublicTriage({...valid(),topic:"asylum"});
 assert.equal(a.disposition,"SPECIALIST_REVIEW");
 assert.ok(a.issues.includes("ASYLUM_TRANSITION_AND_PERSONAL_FILING_REVIEW"));
});
test("T09: no path enables intake, official filing, payment or collection",()=>{
 for(const country of countries)for(const topic of topics)for(const noticeCategory of noticeCategories){
  const a=evaluatePublicTriage({...valid(),country,topic,noticeCategory});
  assert.equal(a.mayCreateClientRecord,false);
  assert.equal(a.maySubmitOfficialAction,false);
  assert.equal(a.mayAcceptPayment,false);
  assert.equal(a.mayUploadDocuments,false);
  assert.equal(a.mayCollectPersonalData,false);
  assert.equal(a.mayShareWithExpert,false);
  assert.equal(a.deadlineCalculated,false);
  assert.equal(a.onlyGenericInformation,true);
 }
});
test("T09: unsupported values are rejected rather than silently defaulting to NL",()=>{
 const a=evaluatePublicTriage({...valid(),country:"xx",timeBand:"tomorrow"});
 assert.equal(a.disposition,"SPECIALIST_REVIEW");
 assert.deepEqual(a.issues,["INVALID_OR_UNKNOWN_INPUT"]);
 assert.equal(a.officialSource,null);
});

test("T09: family, employer and organisation are not silently verified mandataries",()=>{
 for(const personRole of ["relative","employer","organisation","representative","unknown"]){
  const res=evaluatePublicTriage({...valid(),personRole,topic:"document"});
  assert.equal(res.disposition,"SPECIALIST_REVIEW",personRole);
  assert.ok(res.issues.includes("ROLE_OR_MANDATE_REQUIRES_REVIEW"),personRole);
 }
});
test("T09: Dutch IND topics use an official IND starting point, not a court proxy",()=>{
 for(const topic of ["asylum","residence","detention_or_removal"]){
  const res=evaluatePublicTriage({...valid(),topic});
  assert.equal(res.officialSource,"https://ind.nl/",topic);
  assert.equal(res.maySubmitOfficialAction,false);
 }
});
test("T09: no risk triage input can share records or expert files",()=>{
 for(const country of countries)
  for(const topic of topics)
   for(const personRole of personRoles)
    for(const noticeCategory of noticeCategories){
     const res=evaluatePublicTriage({...valid(),country,topic,personRole,noticeCategory});
     assert.equal(res.mayCollectPersonalData,false);
     assert.equal(res.mayShareWithExpert,false);
     assert.equal(res.mayUploadDocuments,false);
     assert.equal(res.mayAcceptPayment,false);
    }
});

test("L4 R-347: user's possible one-week proximity triggers human review even without a formal notice",()=>{
 for(const country of countries){
  const res=evaluatePublicTriage({...valid(),country,topic:"document",
   noticeCategory:"no_notice",timeBand:"within_7d"});
  assert.equal(res.disposition,"SPECIALIST_REVIEW",country);
  assert.ok(res.issues.includes("SELF_REPORTED_NEAR_TERM_REQUIRES_HUMAN_REVIEW"),country);
  assert.equal(res.deadlineCalculated,false);
  assert.equal(res.mayCreateClientRecord,false);
  assert.equal(res.maySubmitOfficialAction,false);
 }
});
test("L4 R-347/R-348: escalation is monotone and cannot turn risk into an automated filing",()=>{
 const signals=[
  {...valid(),timeBand:"within_7d"},
  {...valid(),timeBand:"less_than_48h"},
  {...valid(),immediateHarm:true},
  {...valid(),topic:"detention_or_removal",timeBand:"later"}
 ];
 assert.deepEqual(signals.map(x=>evaluatePublicTriage(x).disposition),[
  "SPECIALIST_REVIEW","URGENT_SPECIALIST","URGENT_SPECIALIST","URGENT_SPECIALIST"]);
 for(const x of signals){
  const result=evaluatePublicTriage(x);
  for(const field of ["mayCreateClientRecord","maySubmitOfficialAction",
   "mayAcceptPayment","mayUploadDocuments","mayShareWithExpert",
   "mayCollectPersonalData","deadlineCalculated"]){
   assert.equal(result[field],false,field);
  }
 }
});

test("L4 R-345: counterpart classification bounded to 5 categories plus unsure; no names",()=>{
 assert.deepEqual([...counterpartyTypes],["person","employer","authority","company","other","unknown"]);
 for(const counterpartyType of counterpartyTypes){
  const r=evaluatePublicTriage({...valid(),counterpartyType});
  assert.equal(r.mayCollectPersonalData,false,counterpartyType);
  assert.equal(r.mayCreateClientRecord,false,counterpartyType);
  if(["other","unknown"].includes(counterpartyType)){
    assert.equal(r.disposition,"SPECIALIST_REVIEW",counterpartyType);
    assert.ok(r.issues.includes("COUNTERPARTY_CATEGORY_REQUIRES_REVIEW"));
  }
 }
});
test("L4 R-349: four request types exist; personalised types require human contract review",()=>{
 assert.deepEqual([...requestTypes],[
  "general_information","brief_consultation","document_review","detailed_case_analysis","unknown"]);
 assert.equal(evaluatePublicTriage(valid()).disposition,"OFFICIAL_INFORMATION");
 for(const requestType of ["brief_consultation","document_review","detailed_case_analysis"]){
  const r=evaluatePublicTriage({...valid(),requestType});
  assert.equal(r.disposition,"SPECIALIST_REVIEW",requestType);
  assert.ok(r.issues.includes("PAID_OR_PERSONALISED_SERVICE_REQUIRES_SEPARATE_HUMAN_CONTRACT_REVIEW"));
  assert.equal(r.mayAcceptPayment,false);
  assert.equal(r.maySubmitOfficialAction,false);
  assert.equal(r.mayCreateClientRecord,false);
 }
 const uncertain=evaluatePublicTriage({...valid(),requestType:"unknown"});
 assert.equal(uncertain.disposition,"SPECIALIST_REVIEW");
 assert.ok(uncertain.issues.includes("REQUEST_TYPE_REQUIRES_REVIEW"));
});
test("L4 R-350: reject unexpected PII/body fields and unknown enum values, without echoing them",()=>{
 const forbidden=["name","fullName","email","phone","caseNumber",
  "document","noticeDate","opposingPartyName","file","personalId","freeText"];
 for(const key of forbidden){
  const injected={...valid(),[key]:"PRIVATE_TEST_SENTINEL_NO_REAL_DATA"};
  const r=evaluatePublicTriage(injected);
  assert.deepEqual(r.issues,["INVALID_OR_UNKNOWN_INPUT"],key);
  assert.equal(r.disposition,"SPECIALIST_REVIEW",key);
  assert.equal(r.onlyGenericInformation,true,key);
  assert.equal(r.mayCollectPersonalData,false,key);
  assert.ok(!JSON.stringify(r).includes("PRIVATE_TEST_SENTINEL_NO_REAL_DATA"),key);
 }
 for(const value of ["unlicensed","",null,3]){
  const r=evaluatePublicTriage({...valid(),requestType:value});
  assert.equal(r.disposition,"SPECIALIST_REVIEW");
  assert.deepEqual(r.issues,["INVALID_OR_UNKNOWN_INPUT"]);
 }
});
test("L4 R-345/R-349/R-350: visible UI only offers category selections and disclaims contract",async()=>{
 const {readFileSync}=await import("node:fs");
 const {fileURLToPath}=await import("node:url");
 const ui=readFileSync(fileURLToPath(new URL("../src/app/triyaj/page.tsx",import.meta.url)),"utf8");
 assert.match(ui,/select\("counterpartyType",t\.counterparty,counterpartyTypes,counterpartyOptions\)/);
 assert.match(ui,/select\("requestType",t\.request,requestTypes,requestTypeOptions\)/);
 assert.match(ui,/Genel bilgi/);
 assert.match(ui,/Kısa görüşme/);
 assert.match(ui,/Belge inceleme/);
 assert.match(ui,/Ayrıntılı dosya analizi/);
 assert.match(ui,/isim yazmayın/);
 assert.match(ui,/hizmet sözleşmesi veya dosya açılışı değildir/);
 assert.doesNotMatch(ui,/<input[^>]*name=["'](email|full_name|phone)["']/);
});

test("L4 R-343: preferred language, actual location country and matter country remain separate enums",()=>{
 assert.deepEqual([...preferredLanguages],["tr","nl","de","en","ar","ru","unknown"]);
 const validRoute=evaluatePublicTriage(valid());
 assert.equal(validRoute.disposition,"OFFICIAL_INFORMATION");
 for(const preferredLanguage of preferredLanguages){
  const out=evaluatePublicTriage({...valid(),preferredLanguage});
  assert.equal(out.mayCollectPersonalData,false,preferredLanguage);
  assert.equal(out.mayCreateClientRecord,false,preferredLanguage);
  assert.equal(out.deadlineCalculated,false,preferredLanguage);
  if(preferredLanguage==="unknown"){
   assert.equal(out.disposition,"SPECIALIST_REVIEW");
   assert.ok(out.issues.includes("PREFERRED_LANGUAGE_REQUIRES_HUMAN_REVIEW"));
  }
 }
 const crossing=evaluatePublicTriage({...valid(),residenceCountry:"de",country:"nl"});
 assert.equal(crossing.disposition,"SPECIALIST_REVIEW");
 assert.ok(crossing.issues.includes("CROSS_BORDER_JURISDICTION_REVIEW"));
 assert.equal(crossing.officialSource,"https://www.rechtspraak.nl/");
 const noLocation=evaluatePublicTriage({...valid(),residenceCountry:"unknown"});
 assert.ok(noLocation.issues.includes("RESIDENCE_COUNTRY_REQUIRES_HUMAN_REVIEW"));
 assert.equal(noLocation.disposition,"SPECIALIST_REVIEW");
});
test("L4 R-358: 'not sure' topic never yields a generic automatic procedure/filing",()=>{
 for(const country of countries){
  const r=evaluatePublicTriage({...valid(),country,topic:"unknown"});
  assert.equal(r.disposition,"SPECIALIST_REVIEW",country);
  assert.ok(r.issues.includes("UNSURE_HUMAN_REVIEW_REQUIRED"),country);
  assert.equal(r.maySubmitOfficialAction,false);
  assert.equal(r.mayCreateClientRecord,false);
 }
});
test("L4 R-343/R-350: invalid extended language/location or surprise personal fields fail closed",()=>{
 for(const payload of [
 {...valid(),preferredLanguage:"xx"},
 {...valid(),residenceCountry:"Belgium"},
 {...valid(),caseFacts:"SECRET_SENTINEL"},
 {...valid(),preferredLanguage:9},
 {...valid(),locationStreet:"PRIVATE_STREET"}
 ]){
  const r=evaluatePublicTriage(payload);
  assert.deepEqual(r.issues,["INVALID_OR_UNKNOWN_INPUT"]);
  assert.equal(r.disposition,"SPECIALIST_REVIEW");
  assert.equal(r.officialSource,null);
  assert.equal(r.mayCollectPersonalData,false);
  assert.equal(r.mayUploadDocuments,false);
  assert.ok(!JSON.stringify(r).includes("SECRET_SENTINEL"));
 }
});
test("L4 R-352/R-353/R-359: static public UI exposes privacy before controls and closes contract and private file upload",async()=>{
 const {readFileSync}=await import("node:fs");
 const {fileURLToPath}=await import("node:url");
 const page=readFileSync(fileURLToPath(new URL("../src/app/triyaj/page.tsx",import.meta.url)),"utf8");
 assert.match(page,/href=\{"\/gizlilik\?lang="\+lang\}/);
 assert.match(page,/select\("preferredLanguage",t\.preferred,preferredLanguages,languageOptions\)/);
 assert.match(page,/select\("residenceCountry",t\.residence,countries,countryOptions\)/);
 assert.match(page,/select\("country",t\.country,countries,countryOptions\)/);
 assert.match(page,/privacy\.contract/);
 assert.match(page,/privacy\.upload/);
 assert.ok(page.indexOf('aria-label="Privacy before orientation"')<page.indexOf('aria-label="Non-identifying, local-only selections"'));
 assert.match(page,/does not guarantee legal translation or representation/);
 assert.doesNotMatch(page,/<input[^>]+type="file"/);
 assert.doesNotMatch(page,/<form[^>]*action=/);
});

test("L4 R-396: reported danger or imminent date escalates at the relevant question and never calculates the deadline",()=>{
 const cases=[
  {immediateHarm:true},
  {topic:"detention_or_removal"},
  {timeBand:"less_than_48h"},
  {timeBand:"within_7d"},
  {noticeCategory:"notice_received"}
 ];
 const basis={
  country:"nl",residenceCountry:"nl",preferredLanguage:"tr",
  topic:"document",personRole:"self",counterpartyType:"person",
  requestType:"general_information",noticeCategory:"no_notice",
  timeBand:"later",immediateHarm:false,professionalNeeded:false
 };
 for(const c of cases){
  const r=evaluatePublicTriage({...basis,...c});
  assert.ok(["URGENT_SPECIALIST","SPECIALIST_REVIEW"].includes(r.disposition));
  assert.equal(r.deadlineCalculated,false);
  assert.equal(r.maySubmitOfficialAction,false);
  assert.equal(r.mayCreateClientRecord,false);
 }
});
test("L4 R-396: risk-specific inline warning appears inside time/notice fieldset, not only in result section",async()=>{
 const {readFileSync}=await import("node:fs");
 const {fileURLToPath}=await import("node:url");
 const page=readFileSync(fileURLToPath(new URL("../src/app/triyaj/page.tsx",import.meta.url)),"utf8");
 const fieldset=page.indexOf('<fieldset className="mt-5 rounded-xl border border-[#dfbf59]/50 p-4">');
 const inline=page.indexOf('role="alert"',fieldset);
 const close=page.indexOf('</fieldset>',fieldset);
 assert.ok(fieldset>=0&&inline>fieldset&&inline<close);
 assert.match(page,/input\.timeBand==="within_7d"/);
 assert.match(page,/input\.noticeCategory==="notice_received"/);
 assert.match(page,/result\.disposition==="URGENT_SPECIALIST"/);
 assert.match(page,/aria-live="assertive"/);
 assert.match(page,/t\.earlyNote/);
 assert.doesNotMatch(page,/<button[^>]*type="submit"/);
});

test("L4 R-375: evidence kinds are anonymous, bounded and never require first-stage upload",()=>{
 assert.deepEqual([...evidenceKinds],[
  "none","official_decision","contract","correspondence","other","unknown"]);
 for(const evidenceKind of evidenceKinds){
  const result=evaluatePublicTriage({...valid(),evidenceKind});
  assert.equal(result.mayUploadDocuments,false,evidenceKind);
  assert.equal(result.mayCollectPersonalData,false,evidenceKind);
  assert.equal(result.mayCreateClientRecord,false,evidenceKind);
  if(["unknown","other"].includes(evidenceKind)){
   assert.equal(result.disposition,"SPECIALIST_REVIEW",evidenceKind);
   assert.ok(result.issues.includes("EVIDENCE_CATEGORY_REQUIRES_HUMAN_REVIEW"));
  }
 }
 for(const evidenceKind of ["passport_scan",null,{},17]){
  const r=evaluatePublicTriage({...valid(),evidenceKind});
  assert.deepEqual(r.issues,["INVALID_OR_UNKNOWN_INPUT"]);
  assert.equal(r.mayUploadDocuments,false);
 }
});
test("L4 R-375/R-376: evidence and independent local accuracy confirmation never create a formal application",async()=>{
 const {readFileSync}=await import("node:fs");
 const {fileURLToPath}=await import("node:url");
 const ui=readFileSync(fileURLToPath(new URL("../src/app/triyaj/page.tsx",import.meta.url)),"utf8");
 assert.match(ui,/select\("evidenceKind",t\.evidence,evidenceKinds,evidenceOptions\)/);
 assert.match(ui,/t\.evidenceNote/);
 assert.match(ui,/evidenceOptions\[review\.evidenceKind/);
 assert.match(ui,/checked=\{isTruthReviewed\}/);
 assert.match(ui,/setTruthKey\(e\.target\.checked\?reviewSignature:null\)/);
 assert.match(ui,/hukukî beyan veya gönderim değildir/);
 assert.doesNotMatch(ui,/<input[^>]*type="file"/);
 assert.doesNotMatch(ui,/<button[^>]*type="submit"/);
});

test("L4 R-351: optional phone, email and written communication preferences cannot collect identity",()=>{
 assert.deepEqual([...contactPreferences],["none","phone","email","written","unknown"]);
 const without=evaluatePublicTriage(valid());
 assert.equal(without.mayCollectPersonalData,false);
 for(const contactPreference of contactPreferences){
  const res=evaluatePublicTriage({...valid(),contactPreference});
  assert.equal(res.mayCollectPersonalData,false,contactPreference);
  assert.equal(res.mayCreateClientRecord,false,contactPreference);
  assert.equal(res.maySubmitOfficialAction,false,contactPreference);
  assert.equal(res.mayShareWithExpert,false,contactPreference);
  assert.equal(res.disposition,"OFFICIAL_INFORMATION",contactPreference);
 }
 const unexpected=evaluatePublicTriage({...valid(),contactPreference:"actual.name@example.org"});
 assert.deepEqual(unexpected.issues,["INVALID_OR_UNKNOWN_INPUT"]);
 assert.equal(unexpected.disposition,"SPECIALIST_REVIEW");
});
test("L4 R-351: contact mode form is local and contains no contact detail text fields",async()=>{
 const {readFileSync}=await import("node:fs");
 const {fileURLToPath}=await import("node:url");
 const page=readFileSync(fileURLToPath(new URL("../src/app/triyaj/page.tsx",import.meta.url)),"utf8");
 assert.match(page,/select\("contactPreference",t\.contact,contactPreferences,contactOptions\)/);
 assert.match(page,/t\.contactNote/);
 assert.match(page,/contactOptions\[review\.contactPreference/);
 assert.match(page,/Telefon \/ Phone/);
 assert.match(page,/Yazılı \/ Written/);
 assert.doesNotMatch(page,/<input[^>]+(type="email"|type="tel")/);
 assert.doesNotMatch(page,/<button[^>]*type="submit"/);
});
