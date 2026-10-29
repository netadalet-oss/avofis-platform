/**
 * AVOfis IND internal admission gate, based on the 29 October 2026 protocol.
 *
 * IMPORTANT: This is a deterministic domain validator, NOT an authorization boundary.
 * Production case activation must enforce the same conditions in audited Postgres
 * triggers/RLS and an authenticated server action. It must never trust browser input.
 */
export const indProcedureIds = [
  "initial_residence_mvv_family",
  "ind_objection",
  "court_appeal",
  "higher_appeal",
  "asylum",
  "detention_or_removal",
  "ind_file_request",
  "naturalisation",
] as const;
export type INDProcedure = (typeof indProcedureIds)[number];
export type ClearanceIssue =
 | "IND_PROCEDURE_UNKNOWN" | "PERSON_UNVERIFIED" | "DEADLINE_UNREVIEWED"
 | "ASYLUM_REGIME_UNREVIEWED" | "MANDATE_MISSING" | "IND_FORM_UNREVIEWED"
 | "AGREEMENT_MISSING" | "PRIVACY_UNVERIFIED" | "SPECIALIST_REQUIRED"
 | "HUMAN_APPROVAL_MISSING";

export type INDAdmissionReview = {
 procedure: string;
 person: {
  fullName: string;
  roleDescription: string;
  workRightVerified: boolean;
  professionalAuthorityVerified: boolean;
 };
 timing: {
  notifiedOrFiledOn: string;
  deadlineReviewed: boolean;
  deadlineBasis: string;
  stayConsequencesReviewed: boolean;
  asylumPrePost12June2026Reviewed: boolean;
 };
 representation: {
  requested: boolean;
  signedSpecialMandate: boolean;
  procedureSpecificINDFormReviewed: boolean;
  serviceAgreementSigned: boolean;
 };
 privacy: {
  legalBasisReviewed: boolean;
  secureDocumentChannelVerified: boolean;
  disclosureAndRetentionReviewed: boolean;
 };
 specialist: {
  credentialVerified: boolean;
  specialistIdentity: string;
 };
 humanApproval: {
  approved: boolean;
  reviewerId: string;
 };
};
const recognised=(v:string):v is INDProcedure=>
 (indProcedureIds as readonly string[]).includes(v);
const nonempty=(v:string)=>v.trim().length>=3;

export function evaluateINDAdmission(r:INDAdmissionReview):{
  canActivate:boolean;
  issues:ClearanceIssue[];
  reviewOnly:boolean;
  filingNotAuthorisedByThisCheck:true;
 } {
 const issues:ClearanceIssue[]=[];
 if(!recognised(r.procedure))issues.push("IND_PROCEDURE_UNKNOWN");
 if(!nonempty(r.person.fullName) || !nonempty(r.person.roleDescription) ||
    !r.person.workRightVerified || !r.person.professionalAuthorityVerified){
  issues.push("PERSON_UNVERIFIED");
 }
 if(!r.timing.deadlineReviewed || !nonempty(r.timing.deadlineBasis) ||
    !r.timing.stayConsequencesReviewed || !nonempty(r.timing.notifiedOrFiledOn)){
  issues.push("DEADLINE_UNREVIEWED");
 }
 if(r.procedure==="asylum" && !r.timing.asylumPrePost12June2026Reviewed){
  issues.push("ASYLUM_REGIME_UNREVIEWED");
 }
 if(r.representation.requested && !r.representation.signedSpecialMandate){
  issues.push("MANDATE_MISSING");
 }
 // An IND form must be inspected separately for the file-request procedure.
 if(r.procedure==="ind_file_request" &&
    !r.representation.procedureSpecificINDFormReviewed){
  issues.push("IND_FORM_UNREVIEWED");
 }
 if(!r.representation.serviceAgreementSigned)issues.push("AGREEMENT_MISSING");
 if(!r.privacy.legalBasisReviewed || !r.privacy.secureDocumentChannelVerified ||
    !r.privacy.disclosureAndRetentionReviewed)issues.push("PRIVACY_UNVERIFIED");
 // Match the SQL activation guard: judicial appeals also require a verified
 // independent professional. Domain validation alone never grants filing rights.
 const highRisk=["court_appeal","higher_appeal","asylum","detention_or_removal"].includes(r.procedure);
 if(highRisk && (!r.specialist.credentialVerified ||
                !nonempty(r.specialist.specialistIdentity))){
   issues.push("SPECIALIST_REQUIRED");
 }
 if(!r.humanApproval.approved || !nonempty(r.humanApproval.reviewerId)){
  issues.push("HUMAN_APPROVAL_MISSING");
 }
 return {
  canActivate:issues.length===0,
  issues,
  reviewOnly:highRisk,
  // No general private mandate enables filing an initial asylum application
  // on behalf of the applicant or accessing reserved advocate portals.
  filingNotAuthorisedByThisCheck:true,
 };
}
