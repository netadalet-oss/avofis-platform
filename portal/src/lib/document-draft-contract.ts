import {validatePreparation,isPreparationReadyForReview,type PreparationDraft} from "./document-preparation.ts";
export type CreateDraft={draft:PreparationDraft;case_id:string|null};
export type PatchDraft={id:string;revision:number;draft:PreparationDraft;status:"draft"|"review_requested"|"withdrawn";consent_to_staff:boolean};
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
  !["draft","review_requested","withdrawn"].includes(String(v.status))||typeof v.consent_to_staff!=="boolean"||
  (v.status==="review_requested"&&!v.consent_to_staff)||(v.status==="withdrawn"&&v.consent_to_staff)||
  (v.status==="review_requested"&&!isPreparationReadyForReview(draft)))return null;
 return {id:v.id,revision:v.revision as number,draft,status:v.status as PatchDraft["status"],consent_to_staff:v.consent_to_staff};
}
/** Enable real account storage only in its explicitly matched deployment/project.
 * Disabled by default; environment variables are deployment controls, not legal approval.
 * Production must pass a separate pre-launch security review of ALL exposed tables. */
export function documentDraftStageEnabled(e:Record<string,string|undefined>):boolean{
 const ref=e.AVOFIS_DOCUMENT_DRAFT_ENV==="production"?
  e.AVOFIS_PRODUCTION_SUPABASE_PROJECT_REF:e.AVOFIS_DOCUMENT_DRAFT_STAGING_PROJECT_REF;
 if(!ref||!/^[-a-z0-9]{12,32}$/.test(ref))return false;
 try{
  const u=new URL(e.NEXT_PUBLIC_SUPABASE_URL||"");
  if(u.protocol!=="https:"||u.port!==""||u.pathname!=="/"||u.search||u.hash||
     u.username||u.password||u.hostname!==ref+".supabase.co")return false;
 }catch{return false;}
 if(e.AVOFIS_DOCUMENT_DRAFT_ENV==="production")
  return e.VERCEL_ENV==="production"&&
   e.AVOFIS_DOCUMENT_DRAFT_PRODUCTION_ENABLED==="true"&&
   e.AVOFIS_DOCUMENT_DRAFT_SECURITY_REVIEWED==="true"&&
   e.AVOFIS_DOCUMENT_DRAFT_STAGING_PROJECT_REF!==ref;
 if(e.AVOFIS_DOCUMENT_DRAFT_ENV==="staging")
  return e.VERCEL_ENV!=="production"&&
   e.AVOFIS_DOCUMENT_DRAFT_STAGING_ENABLED==="true"&&
   !!e.AVOFIS_PRODUCTION_SUPABASE_PROJECT_REF&&
   ref!==e.AVOFIS_PRODUCTION_SUPABASE_PROJECT_REF;
 return false;
}
