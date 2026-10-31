/**
 * Digital Justice: no official case transmission without verified external
 * identity, professional scope, human dual signoff, and provider receipt.
 * Independent of IND G1-G4 (never inferred from court permissions).
 */
export const officialCourtConnectionEnabled=false;
export const providerAccepted=false;
export const myRechtspraakCredentialCollectionAllowed=false;
export const indConnected=false;
export const asielOrDetentionViaAansluitpunt=false;
export type ExternalCaseFamily="civil"|"general_administrative"|"tax"|"commercial"|"family"|"asylum"|"detention"|"ind_objection"|"ind_residence"|"unknown";
export type ExternalReview={
 family:ExternalCaseFamily;
 verifiedProfessional:boolean;
 jurisdictionVerified:boolean;
 writtenMandateVerified:boolean;
 g1ToG4IfInd:boolean;
 reviewerOne:boolean;
 reviewerTwo:boolean;
 independentReviewers:boolean;
 providerAccreditation:boolean;
 verifiedProviderReceipt:boolean;
};
export function evaluateOfficialExchange(review:ExternalReview){
 const excluded=review.family==="asylum"||review.family==="detention"||review.family.startsWith("ind_")||review.family==="unknown";
 const allowed=officialCourtConnectionEnabled&&providerAccepted&&!excluded&&
  review.verifiedProfessional&&review.jurisdictionVerified&&review.writtenMandateVerified&&
  review.reviewerOne&&review.reviewerTwo&&review.independentReviewers&&
  review.providerAccreditation;
 // Even an allowed future API call is only "submitted" after official receipt.
 return {
  canTransmit:allowed,
  canMarkSubmitted:allowed&&review.verifiedProviderReceipt,
  canImpersonatePortalUser:false,
  canCollectDigiDOrAdvocatenpas:false,
  canShareIndData:false,
  externalStatus:allowed&&review.verifiedProviderReceipt?"PROVIDER_RECEIPT_VERIFIED":"NOT_SUBMITTED" as "NOT_SUBMITTED"|"PROVIDER_RECEIPT_VERIFIED"
 };
}
