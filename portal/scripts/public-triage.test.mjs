import test from "node:test";
import assert from "node:assert/strict";
import {countries,topics,personRoles,noticeCategories,timeBands,evaluatePublicTriage}
 from "../src/lib/public-triage.ts";
const valid=()=>({
 country:"nl",topic:"document",personRole:"self",
 noticeCategory:"no_notice",timeBand:"later",
 immediateHarm:false,professionalNeeded:false
});
test("T09: all non-identifying select options are bounded and distinct",()=>{
 for(const values of [countries,topics,personRoles,noticeCategories,timeBands]){
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
