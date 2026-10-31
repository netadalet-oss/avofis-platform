import test from "node:test";
import assert from "node:assert/strict";
import {staffCapabilities,sections,canAccessWorkspace,
 availableWorkspaceSections,productionActions} from "../src/lib/workspace-model.ts";
import {workstreams,legalSources,findWorkstreams} from "../src/lib/legal-workflows.ts";
test("P01 all internal capabilities are unique and map to exactly one professional menu",()=>{
 assert.equal(staffCapabilities.length,16);
 assert.equal(new Set(staffCapabilities).size,16);
 assert.equal(new Set(sections.map(s=>s.id)).size,16);
 assert.ok(sections.every(x=>x.tasks.length>=4&&x.description&&x.label&&x.group));
});
test("P01 no unauthenticated/client/unknown role may see employee sections",()=>{
 for(const role of ["client","user","anonymous","","superuser",null]){
  assert.deepEqual(availableWorkspaceSections(role,staffCapabilities),[]);
  assert.equal(canAccessWorkspace(role,staffCapabilities,"billing"),false);
 }
});
test("P01 least privilege cannot be escalated by section or forged grant",()=>{
 for(const capability of staffCapabilities){
  const allowed=availableWorkspaceSections("operator",[capability]);
  assert.deepEqual(allowed.map(x=>x.id),[capability]);
  for(const c of staffCapabilities.filter(c=>c!==capability))
   assert.equal(canAccessWorkspace("operator",[capability],c),false);
 }
 assert.equal(availableWorkspaceSections("operator",[]).length,0);
 assert.equal(availableWorkspaceSections("admin",[]).length,16);
});
test("P01 every action that changes outside systems is disabled",()=>{
 assert.ok(Object.values(productionActions).every(v=>v===false));
 for(const key of ["bankTransfer","officialCourtFiling","indSubmission",
  "externalMessageDispatch","personalDocumentUpload"])assert.equal(productionActions[key],false);
});
test("P02 source-grounded workstreams have scope, legal checklist and draft, not fabricated official forms",()=>{
 assert.ok(workstreams.length>=14);
 assert.ok(legalSources.length>=10);
 for(const w of workstreams){
  assert.ok(w.steps.length>=3&&w.documents.length>=3&&w.templateBody.length>=100,w.id);
  assert.ok(w.review.length>10);
  const parsed=new URL(w.source);
  assert.equal(parsed.protocol,"https:");
  assert.ok(["NL","EU"].includes(w.country));
  assert.ok(["standard","high"].includes(w.risk));
 }
 assert.equal(workstreams.filter(x=>x.id==="nl-ind-asylum").length,1);
 assert.equal(workstreams.some(x=>x.id==="nl-bestuursrecht"),true);
 assert.ok(workstreams.some(x=>x.id==="nl-regular-immigration-court"));
 assert.notEqual(workstreams.find(x=>x.id==="nl-regular-immigration-court")?.source,workstreams.find(x=>x.id==="nl-ind-asylum")?.source);
 assert.ok(findWorkstreams("vergi").length>0);
 assert.equal(findWorkstreams("imkansız-bir-konu").length,0);
});
