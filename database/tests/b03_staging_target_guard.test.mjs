import test from "node:test";
import assert from "node:assert/strict";
import {checkStagingTarget} from "../ops/b03_staging_target_guard.mjs";
const prod="akigckpsktdxudumiwvm";
const stage="qwertyuiopasdfghjklz";
const good={
 AVOFIS_DATABASE_TARGET_ENV:"staging",
 AVOFIS_PRODUCTION_SUPABASE_PROJECT_REF:prod,
 AVOFIS_STAGING_SUPABASE_PROJECT_REF:stage,
 AVOFIS_STAGING_SUPABASE_URL:"https://"+stage+".supabase.co"
};
test("B03: distinct synthetically configured staging target is only a string-shape check",()=>{
 const r=checkStagingTarget(good);
 assert.equal(r.configured,true);
 assert.equal(r.code,"STAGING_TARGET_SHAPE_OK");
 assert.equal(r.productionReleaseAuthorized,false);
 assert.equal(r.realAuthStorageE2E,false);
});
test("B03: no staging config or production project target must always fail closed",()=>{
 assert.equal(checkStagingTarget({}).code,"STAGING_MODE_REQUIRED");
 assert.equal(checkStagingTarget({...good,AVOFIS_DATABASE_TARGET_ENV:"production"}).configured,false);
 assert.equal(checkStagingTarget({...good,AVOFIS_PRODUCTION_SUPABASE_PROJECT_REF:""}).code,"PRODUCTION_REF_REQUIRED");
 assert.equal(checkStagingTarget({...good,AVOFIS_STAGING_SUPABASE_PROJECT_REF:""}).code,"STAGING_REF_REQUIRED");
 assert.equal(checkStagingTarget({...good,
  AVOFIS_STAGING_SUPABASE_PROJECT_REF:prod,
  AVOFIS_STAGING_SUPABASE_URL:"https://"+prod+".supabase.co"}).code,
   "LIVE_PROJECT_TARGET_REFUSED");
});
test("B03: URL host boundaries disallow aliases, credentials, queries and explicit ports",()=>{
 const mismatches=[
  "http://"+stage+".supabase.co",
  "https://"+prod+".supabase.co",
  "https://"+stage+".supabase.co.evil.test",
  "https://user:pass@"+stage+".supabase.co",
  "https://"+stage+".supabase.co:8443",
  "https://"+stage+".supabase.co:443",
  "https://"+stage+".supabase.co/storage",
  "https://"+stage+".supabase.co/?key=secret",
  "https://"+stage+".supabase.co/#fragment"
 ];
 for(const url of mismatches){
  const r=checkStagingTarget({...good,AVOFIS_STAGING_SUPABASE_URL:url});
  assert.equal(r.code,"STAGING_URL_MISMATCH",url);
  assert.equal(r.productionReleaseAuthorized,false);
 }
});
