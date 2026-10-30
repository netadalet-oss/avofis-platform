import test from "node:test";
import assert from "node:assert/strict";
import {indProcedureIds,evaluateINDAdmission} from "../src/lib/ind-admission.ts";
const actionMap={ind_objection:"submit_objection",ind_file_request:"request_file_copy",
 court_appeal:"court_appeal",higher_appeal:"higher_appeal"};
const valid=(procedure="ind_objection")=>({
 procedure,
 person:{fullName:"Test Employee",roleDescription:"Juridisch medewerker",workRightVerified:true,professionalAuthorityVerified:true},
 timing:{notifiedOrFiledOn:"2026-10-29",deadlineReviewed:true,deadlineBasis:"Human-confirmed official case route",stayConsequencesReviewed:true,asylumPrePost12June2026Reviewed:true,
  asylumApplicationDate:"2026-06-12",asylumTransitionRegime:"from_2026_06_12",
  asylumTransitionSourceReference:"https://ind.nl/nl/asiel-en-nareis",asylumTransitionExpertReviewed:true},
 representation:{requested:!!actionMap[procedure],signedSpecialMandate:true,procedureSpecificINDFormReviewed:true,serviceAgreementSigned:true,
  requestedAction:actionMap[procedure]||"review_only",
  mandateAuthorisedActions:actionMap[procedure]?[actionMap[procedure]]:[],
  mandateExcludedActions:[],mandateScopeReviewed:true,
  principalIdentityVerified:true,principalSignatureVerified:true,
  mandateSignedOn:"2026-10-15",mandateValidUntil:"2099-12-31",
  mandateDocumentSHA256:"a".repeat(64)},
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

test("IND-T02: file-copy mandate cannot authorise objection",()=>{
 const x=valid("ind_objection");
 x.representation.mandateAuthorisedActions=["request_file_copy"];
 const y=evaluateINDAdmission(x);
 assert.equal(y.canActivate,false);
 assert.ok(y.issues.includes("MANDATE_SCOPE_MISMATCH"));
});
test("IND-T02: explicit mandate exclusion overrides otherwise matching scope",()=>{
 const x=valid("ind_objection");
 x.representation.mandateExcludedActions=["submit_objection"];
 assert.ok(evaluateINDAdmission(x).issues.includes("MANDATE_SCOPE_MISMATCH"));
});
test("IND-T02: missing signed evidence hash fails closed",()=>{
 const x=valid("ind_objection");
 x.representation.mandateDocumentSHA256="";
 assert.ok(evaluateINDAdmission(x).issues.includes("MANDATE_EVIDENCE_MISSING"));
});
test("IND-T04: 11 and 12 June 2026 require distinct asylum regimes",()=>{
 const before=valid("asylum");
 before.timing.asylumApplicationDate="2026-06-11";
 before.timing.asylumTransitionRegime="before_2026_06_12";
 const on=valid("asylum");
 on.timing.asylumApplicationDate="2026-06-12";
 on.timing.asylumTransitionRegime="from_2026_06_12";
 assert.equal(evaluateINDAdmission(before).canActivate,true);
 assert.equal(evaluateINDAdmission(on).canActivate,true);
 const wrong=valid("asylum");
 wrong.timing.asylumApplicationDate="2026-06-11";
 assert.ok(evaluateINDAdmission(wrong).issues.includes("ASYLUM_REGIME_MISMATCH"));
});
test("IND-T04: regime without official source and independent expert stays on hold",()=>{
 const x=valid("asylum");
 x.timing.asylumTransitionSourceReference="";
 x.timing.asylumTransitionExpertReviewed=false;
 assert.equal(evaluateINDAdmission(x).canActivate,false);
 assert.ok(evaluateINDAdmission(x).issues.includes("ASYLUM_SOURCE_REVIEW_MISSING"));
});
test("IND-T06: initial asylum registration must never be delegated",()=>{
 const x=valid("asylum");
 x.representation.requestedAction="initial_asylum_registration";
 x.representation.requested=true;
 assert.ok(evaluateINDAdmission(x).issues.includes("PERSONAL_ASYLUM_FILING_BLOCKED"));
});
