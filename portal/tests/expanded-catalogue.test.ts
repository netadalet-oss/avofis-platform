import test from "node:test";
import assert from "node:assert/strict";
import {services,audiences} from "../src/lib/avofis-site";
test("expanded catalogue has 17 unique services and 14 audience routes in four full languages",()=>{
 assert.equal(services.length,17);
 assert.equal(audiences.length,14);
 assert.equal(new Set(services.map(x=>x.slug)).size,17);
 for(const x of services){
  for(const lang of ["tr","nl","de","en"] as const){
   assert.ok(x.title[lang].trim().length>3, x.slug+"/"+lang);
   assert.ok(x.lead[lang].trim().length>25,x.slug+"/"+lang);
   assert.ok(x.boundaries[lang].trim().length>25,x.slug+"/"+lang);
  }
 }
});
