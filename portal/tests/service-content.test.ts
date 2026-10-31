import test from "node:test";
import assert from "node:assert/strict";
import { copy, serviceCodes, type Language } from "../src/lib/avofis-content";
import { serviceDetails } from "../src/lib/avofis-service-details";

const languages:Language[]=["tr","nl","en"];
test("all languages contain the same six services in the same order",()=>{
  assert.equal(serviceCodes.length,6);
  for(const lang of languages){
    assert.deepEqual(copy[lang].serviceList.map(x=>x.id),serviceCodes);
    for(const item of copy[lang].serviceList){
      assert.ok(item.title.trim().length>=8);
      assert.ok(item.description.trim().length>=40);
      assert.ok(item.detail.trim().length>=50);
    }
  }
});
test("each service has document, performer, application and fee information",()=>{
 for(const lang of languages)for(const code of serviceCodes){
   const detail=serviceDetails[lang][code];
   for(const key of ["documents","operator","application","fees"] as const)
     assert.ok(detail[key].trim().length>=40,lang+"/"+code+"/"+key);
 }
});
test("document checklists are service-specific in every language",()=>{
 for(const lang of languages)assert.equal(new Set(serviceCodes.map(code=>serviceDetails[lang][code].documents)).size,6);
});
