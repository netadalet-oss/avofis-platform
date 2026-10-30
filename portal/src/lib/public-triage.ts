/**
 * AVOfis v17 T09 — minimal, non-identifying PUBLIC triage.
 *
 * Advisory navigation only. Never accepts name, email, documents, case facts,
 * case numbers, notice dates or identification numbers. No legal deadline
 * calculation, automatic eligibility ruling, legal representation, referral
 * booking, client intake or payment is authorised by this function.
 */
export const countries=["nl","de","tr","other","unknown"] as const;
export const topics=[
 "document","administrative_objection","court_procedure","asylum",
 "detention_or_removal","residence","family","work","housing",
 "debt","business","unknown"
] as const;
export const personRoles=["self","relative","employer","organisation","representative","unknown"] as const;
export const counterpartyTypes=["person","employer","authority","company","other","unknown"] as const;
// These represent the requested *orientation*, never an order, booking, agreement or fee.
export const requestTypes=["general_information","brief_consultation","document_review","detailed_case_analysis","unknown"] as const;
export const noticeCategories=["no_notice","notice_received","not_sure"] as const;
export const timeBands=["less_than_48h","within_7d","later","unknown"] as const;
export type TriageInput={
 country:string;topic:string;personRole:string;
 counterpartyType:string;requestType:string;
 noticeCategory:string;timeBand:string;
 immediateHarm:boolean; professionalNeeded:boolean;
};
export type TriageResult={
 disposition:"URGENT_SPECIALIST"|"SPECIALIST_REVIEW"|"OFFICIAL_INFORMATION"|"GENERAL_INFORMATION";
 mayCreateClientRecord:false;
 maySubmitOfficialAction:false;
 mayAcceptPayment:false;
 mayUploadDocuments:false;
 mayShareWithExpert:false;
 mayCollectPersonalData:false;
 deadlineCalculated:false;
 onlyGenericInformation:true;
 issues:string[];
 officialSource:string|null;
};
const inSet=(item:string,allowed:readonly string[])=>allowed.includes(item);
const allowedInputKeys=new Set([
 "country","topic","personRole","counterpartyType","requestType",
 "noticeCategory","timeBand","immediateHarm","professionalNeeded"
]);
const sources:Record<string,string>={
 nl:"https://www.rechtspraak.nl/",
 de:"https://e-justice.europa.eu/",
 tr:"https://www.turkiye.gov.tr/"
};
export function evaluatePublicTriage(input:TriageInput):TriageResult{
 const issues:string[]=[];
 // Runtime fail-closed: an accidental public PII field must not be silently accepted.
 if(!input||typeof input!=="object"||Object.keys(input).some(k=>!allowedInputKeys.has(k))||
    !inSet(input.country,countries)||
    !inSet(input.topic,topics)||
    !inSet(input.personRole,personRoles)||
    !inSet(input.counterpartyType,counterpartyTypes)||
    !inSet(input.requestType,requestTypes)||
    !inSet(input.noticeCategory,noticeCategories)||
    !inSet(input.timeBand,timeBands)||
    typeof input.immediateHarm!=="boolean"||
    typeof input.professionalNeeded!=="boolean"){
  return {disposition:"SPECIALIST_REVIEW",issues:["INVALID_OR_UNKNOWN_INPUT"],
   officialSource:null,mayCreateClientRecord:false,maySubmitOfficialAction:false,
   mayAcceptPayment:false,mayUploadDocuments:false,
   mayShareWithExpert:false,mayCollectPersonalData:false,
   deadlineCalculated:false,onlyGenericInformation:true};
 }
 if(input.country==="unknown"||input.country==="other")issues.push("JURISDICTION_UNVERIFIED");
 if(input.personRole!=="self")issues.push("ROLE_OR_MANDATE_REQUIRES_REVIEW");
 if(input.counterpartyType==="unknown"||input.counterpartyType==="other")
  issues.push("COUNTERPARTY_CATEGORY_REQUIRES_REVIEW");
 if(input.requestType==="unknown")issues.push("REQUEST_TYPE_REQUIRES_REVIEW");
 if(!["general_information","unknown"].includes(input.requestType))
  issues.push("PAID_OR_PERSONALISED_SERVICE_REQUIRES_SEPARATE_HUMAN_CONTRACT_REVIEW");
 if(input.topic==="unknown")issues.push("PROCEDURE_UNVERIFIED");
 if(input.noticeCategory==="notice_received"||input.noticeCategory==="not_sure")
  issues.push("NOTICE_AND_SERVICE_DATE_REQUIRES_HUMAN_REVIEW");
 if(input.noticeCategory!=="no_notice"&&input.timeBand==="unknown")
  issues.push("DEADLINE_UNVERIFIED");
 // A week is the user\'s estimate, not a computed legal deadline.
 // Even without a notice, do not offer a generic-only path when time is close.
 if(input.timeBand==="within_7d")issues.push("SELF_REPORTED_NEAR_TERM_REQUIRES_HUMAN_REVIEW");
 if(input.topic==="asylum")issues.push("ASYLUM_TRANSITION_AND_PERSONAL_FILING_REVIEW");
 if(input.topic==="court_procedure")issues.push("COURT_PROFESSIONAL_SCOPE_REVIEW");
 if(input.topic==="detention_or_removal")issues.push("URGENT_DETENTION_REMOVAL_ROUTE");
 if(input.professionalNeeded)issues.push("INDEPENDENT_PROFESSIONAL_REQUIRED");
 // A 48-hour selection is a person's own statement, never a calculated deadline.
 const urgent=input.immediateHarm||input.topic==="detention_or_removal"||
              input.timeBand==="less_than_48h";
 const specialist=urgent||input.timeBand==="within_7d"||
      ["asylum","court_procedure","administrative_objection","residence"].includes(input.topic)||
      input.professionalNeeded||input.requestType!=="general_information"||
      issues.some(x=>["JURISDICTION_UNVERIFIED","ROLE_OR_MANDATE_REQUIRES_REVIEW",
       "COUNTERPARTY_CATEGORY_REQUIRES_REVIEW",
       "PROCEDURE_UNVERIFIED","NOTICE_AND_SERVICE_DATE_REQUIRES_HUMAN_REVIEW",
       "DEADLINE_UNVERIFIED"].includes(x));
 if(urgent)issues.push("SEEK_PROMPT_HUMAN_SPECIALIST_OR_OFFICIAL_CHANNEL");
 const disposition:TriageResult["disposition"]=urgent?"URGENT_SPECIALIST":
  specialist?"SPECIALIST_REVIEW":
  ["nl","de","tr"].includes(input.country)?"OFFICIAL_INFORMATION":"GENERAL_INFORMATION";
 const officialSource=input.country==="nl" &&
  ["asylum","residence","detention_or_removal"].includes(input.topic)?
  "https://ind.nl/":sources[input.country]||null;
 return {disposition,issues,officialSource,
  mayCreateClientRecord:false,maySubmitOfficialAction:false,
  mayAcceptPayment:false,mayUploadDocuments:false,
  mayShareWithExpert:false,mayCollectPersonalData:false,
  deadlineCalculated:false,onlyGenericInformation:true};
}
