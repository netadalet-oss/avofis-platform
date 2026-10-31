/**
 * J07/J09/J10: case metadata and manual event workflow, entirely local and
 * synthetic in preview. NOT a replacement for server RLS or official receipts.
 * IND asylum and detention remain separate under G1-G4.
 */
export type CourtProcedure="civil"|"general_administrative"|"commercial"|"family"|"tax"|"asylum"|"detention"|"ind";
export type RecordedEventKind="DRAFT_PREPARED"|"OFFICIAL_PORTAL_OPENED"|"DOCUMENT_PREPARED"|
 "UNVERIFIED_RECEIPT_REPORTED"|"RECEIPT_VERIFIED_INDEPENDENTLY"|"COURT_DECISION_REFERENCED";
export type TrackedCourtCase={
 id:string;synthetic:true;country:"NL";court:string;procedure:CourtProcedure;
 officialCaseNumber:string|null;ecli:string|null;
 clientIdentityReference:string|null;
 assignedProfessional:string|null;
 mandateVerified:boolean;
 courtSubmissionStatus:"NOT_SUBMITTED"|"RECEIPT_VERIFIED";
 deadlineBasis:"NOT_REVIEWED"|"HUMAN_REVIEW_REQUIRED"|"HUMAN_VERIFIED";
};
export type CourtEvent={kind:RecordedEventKind;actorRole:"client"|"assigned_staff"|"verified_professional"|"independent_reviewer";
 when:string;reference:string|null;source:"local"|"official_portal"};
export const syntheticCase:TrackedCourtCase={
 id:"SYNTHETIC-NL-2026-001",synthetic:true,country:"NL",
 court:"Rechtbank (voorbeeld, geen werkelijke zaak)",procedure:"general_administrative",
 officialCaseNumber:null,ecli:null,clientIdentityReference:null,assignedProfessional:null,
 mandateVerified:false,courtSubmissionStatus:"NOT_SUBMITTED",
 deadlineBasis:"HUMAN_REVIEW_REQUIRED"
};
export const safeDemoEvents:CourtEvent[]=[
 {kind:"DRAFT_PREPARED",actorRole:"assigned_staff",when:"2026-10-29",reference:null,source:"local"},
 {kind:"OFFICIAL_PORTAL_OPENED",actorRole:"assigned_staff",when:"2026-10-29",reference:null,source:"local"},
 {kind:"DOCUMENT_PREPARED",actorRole:"assigned_staff",when:"2026-10-29",reference:null,source:"local"}
];
export function auditCourtEvent(
 item:TrackedCourtCase,event:CourtEvent,ctx:{
 verifiedProfessional:boolean;procedureAuthorityVerified:boolean;independentReviewer:boolean;
 officialReceiptAuthenticityVerified:boolean;indG1ToG4:boolean
 }){
 const restricted=["asylum","detention","ind"].includes(item.procedure);
 const issues:string[]=[];
 if(!item.synthetic && !ctx.verifiedProfessional)issues.push("PROFESSIONAL_NOT_VERIFIED");
 if(restricted)issues.push("SPECIAL_IND_OR_ASYLUM_PROCEDURE");
 if(event.kind==="RECEIPT_VERIFIED_INDEPENDENTLY"){
  if(!ctx.verifiedProfessional||!ctx.independentReviewer||!ctx.procedureAuthorityVerified||
    !item.mandateVerified||!ctx.officialReceiptAuthenticityVerified||
    !event.reference||event.source!=="official_portal"||
    event.actorRole!=="independent_reviewer") issues.push("OFFICIAL_RECEIPT_NOT_PROVEN");
 }
 // This is merely an in-memory reviewer model: no self-attested event is proof
 // that a real court received documents. Official connections remain disabled.
 const accepted=issues.length===0;
 const canMarkOfficiallySubmitted=false;
 return {accepted,issues,canMarkOfficiallySubmitted,willSendToCourt:false,
  status:"NOT_SUBMITTED" as const};
}
