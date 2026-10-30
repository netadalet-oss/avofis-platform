import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {journeys,journeyIds,validateJourneyDetails} from "../src/lib/journeys.ts";
import {officialSources} from "../src/lib/journey-sources.ts";
import {serviceSlugs} from "../src/lib/document-preparation.ts";
const root=fileURLToPath(new URL("../src/lib/",import.meta.url));
const old=readFileSync(root+"avofis-site.ts","utf8");
const expanded=readFileSync(root+"avofis-expanded.ts","utf8");
function literalRows(source,begin,end){
 const i=source.indexOf(begin);
 assert.ok(i>=0,"Missing catalogue section "+begin);
 const j=end?source.indexOf(end,i+begin.length):source.length;
 assert.ok(j>=0,"Missing boundary "+end);
 return (source.slice(i,j).match(/\bslug\s*:\s*"/g)||[]).length;
}
test("594 scope: historical 17 services, 14 audiences and 12 problem journeys are retained",()=>{
 const baseServices=literalRows(old,"export const services:Service[]=[","export const audiences:Audience[]=[");
 const extraServices=literalRows(expanded,"export const extraServices:Service[]=[","export const extraAudiences:Audience[]=[");
 const baseAudiences=literalRows(old,"export const audiences:Audience[]=[","export const processSteps=[");
 const extraAudiences=literalRows(expanded,"export const extraAudiences:Audience[]=[");
 assert.equal(baseServices+extraServices,17);
 assert.equal(baseAudiences+extraAudiences,14);
 assert.equal(journeys.length,12);
 assert.equal(new Set(journeyIds).size,12);
 assert.equal(serviceSlugs.length,17);
});
test("All 12 journeys have meaningful three-language information and official citations",()=>{
 assert.deepEqual(Object.keys(officialSources).sort(),[...journeyIds].sort());
 for(const j of journeys){
  assert.ok(j.id.length>=4);
  for(const field of ["title","audience","need","preparation","responsibility","next"]){
   for(const locale of ["tr","nl","en"])
    assert.ok(j[field][locale]?.trim().length>=12,j.id+":"+field+":"+locale);
  }
  assert.ok(j.fields.length>=2,j.id);
  for(const f of j.fields){
   assert.ok(f.options.length>=3,j.id+":"+f.key);
   assert.equal(new Set(f.options.map(o=>o.value)).size,f.options.length);
   for(const locale of ["tr","nl","en"])assert.ok(f.label[locale]?.trim().length>4);
  }
  const values=Object.fromEntries(j.fields.map(f=>[f.key,f.options[0].value]));
  assert.equal(validateJourneyDetails(j.id,values),true);
  assert.equal(validateJourneyDetails(j.id,{...values,owner_user_id:"forged"}),false);
  for(const source of officialSources[j.id]){
   assert.ok(source.url.startsWith("https://"));
   assert.ok(["ind.nl","www.huurcommissie.nl","www.rijksoverheid.nl","www.netherlandsworldwide.nl",
    "www.bureauwbtv.nl","www.government.nl","www.idw.nl","www.kvk.nl"].includes(new URL(source.url).hostname),source.url);
  }
 }
});
test("Housing, wage and IND problem routes preserve non-identifying choices",()=>{
 for(const id of ["rent-repairs","unpaid-wages","ind-decision-objection"]){
  const j=journeys.find(x=>x.id===id);
  assert.ok(j,id);
  assert.equal(j.fields.length,2);
  assert.ok(officialSources[id].length);
  for(const f of j.fields)assert.ok(f.options.every(x=>!/name|email|id-number|address/.test(x.value)));
 }
});
