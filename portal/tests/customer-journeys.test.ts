import test from "node:test";
import assert from "node:assert/strict";
import {journeys,journeyIds,getJourney,validateJourneyDetails} from "../src/lib/journeys";
import {nextCaseAction} from "../src/lib/case-next-action";

test("all nine customer procedures are complete in three languages",()=>{
 assert.equal(journeys.length,9);
 assert.equal(new Set(journeyIds).size,9);
 for(const j of journeys){
   assert.ok(j.fields.length>0);
   assert.equal(new Set(j.fields.map(f=>f.key)).size,j.fields.length);
   for(const lang of ["tr","nl","en"] as const){
     for(const field of ["title","audience","need","preparation","responsibility","next"] as const)
       assert.ok(j[field][lang].length>=15,j.id+"/"+lang+"/"+field);
     for(const f of j.fields){
       assert.ok(f.label[lang].length>=4);
       assert.ok(f.options.length>=3,j.id+"/"+f.key);
       assert.equal(new Set(f.options.map(x=>x.value)).size,f.options.length);
       assert.ok(f.options.every(opt=>opt.label[lang].trim().length>0));
     }
   }
 }
});
test("journey input validation rejects missing, forged and out-of-scope options",()=>{
 for(const j of journeys){
   const valid=Object.fromEntries(j.fields.map(f=>[f.key,f.options[0].value]));
   assert.ok(validateJourneyDetails(j.id,valid),j.id+" valid");
   assert.equal(validateJourneyDetails(j.id,{...valid,extra:"token"}),false);
   const first=j.fields[0];
   assert.equal(validateJourneyDetails(j.id,{...valid,[first.key]:"__unknown__"}),false);
   assert.equal(validateJourneyDetails(j.id,{}),false);
 }
 assert.equal(getJourney("not-in-catalogue"),undefined);
 assert.equal(validateJourneyDetails("not-in-catalogue",{foo:"bar"}),false);
});
test("next action follows actual agreement, payment and document state",()=>{
 const base={status:"open",hasAgreement:true,agreementSigned:true,priceEurCents:5000,paid:false,hasPendingDocuments:false};
 assert.match(nextCaseAction(base),/ödeme/);
 assert.match(nextCaseAction({...base,paid:true,hasPendingDocuments:true}),/belge/);
 assert.match(nextCaseAction({...base,hasAgreement:false}),/Sözleşme/);
 assert.match(nextCaseAction({...base,agreementSigned:false}),/Sözleşmenizi/);
 assert.match(nextCaseAction({...base,status:"review"}),/ön inceleme/);
 assert.match(nextCaseAction({...base,status:"completed"}),/tamamlandı/);
});
