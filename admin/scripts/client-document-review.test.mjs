import test from "node:test";
import assert from "node:assert/strict";
import {documentReviewEnabled,documentReviewUUID,parseReviewNote} from "../src/lib/client-document-review.ts";
const ref="verifiedproduction001";
const production={
 VERCEL_ENV:"production",AVOFIS_DOCUMENT_DRAFT_ENV:"production",
 AVOFIS_PRODUCTION_SUPABASE_PROJECT_REF:ref,
 AVOFIS_DOCUMENT_DRAFT_STAGING_PROJECT_REF:"separatestaging001",
 AVOFIS_DOCUMENT_DRAFT_PRODUCTION_ENABLED:"true",
 AVOFIS_DOCUMENT_DRAFT_SECURITY_REVIEWED:"true",
 AVOFIS_STAFF_DOCUMENT_REVIEW_ENABLED:"true",
 NEXT_PUBLIC_SUPABASE_URL:"https://"+ref+".supabase.co"
};
test("production account review requires exact approved project and independent switches",()=>{
 assert.equal(documentReviewEnabled(production),true);
 for(const bad of [
  {AVOFIS_DOCUMENT_DRAFT_SECURITY_REVIEWED:"false"},
  {AVOFIS_DOCUMENT_DRAFT_PRODUCTION_ENABLED:"false"},
  {AVOFIS_STAFF_DOCUMENT_REVIEW_ENABLED:"false"},
  {VERCEL_ENV:"preview"},
  {AVOFIS_DOCUMENT_DRAFT_STAGING_PROJECT_REF:ref},
  {NEXT_PUBLIC_SUPABASE_URL:"https://"+ref+".supabase.co.attacker.invalid"},
  {NEXT_PUBLIC_SUPABASE_URL:"http://"+ref+".supabase.co"},
  {NEXT_PUBLIC_SUPABASE_URL:"https://"+ref+".supabase.co:8080"},
  {NEXT_PUBLIC_SUPABASE_URL:"https://"+ref+".supabase.co/secret"},
  {AVOFIS_PRODUCTION_SUPABASE_PROJECT_REF:""}
 ])assert.equal(documentReviewEnabled({...production,...bad}),false,JSON.stringify(bad));
 assert.equal(documentReviewEnabled({}),false);
});
test("staff review notes require strict identifiers, content bounds and no role spoof",()=>{
 const draft_id="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
 assert.equal(documentReviewUUID(draft_id),true);
 assert.deepEqual(parseReviewNote({draft_id,note:"  Kaynağı doğrulayın.  "}),
  {draft_id,note:"Kaynağı doğrulayın."});
 for(const v of [
  {draft_id,note:"a"},{draft_id,note:"x".repeat(2501)},
  {draft_id,note:"okay",owner_user_id:draft_id},
  {draft_id,note:"okay",approval:true},{draft_id,note:"okay",submit:true},
  {draft_id:"invalid",note:"okay"},{draft_id,note:123},
  {draft_id,note:"good\u0000bad"},null,[],{}
 ])assert.equal(parseReviewNote(v),null);
});
