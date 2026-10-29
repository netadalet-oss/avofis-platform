import {validatePreparation,type PreparationDraft} from "./document-preparation.ts";
export type CreateDraft={draft:PreparationDraft;case_id:string|null};
export type PatchDraft={id:string;revision:number;draft:PreparationDraft;status:"draft"|"review_requested";consent_to_staff:boolean};
const object=(v:unknown):v is Record<string,unknown>=>v!==null&&typeof v==="object"&&!Array.isArray(v);
const keys=(v:Record<string,unknown>,k:string[])=>Object.keys(v).length===k.length&&Object.keys(v).every(x=>k.includes(x));
export const isUUID=(v:unknown):v is string=>typeof v==="string"&&/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(v);
export function parseCreateDraft(v:unknown):CreateDraft|null{
 if(!object(v)||!keys(v,["draft","case_id"]))return null;
 const draft=validatePreparation(v.draft);
 return draft&&(v.case_id===null||isUUID(v.case_id))?{draft,case_id:v.case_id as string|null}:null;
}
export function parsePatchDraft(v:unknown):PatchDraft|null{
 if(!object(v)||!keys(v,["id","revision","draft","status","consent_to_staff"]))return null;
 const draft=validatePreparation(v.draft);
 if(!draft||!isUUID(v.id)||!Number.isSafeInteger(v.revision)||Number(v.revision)<1||Number(v.revision)>1000000||
  !["draft","review_requested"].includes(String(v.status))||typeof v.consent_to_staff!=="boolean"||
  (v.status==="review_requested"&&!v.consent_to_staff))return null;
 return {id:v.id,revision:v.revision as number,draft,status:v.status as PatchDraft["status"],consent_to_staff:v.consent_to_staff};
}
export function documentDraftStageEnabled(e:Record<string,string|undefined>):boolean{
 if(e.AVOFIS_DOCUMENT_DRAFT_STAGING_ENABLED!=="true"||e.AVOFIS_DOCUMENT_DRAFT_ENV!=="staging")return false;
 const ref=e.AVOFIS_DOCUMENT_DRAFT_STAGING_PROJECT_REF;
 if(!ref||!/^[-a-z0-9]{12,32}$/.test(ref)||e.VERCEL_ENV==="production"||
  !e.AVOFIS_PRODUCTION_SUPABASE_PROJECT_REF||ref===e.AVOFIS_PRODUCTION_SUPABASE_PROJECT_REF)return false;
 try{
  const u=new URL(e.NEXT_PUBLIC_SUPABASE_URL||"");
  return u.protocol==="https:"&&u.port===""&&u.pathname==="/"&&u.username===""&&u.password===""&&u.hostname===ref+".supabase.co";
 }catch{return false;}
}
