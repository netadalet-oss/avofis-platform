import {createClient} from "@supabase/supabase-js";
import {NextRequest,NextResponse} from "next/server";
import {documentDraftStageEnabled,isUUID,parseCreateDraft,parsePatchDraft} from "@/lib/document-draft-contract";
export const runtime="nodejs";export const dynamic="force-dynamic";
const safeHeaders={"Cache-Control":"private, no-store, max-age=0","Vary":"Authorization","X-Content-Type-Options":"nosniff"};
const deny=(status:number|undefined,error:string|undefined)=>NextResponse.json({error:error??"STAGING_ONLY"},{status:status??503,headers:safeHeaders});
const MAX_BYTES=27000;
async function verified(req:NextRequest){
 if(!documentDraftStageEnabled(process.env))return {error:"STAGING_ONLY",status:503} as const;
 const bearer=req.headers.get("authorization")||"";
 if(!/^Bearer [A-Za-z0-9._-]{32,4096}$/.test(bearer))return {error:"LOGIN_REQUIRED",status:401} as const;
 const token=bearer.slice(7);
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL!,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!key)return {error:"STAGING_NOT_CONFIGURED",status:503} as const;
 // No service-role key; PostgREST queries are scoped to this verified user JWT.
 const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},
  global:{headers:{Authorization:"Bearer "+token}}});
 const {data,error}=await db.auth.getUser(token);
 if(error||!data.user)return {error:"SESSION_INVALID",status:401} as const;
 return {db,uid:data.user.id} as const;
}
async function readJson(req:NextRequest):Promise<unknown>{
 if(req.headers.get("content-type")?.split(";")[0]!=="application/json")throw Error("JSON_REQUIRED");
 if(Number(req.headers.get("content-length")||0)>MAX_BYTES)throw Error("REQUEST_TOO_LARGE");
 const text=await req.text();
 if(new TextEncoder().encode(text).length>MAX_BYTES)throw Error("REQUEST_TOO_LARGE");
 try{return JSON.parse(text);}catch{throw Error("INVALID_JSON");}
}
export async function GET(req:NextRequest){
 const a=await verified(req);if("error" in a)return deny(a.status,a.error);
 const id=req.nextUrl.searchParams.get("id");
 if([...req.nextUrl.searchParams.keys()].some(k=>k!=="id")||req.nextUrl.searchParams.getAll("id").length>1||
   (id!==null&&!isUUID(id)))return deny(400,"INVALID_PARAMETERS");
 if(id){
  const {data,error}=await a.db.from("avofis_client_document_drafts")
   .select("id,case_id,service_slug,locale,content,status,consent_to_staff,revision,updated_at")
   .eq("owner_user_id",a.uid).eq("id",id).maybeSingle();
  if(error)return deny(503,"DRAFTS_UNAVAILABLE");
  if(!data)return deny(404,"DRAFT_NOT_FOUND");
  const [versions,notes]=await Promise.all([
   a.db.from("avofis_client_document_versions").select("revision,status,content,recorded_at")
    .eq("draft_id",id).order("revision",{ascending:true}).limit(250),
   a.db.from("avofis_client_document_review_notes").select("note,created_at")
    .eq("draft_id",id).order("created_at",{ascending:true}).limit(100)
  ]);
  if(versions.error||notes.error)return deny(503,"HISTORY_UNAVAILABLE");
  return NextResponse.json({draft:data,versions:versions.data||[],notes:notes.data||[],
   officialSubmission:false},{headers:safeHeaders});
 }
 const {data,error}=await a.db.from("avofis_client_document_drafts")
  .select("id,case_id,service_slug,locale,status,revision,updated_at")
  .eq("owner_user_id",a.uid).order("updated_at",{ascending:false}).limit(75);
 if(error)return deny(503,"DRAFTS_UNAVAILABLE");
 return NextResponse.json({items:data||[],officialSubmission:false},{headers:safeHeaders});
}
export async function POST(req:NextRequest){
 const a=await verified(req);if("error" in a)return deny(a.status,a.error);
 let body:unknown;try{body=await readJson(req);}catch(e){
  return deny(String(e).includes("LARGE")?413:400,"INVALID_JSON_OR_SIZE");}
 const parsed=parseCreateDraft(body);if(!parsed)return deny(400,"INVALID_DRAFT");
 const {data,error}=await a.db.from("avofis_client_document_drafts")
  .insert({owner_user_id:a.uid,case_id:parsed.case_id,service_slug:parsed.draft.service,
   locale:parsed.draft.locale,content:parsed.draft})
  .select("id,revision,status,updated_at").single();
 if(error||!data)return deny(403,"DRAFT_CREATE_REFUSED");
 return NextResponse.json({draft:data,officialSubmission:false},{status:201,headers:safeHeaders});
}
export async function PATCH(req:NextRequest){
 const a=await verified(req);if("error" in a)return deny(a.status,a.error);
 let body:unknown;try{body=await readJson(req);}catch(e){
  return deny(String(e).includes("LARGE")?413:400,"INVALID_JSON_OR_SIZE");}
 const parsed=parsePatchDraft(body);if(!parsed)return deny(400,"INVALID_REVISION_REQUEST");
 const {data,error}=await a.db.from("avofis_client_document_drafts")
  .update({content:parsed.draft,status:parsed.status,consent_to_staff:parsed.consent_to_staff})
  .eq("id",parsed.id).eq("owner_user_id",a.uid).eq("revision",parsed.revision)
  .eq("service_slug",parsed.draft.service).eq("locale",parsed.draft.locale).eq("status","draft")
  .select("id,revision,status,updated_at").maybeSingle();
 if(error)return deny(403,"DRAFT_UPDATE_REFUSED");
 if(!data)return deny(409,"REVISION_CONFLICT_OR_NOT_AUTHORIZED");
 return NextResponse.json({draft:data,officialSubmission:false},{headers:safeHeaders});
}
