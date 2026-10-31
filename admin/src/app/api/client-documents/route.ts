import {createClient} from "@supabase/supabase-js";
import {NextRequest,NextResponse} from "next/server";
import {evaluateStaffMfa} from "@/lib/staff-mfa";
import {documentReviewEnabled,documentReviewUUID,parseReviewNote} from "@/lib/client-document-review";
export const runtime="nodejs";export const dynamic="force-dynamic";
const headers={"Cache-Control":"private, no-store, max-age=0","Vary":"Authorization","X-Content-Type-Options":"nosniff"};
const fail=(status:number|undefined,code:string|undefined)=>NextResponse.json({error:code??"ACCESS_DENIED"},{status:status??503,headers});
const MAX_BODY=3600;
async function verify(req:NextRequest){
 if(!documentReviewEnabled(process.env))return {status:503,reason:"DOCUMENT_REVIEW_NOT_CONFIGURED"} as const;
 const auth=req.headers.get("authorization")||"";
 if(!/^Bearer [A-Za-z0-9._-]{32,4096}$/.test(auth))return {status:401,reason:"LOGIN_REQUIRED"} as const;
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL!,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!key)return {status:503,reason:"DATABASE_NOT_CONFIGURED"} as const;
 const token=auth.slice(7);
 const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},
  global:{headers:{Authorization:"Bearer "+token}}});
 const {data:identity,error}=await db.auth.getUser(token);
 if(error||!identity.user)return {status:401,reason:"SESSION_INVALID"} as const;
 const assurance=await evaluateStaffMfa(db,token);
 if(!assurance.allowed)return {status:403,reason:assurance.reason} as const;
 const uid=identity.user.id;
 const {data:staff,error:staffError}=await db.from("avofis_staff").select("role").eq("user_id",uid).maybeSingle();
 if(staffError||staff?.role!=="operator")return {status:403,reason:"ASSIGNED_OPERATOR_REQUIRED"} as const;
 const {data:grants,error:grantError}=await db.from("avofis_staff_capability_grants")
  .select("capability").eq("staff_user_id",uid).in("capability",["documents","pleadings"]);
 if(grantError||!grants||!["documents","pleadings"].every(x=>grants.some(g=>g.capability===x)))
  return {status:403,reason:"DOCUMENT_AND_PLEADINGS_CAPABILITIES_REQUIRED"} as const;
 return {db,uid} as const;
}
export async function GET(req:NextRequest){
 const a=await verify(req);if("reason" in a)return fail(a.status,a.reason);
 const keys=[...req.nextUrl.searchParams.keys()];
 if(keys.some(x=>x!=="id")||req.nextUrl.searchParams.getAll("id").length>1)return fail(400,"UNKNOWN_PARAMETERS");
 const id=req.nextUrl.searchParams.get("id");
 if(id!==null&&!documentReviewUUID(id))return fail(400,"INVALID_DRAFT_ID");
 if(id){
  const {data,error}=await a.db.from("avofis_client_document_drafts")
   .select("id,owner_user_id,case_id,service_slug,locale,content,revision,status,updated_at")
   .eq("id",id).eq("status","review_requested").eq("consent_to_staff",true).maybeSingle();
  if(error)return fail(503,"DOCUMENT_NOT_AVAILABLE");
  if(!data)return fail(404,"DOCUMENT_NOT_IN_ASSIGNED_SCOPE");
  const [versions,notes]=await Promise.all([
   a.db.from("avofis_client_document_versions").select("revision,content,status,recorded_at")
    .eq("draft_id",id).order("revision",{ascending:true}).limit(250),
   a.db.from("avofis_client_document_review_notes").select("id,author_user_id,note,created_at")
    .eq("draft_id",id).order("created_at",{ascending:true}).limit(100)
  ]);
  if(versions.error||notes.error)return fail(503,"REVIEW_HISTORY_NOT_AVAILABLE");
  return NextResponse.json({document:data,versions:versions.data||[],notes:notes.data||[],
   canEditClientText:false,officialActionPerformed:false},{headers});
 }
 const {data,error}=await a.db.from("avofis_client_document_drafts")
  .select("id,case_id,service_slug,locale,revision,updated_at,status")
  .eq("status","review_requested").eq("consent_to_staff",true)
  .order("updated_at",{ascending:false}).limit(60);
 if(error)return fail(503,"REVIEW_QUEUE_NOT_AVAILABLE");
 return NextResponse.json({items:data||[],officialActionPerformed:false},{headers});
}
export async function POST(req:NextRequest){
 const a=await verify(req);if("reason" in a)return fail(a.status,a.reason);
 if(req.headers.get("content-type")?.split(";")[0]!=="application/json")return fail(415,"JSON_REQUIRED");
 if(Number(req.headers.get("content-length")||0)>MAX_BODY)return fail(413,"REQUEST_TOO_LARGE");
 let payload:unknown;
 try{const raw=await req.text();if(new TextEncoder().encode(raw).length>MAX_BODY)return fail(413,"REQUEST_TOO_LARGE");
  payload=JSON.parse(raw);}catch{return fail(400,"INVALID_JSON");}
 const note=parseReviewNote(payload);
 if(!note)return fail(400,"INVALID_REVIEW_NOTE");
 // Prevent opaque existence probing: only currently visible, explicitly
 // shared documents can receive a note. PostgreSQL repeats authorization.
 const {data:visible,error:readError}=await a.db.from("avofis_client_document_drafts")
  .select("id").eq("id",note.draft_id).eq("status","review_requested")
  .eq("consent_to_staff",true).maybeSingle();
 if(readError||!visible)return fail(403,"DOCUMENT_NOT_IN_ASSIGNED_SCOPE");
 const {data,error}=await a.db.from("avofis_client_document_review_notes")
  .insert({draft_id:note.draft_id,author_user_id:a.uid,note:note.note})
  .select("id,created_at").single();
 if(error||!data)return fail(403,"REVIEW_NOTE_REFUSED");
 return NextResponse.json({note:data,officialActionPerformed:false},
  {status:201,headers});
}
