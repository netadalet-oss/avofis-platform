import type {TriageInput} from "./public-triage.ts";

/**
 * L4 R-346/R-355: strictly local, unsubmitted review of the anonymous choices.
 * Never logs, persists, transmits, opens a client case or calculates any deadline.
 * Dates are not represented as verified service dates or legal conclusions.
 */
export type LocalReview={
  matterCountry:string;
  residenceCountry:string;
  preferredLanguage:string;
  topic:string;
  personRole:string;
  counterpartyType:string;
  requestType:string;
  noticeCategory:string;
  noticeDate:string|null;
  noticeDateStatus:"NOT_APPLICABLE"|"NOT_SUPPLIED"|"SELF_REPORTED_UNVERIFIED"|"INVALID_FORMAT";
  timeBand:string;
  immediateHarm:boolean;
  professionalNeeded:boolean;
  officialActionSubmitted:false;
  clientRecordCreated:false;
  deadlineCalculated:false;
  referenceNumber:null;
  humanVerificationRequired:true;
};
const isoDate=/^(\d{4})-(\d{2})-(\d{2})$/;
export function isValidCalendarDate(value:string):boolean{
  const m=isoDate.exec(value);
  if(!m)return false;
  const year=Number(m[1]),month=Number(m[2]),day=Number(m[3]);
  if(year<1900||year>2100||month<1||month>12||day<1||day>31)return false;
  const d=new Date(Date.UTC(year,month-1,day));
  return d.getUTCFullYear()===year&&d.getUTCMonth()+1===month&&d.getUTCDate()===day;
}
export function buildLocalTriageReview(input:TriageInput,selfReportedNoticeDate:string):LocalReview{
  const noNotice=input.noticeCategory==="no_notice";
  const valid=typeof selfReportedNoticeDate==="string"&&isValidCalendarDate(selfReportedNoticeDate);
  const status:LocalReview["noticeDateStatus"]=noNotice?"NOT_APPLICABLE":
      selfReportedNoticeDate===""?"NOT_SUPPLIED":
      valid?"SELF_REPORTED_UNVERIFIED":"INVALID_FORMAT";
  return {
    matterCountry:input.country,residenceCountry:input.residenceCountry,
    preferredLanguage:input.preferredLanguage,topic:input.topic,
    personRole:input.personRole,counterpartyType:input.counterpartyType,
    requestType:input.requestType,noticeCategory:input.noticeCategory,
    noticeDate:status==="SELF_REPORTED_UNVERIFIED"?selfReportedNoticeDate:null,
    noticeDateStatus:status,timeBand:input.timeBand,
    immediateHarm:input.immediateHarm,professionalNeeded:input.professionalNeeded,
    officialActionSubmitted:false,clientRecordCreated:false,deadlineCalculated:false,
    referenceNumber:null,humanVerificationRequired:true
  };
}
