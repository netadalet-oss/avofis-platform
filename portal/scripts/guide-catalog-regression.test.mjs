import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {legalGuides,guideEditorialPreviewAllowed,guideSourceVersion}
 from "../src/lib/avofis-guide-registry.ts";
import {serviceSlugs} from "../src/lib/document-preparation.ts";
test("CONTENT01 source-backed 16 guides preserved with distinct URLs, legal review blocked",()=>{
 assert.equal(legalGuides.length,16);
 assert.match(guideSourceVersion,/2026-10-29/);
 assert.deepEqual(legalGuides.map(x=>x.number),Array.from({length:16},(_,i)=>i+1));
 assert.equal(new Set(legalGuides.map(x=>x.slug)).size,16);
 for(const g of legalGuides){
  assert.ok(g.titleNl.length>=30,g.slug);
  assert.ok(g.introNl.length>=85,g.slug);
  assert.ok(serviceSlugs.includes(g.relatedService),g.slug);
  assert.match(g.officialSourceUrl,/^https:\/\//);
  assert.equal(g.legalReview,"pending");
  assert.equal(g.nativeReview,"pending");
  assert.equal(g.published,false);
  assert.equal(g.sourceChecked,"2026-10-29");
 }
});
test("CONTENT01 editorial-only route fails closed in production and absent environment",()=>{
 assert.equal(guideEditorialPreviewAllowed({}),false);
 const allowed={AVOFIS_EDITORIAL_GUIDE_PREVIEW:"true",AVOFIS_EDITORIAL_REVIEW_MODE:"unapproved",
  AVOFIS_LEGAL_READY:"false",VERCEL_ENV:"preview"};
 assert.equal(guideEditorialPreviewAllowed(allowed),true);
 for(const patch of [
  {VERCEL_ENV:"production"},
  {VERCEL_ENV:""},
  {AVOFIS_EDITORIAL_GUIDE_PREVIEW:"false"},
  {AVOFIS_EDITORIAL_REVIEW_MODE:"approved"},
  {AVOFIS_LEGAL_READY:"true"}
 ])assert.equal(guideEditorialPreviewAllowed({...allowed,...patch}),false,JSON.stringify(patch));
});
test("CONTENT01 editor route contains no optimistic publish or official submission action",()=>{
 const html=readFileSync(new URL("../src/app/bilgi/rehberler/page.tsx",import.meta.url),"utf8");
 assert.match(html,/notFound\(\)/);
 assert.match(html,/robots:\{index:false,follow:false\}/);
 assert.match(html,/gidsen/);
 assert.doesNotMatch(html,/submitted|officialSubmission:true|paymentEnabled:true/);
});
