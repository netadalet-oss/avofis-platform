import test from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import {documentCategories,preUploadWarning,evaluateDocumentPreparation}
 from "../src/lib/document-preparation-gate.ts";
import {POST} from "../src/app/api/document-upload/route.ts";
const valid=()=>({category:"contract",redactionWarningRead:true,privateChannelRequested:false});
test("L4 R-397: public first-contact document upload is always denied",async()=>{
 for(const env of [undefined,"true","false"]){
  const before=process.env.NEXT_PUBLIC_AVOFIS_INTAKE_ENABLED;
  if(env===undefined)delete process.env.NEXT_PUBLIC_AVOFIS_INTAKE_ENABLED;
  else process.env.NEXT_PUBLIC_AVOFIS_INTAKE_ENABLED=env;
  try{
   const res=POST();
   assert.equal(res.status,403);
   assert.equal(res.headers.get("cache-control"),"no-store, max-age=0");
   assert.equal(res.headers.get("x-content-type-options"),"nosniff");
   assert.deepEqual(await res.json(),{
    error:"DOCUMENT_UPLOAD_NOT_RELEASED",accepted:false,
    storageWrite:false,independentSecurityApproval:false
   });
  }finally{
   if(before===undefined)delete process.env.NEXT_PUBLIC_AVOFIS_INTAKE_ENABLED;
   else process.env.NEXT_PUBLIC_AVOFIS_INTAKE_ENABLED=before;
  }
 }
});
test("L4 R-399: pre-upload warning explicitly names sensitive ID and health-data reduction",()=>{
 for(const language of ["tr","nl","en"]){
  assert.ok(preUploadWarning[language].length>110);
 }
 assert.match(preUploadWarning.tr,/BSN/);
 assert.match(preUploadWarning.tr,/kimlik/);
 assert.match(preUploadWarning.tr,/sağlık/);
 assert.match(preUploadWarning.nl,/BSN/);
 assert.match(preUploadWarning.en,/health/);
});
test("L4 R-400: seven stable document categories, only labels not sensitive data",()=>{
 assert.deepEqual([...documentCategories],[
  "event","decision","contract","correspondence","identity","other","unknown"]);
 for(const category of documentCategories){
  const res=evaluateDocumentPreparation({...valid(),category});
  assert.equal(res.category,category);
  assert.deepEqual(res.sourceIds,["R-397","R-399","R-400"]);
  for(const key of ["canUpload","canShare","canCreateSignedUrl","willStoreFile","classificationIsLegalOpinion"])
   assert.equal(res[key],false,key+":"+category);
  assert.equal(res.humanAuthStorageCheckRequired,true);
  assert.equal(res.docxFormatDecision,"OPEN");
  assert.equal(res.displayPreUploadWarning,true);
 }
});
test("L4 R-397/399/400: no checkbox or unknown category can grant private upload",()=>{
 for(const read of [false,true])for(const wanted of [false,true]){
  const out=evaluateDocumentPreparation({
   category:"unknown",redactionWarningRead:read,privateChannelRequested:wanted});
  assert.equal(out.canUpload,false);
  assert.equal(out.canShare,false);
  assert.ok(out.reasons.includes("DOCX_WHITELIST_SOURCE_CONFLICT_STILL_OPEN"));
  assert.ok(out.reasons.includes("AUTHENTICATED_PRIVATE_STORAGE_NOT_INDEPENDENTLY_VERIFIED"));
  assert.ok(out.reasons.includes("MALWARE_SCAN_AND_ACCESS_CONTROL_NOT_INDEPENDENTLY_VERIFIED"));
  assert.ok(out.reasons.includes("DOCUMENT_CATEGORY_REQUIRES_HUMAN_REVIEW"));
  if(!read)assert.ok(out.reasons.includes("REDUCTION_WARNING_NOT_ACKNOWLEDGED"));
  if(wanted)assert.ok(out.reasons.includes("PRIVATE_CHANNEL_NOT_RELEASED"));
 }
});
test("L4 R-400: extra personal fields, null, arrays and invalid category rejected",()=>{
 for(const input of [null,{},[],{...valid(),fileName:"client-sensitive.pdf"},
   {...valid(),category:"exe"},{...valid(),redactionWarningRead:"yes"},
   {...valid(),privateChannelRequested:1},{...valid(),bsn:"SECRET_TEST_SENTINEL"}]){
  assert.throws(()=>evaluateDocumentPreparation(input),/INVALID_PUBLIC_DOCUMENT_PREPARATION/);
 }
});
test("L4: public UI contains no upload control, network/API mutation or real document bytes",()=>{
 const get=p=>readFileSync(fileURLToPath(new URL("../"+p,import.meta.url)),"utf8");
 const page=get("src/app/belge-hazirlik/page.tsx");
 const guard=get("src/lib/document-preparation-gate.ts");
 const route=get("src/app/api/document-upload/route.ts");
 assert.match(page,/documentCategories.map/);
 assert.match(page,/preUploadWarning\[lang\]/);
 assert.match(page,/gizlilik/);
 assert.match(page,/R-398 DOCX/);
 assert.doesNotMatch(page,/<input[^>]*type="file"/);
 assert.doesNotMatch(page,/<form[^>]*action=/);
 for(const code of [page,guard,route]){
  assert.doesNotMatch(code,/\b(fetch|localStorage|sessionStorage|createClient|upload|writeFile|putObject)\s*\(/);
 }
 assert.doesNotMatch(route,/request\.formData\(/);
 assert.doesNotMatch(route,/request\.arrayBuffer\(/);
});
