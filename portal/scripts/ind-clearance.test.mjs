import test from "node:test";
import assert from "node:assert/strict";
import {indProcedureIds,evaluateINDAdmission} from "../src/lib/ind-admission.ts";
const valid=(procedure="ind_objection")=>({
 procedure,
 person:{fullName:"Test Employee",roleDescription:"Juridisch medewerker",workRightVerified:true,professionalAuthorityVerified:true},
 timing:{notifiedOrFiledOn:"2026-10-29",deadlineReviewed:true,deadlineBasis:"Human-confirmed official case route",stayConsequencesReviewed:true,asylumPrePost12June2026Reviewed:true},
 representation:{requested:true,signedSpecialMandate:true,procedureSpecificINDFormReviewed:true,serviceAgreementSigned:true},
 privacy:{legalBasisReviewed:true,secureDocumentChannelVerified:true,disclosureAndRetentionReviewed:true},
 specialist:{credentialVerified:true,specialistIdentity:"Independent qualified specialist"},
 humanApproval:{approved:true,reviewerId:"independent-reviewer"}
});
test("eight distinct IND processes require recorded human G1–G4 approval",()=>{
 assert.equal(indProcedureIds.length,8);
 assert.equal(new Set(indProcedureIds).size,8);
 for(const p of indProcedureIds){
  const a=evaluateINDAdmission(valid(p));
  assert.deepEqual(a.issues,[],p);
  assert.equal(a.canActivate,true,p);
  assert.equal(a.filingNotAuthorisedByThisCheck,true);
 }
});
test("approval fails closed for each of four gates",()=>{
 const cases=[
  [r=>{r.person.workRightVerified=false},"PERSON_UNVERIFIED"],
  [r=>{r.timing.deadlineReviewed=false},"DEADLINE_UNREVIEWED"],
  [r=>{r.representation.signedSpecialMandate=false},"MANDATE_MISSING"],
  [r=>{r.representation.serviceAgreementSigned=false},"AGREEMENT_MISSING"],
  [r=>{r.privacy.secureDocumentChannelVerified=false},"PRIVACY_UNVERIFIED"],
  [r=>{r.humanApproval.approved=false},"HUMAN_APPROVAL_MISSING"],
 ];
 for(const [change,issue] of cases){
  const r=valid();
  change(r);
  const a=evaluateINDAdmission(r);
  assert.equal(a.canActivate,false,issue);
  assert.ok(a.issues.includes(issue),issue);
 }
});
test("asylum needs transition-law review and verified independent expert",()=>{
 const r=valid("asylum");
 r.timing.asylumPrePost12June2026Reviewed=false;
 r.specialist.credentialVerified=false;
 const a=evaluateINDAdmission(r);
 assert.equal(a.canActivate,false);
 assert.equal(a.reviewOnly,true);
 assert.ok(a.issues.includes("ASYLUM_REGIME_UNREVIEWED"));
 assert.ok(a.issues.includes("SPECIALIST_REQUIRED"));
});
test("detention and removal cannot proceed without verified expert",()=>{
 const r=valid("detention_or_removal");
 r.specialist.specialistIdentity="";
 assert.equal(evaluateINDAdmission(r).canActivate,false);
});
test("IND file copy request requires its own IND form review",()=>{
 const r=valid("ind_file_request");
 r.representation.procedureSpecificINDFormReviewed=false;
 assert.ok(evaluateINDAdmission(r).issues.includes("IND_FORM_UNREVIEWED"));
});
test("unknown procedure and missing mandate never activate",()=>{
 const r=valid("unspecified");
 r.representation.signedSpecialMandate=false;
 assert.equal(evaluateINDAdmission(r).canActivate,false);
 assert.ok(evaluateINDAdmission(r).issues.includes("IND_PROCEDURE_UNKNOWN"));
});

test("IND-T01: written mandate cannot replace proof of work authority",()=>{
 const x=valid("ind_objection");
 x.person.workRightVerified=false;
 const result=evaluateINDAdmission(x);
 assert.equal(result.canActivate,false);
 assert.ok(result.issues.includes("PERSON_UNVERIFIED"));
});
test("IND-T05: higher appeal without source-verified deadline or expert stays on hold",()=>{
 const x=valid("higher_appeal");
 x.timing.deadlineBasis="";
 x.specialist.credentialVerified=false;
 const result=evaluateINDAdmission(x);
 assert.equal(result.canActivate,false);
 assert.ok(result.issues.includes("DEADLINE_UNREVIEWED"));
 assert.ok(result.issues.includes("SPECIALIST_REQUIRED"));
});
test("IND-T08: missing cross-border/GDPR review cannot authorise action",()=>{
 const x=valid("ind_objection");
 x.privacy.disclosureAndRetentionReviewed=false;
 const result=evaluateINDAdmission(x);
 assert.equal(result.canActivate,false);
 assert.ok(result.issues.includes("PRIVACY_UNVERIFIED"));
});
test("IND-T10: detention/removal without independent expert is blocked",()=>{
 const x=valid("detention_or_removal");
 x.specialist.credentialVerified=false;
 const result=evaluateINDAdmission(x);
 assert.equal(result.canActivate,false);
 assert.ok(result.issues.includes("SPECIALIST_REQUIRED"));
});
test("IND-T11: general contract is not IND file-request form approval",()=>{
 const x=valid("ind_file_request");
 x.representation.procedureSpecificINDFormReviewed=false;
 x.representation.serviceAgreementSigned=true;
 const result=evaluateINDAdmission(x);
 assert.equal(result.canActivate,false);
 assert.ok(result.issues.includes("IND_FORM_UNREVIEWED"));
});
test("IND-T06/T07: admission check never grants delegated personal asylum filing or advocate portal access",()=>{
 const x=valid("asylum");
 const result=evaluateINDAdmission(x);
 assert.equal(result.filingNotAuthorisedByThisCheck,true);
 assert.equal(result.reviewOnly,true);
 // This is a domain flag only: no authenticated IND/advocaat portal E2E asserted.
});
