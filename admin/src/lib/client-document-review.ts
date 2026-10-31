/** Production and preview release gates: real Supabase Auth/RLS, no mock records. */
export const documentReviewUUID=(v:unknown):v is string=>typeof v==="string"&&
 /^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(v);
export function documentReviewEnabled(e:Record<string,string|undefined>):boolean{
 const production=e.AVOFIS_DOCUMENT_DRAFT_ENV==="production";
 const staging=e.AVOFIS_DOCUMENT_DRAFT_ENV==="staging";
 if(!production&&!staging||e.AVOFIS_STAFF_DOCUMENT_REVIEW_ENABLED!=="true")return false;
 const ref=production?e.AVOFIS_PRODUCTION_SUPABASE_PROJECT_REF:e.AVOFIS_DOCUMENT_DRAFT_STAGING_PROJECT_REF;
 if(!ref||!/^[-a-z0-9]{12,32}$/.test(ref))return false;
 try{
  const url=new URL(e.NEXT_PUBLIC_SUPABASE_URL||"");
  if(url.protocol!=="https:"||url.hostname!==ref+".supabase.co"||url.port||
    url.pathname!=="/"||url.search||url.hash||url.username||url.password)return false;
 }catch{return false;}
 if(production)return e.VERCEL_ENV==="production"&&
  e.AVOFIS_DOCUMENT_DRAFT_PRODUCTION_ENABLED==="true"&&
  e.AVOFIS_DOCUMENT_DRAFT_SECURITY_REVIEWED==="true"&&
  e.AVOFIS_DOCUMENT_DRAFT_STAGING_PROJECT_REF!==ref;
 return e.VERCEL_ENV!=="production"&&e.AVOFIS_DOCUMENT_DRAFT_STAGING_ENABLED==="true"&&
  !!e.AVOFIS_PRODUCTION_SUPABASE_PROJECT_REF&&ref!==e.AVOFIS_PRODUCTION_SUPABASE_PROJECT_REF;
}
export function parseReviewNote(v:unknown):{draft_id:string;note:string}|null{
 if(!v||typeof v!=="object"||Array.isArray(v))return null;
 const body=v as Record<string,unknown>;
 if(Object.keys(body).sort().join(",")!=="draft_id,note"||!documentReviewUUID(body.draft_id)||
  typeof body.note!=="string")return null;
 const note=body.note.trim();
 return note.length>=3&&note.length<=2500&&!/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(note)?
  {draft_id:body.draft_id,note}:null;
}
