import test from "node:test";
import assert from "node:assert/strict";
import {parseCreateDraft,parsePatchDraft,documentDraftStageEnabled} from "../src/lib/document-draft-contract.ts";
import {newPreparation} from "../src/lib/document-preparation.ts";
const id="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa";
const draft=newPreparation("konut-kira-sigorta","ar");
const stage={
 AVOFIS_DOCUMENT_DRAFT_STAGING_ENABLED:"true",AVOFIS_DOCUMENT_DRAFT_ENV:"staging",
 AVOFIS_DOCUMENT_DRAFT_STAGING_PROJECT_REF:"syntheticstage123",
 AVOFIS_PRODUCTION_SUPABASE_PROJECT_REF:"syntheticprod456",
 NEXT_PUBLIC_SUPABASE_URL:"https://syntheticstage123.supabase.co",VERCEL_ENV:"preview"
};
test("FORM02 rejects production target and any inactive or misconfigured staging switch",()=>{
 assert.equal(documentDraftStageEnabled(stage),true);
 for(const bad of [
  {AVOFIS_DOCUMENT_DRAFT_STAGING_ENABLED:"false"},
  {AVOFIS_DOCUMENT_DRAFT_ENV:"production"},
  {AVOFIS_DOCUMENT_DRAFT_STAGING_PROJECT_REF:"syntheticprod456",NEXT_PUBLIC_SUPABASE_URL:"https://syntheticprod456.supabase.co"},
  {AVOFIS_PRODUCTION_SUPABASE_PROJECT_REF:""},
  {NEXT_PUBLIC_SUPABASE_URL:"http://syntheticstage123.supabase.co"},
  {NEXT_PUBLIC_SUPABASE_URL:"https://syntheticstage123.supabase.co.evil.invalid"},
  {NEXT_PUBLIC_SUPABASE_URL:"https://syntheticstage123.supabase.co:8443"},
  {NEXT_PUBLIC_SUPABASE_URL:"https://user:pw@syntheticstage123.supabase.co"},
  {VERCEL_ENV:"production"}
 ])assert.equal(documentDraftStageEnabled({...stage,...bad}),false,JSON.stringify(bad));
});
test("FORM02 strict create request rejects role/approval spoofing and invalid schema",()=>{
 assert.deepEqual(parseCreateDraft({draft,case_id:null}),{draft,case_id:null});
 assert.equal(parseCreateDraft({draft,case_id:id})?.case_id,id);
 for(const bad of [
  {draft,case_id:null,owner_user_id:id},{draft,case_id:null,status:"submitted"},
  {draft,case_id:"bad"},{draft,case_id:"bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb"},
  {draft:{...draft,locale:"es"},case_id:null},
  {draft:{...draft,chronology:"z".repeat(4001)},case_id:null},
  {draft:{...draft,secret:"extra"},case_id:null},
  {draft,case_id:undefined},null,[]
 ])assert.equal(parseCreateDraft(bad),null);
});
test("FORM02 revision and consent are mandatory, official states disallowed",()=>{
 const good={id,revision:3,draft,status:"draft",consent_to_staff:false};
 assert.equal(parsePatchDraft(good)?.revision,3);
 assert.equal(parsePatchDraft({...good,status:"review_requested",consent_to_staff:true})?.status,"review_requested");
 assert.equal(parsePatchDraft({...good,status:"withdrawn",consent_to_staff:false})?.status,"withdrawn");
 for(const bad of [
  {...good,revision:0},{...good,revision:-1},{...good,revision:1.5},
  {...good,revision:NaN},{...good,revision:1e9},{...good,id:"x"},
  {...good,status:"filed"},{...good,status:"review_requested"},
  {...good,consent_to_staff:"true"},{...good,status:"withdrawn",consent_to_staff:true},{...good,reviewer_user_id:id},
  {...good,draft:{...draft,service:"does-not-exist"}}
 ])assert.equal(parsePatchDraft(bad),null);
});

test("production document storage remains denied until correct project and security gates",()=>{
 const ref="verifiedproduction001";
 const enabled={
  VERCEL_ENV:"production",AVOFIS_DOCUMENT_DRAFT_ENV:"production",
  AVOFIS_PRODUCTION_SUPABASE_PROJECT_REF:ref,
  AVOFIS_DOCUMENT_DRAFT_STAGING_PROJECT_REF:"separatestaging001",
  AVOFIS_DOCUMENT_DRAFT_PRODUCTION_ENABLED:"true",
  AVOFIS_DOCUMENT_DRAFT_SECURITY_REVIEWED:"true",
  NEXT_PUBLIC_SUPABASE_URL:"https://"+ref+".supabase.co"
 };
 assert.equal(documentDraftStageEnabled(enabled),true);
 for(const bad of [
  {AVOFIS_DOCUMENT_DRAFT_PRODUCTION_ENABLED:"false"},
  {AVOFIS_DOCUMENT_DRAFT_SECURITY_REVIEWED:"false"},
  {VERCEL_ENV:"preview"},
  {AVOFIS_DOCUMENT_DRAFT_STAGING_PROJECT_REF:ref},
  {NEXT_PUBLIC_SUPABASE_URL:"https://"+ref+".supabase.co.evil.invalid"},
  {NEXT_PUBLIC_SUPABASE_URL:"https://"+ref+".supabase.co/private"},
  {AVOFIS_PRODUCTION_SUPABASE_PROJECT_REF:""}
 ])assert.equal(documentDraftStageEnabled({...enabled,...bad}),false);
});
