import {createClient} from "@supabase/supabase-js";
import {NextRequest,NextResponse} from "next/server";
import {evaluateStaffMfa} from "@/lib/staff-mfa";
import {isStaffCapability} from "@/lib/workspace-model";
export const dynamic="force-dynamic";
export const runtime="nodejs";
const no=(code:number,error:string)=>NextResponse.json({error},{status:code,headers:{"Cache-Control":"no-store"}});
const isStaging=process.env.AVOFIS_STAFF_WORKSPACE_STAGING_ENABLED==="true";
const canWrite=isStaging&&process.env.AVOFIS_STAFF_INTERNAL_REVIEW_ENABLED==="true";
async function admin(req:NextRequest){
 if(!isStaging)return {code:503,error:"STAGING_ONLY_NOT_CONNECTED"} as const;
 const header=req.headers.get("authorization")||"";
 if(!/^Bearer [A-Za-z0-9._-]{32,4096}$/.test(header))
  return {code:401,error:"LOGIN_REQUIRED"} as const;
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key||!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url))
  return {code:503,error:"STAGING_DB_UNCONFIGURED"} as const;
 const token=header.slice(7);
 const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},
  global:{headers:{Authorization:"Bearer "+token}}});
 const {data:user,error:authError}=await db.auth.getUser(token);
 if(authError||!user.user)return {code:401,error:"SESSION_INVALID"} as const;
 const {data:role,error}=await db.from("avofis_staff").select("role")
  .eq("user_id",user.user.id).maybeSingle();
 if(error||role?.role!=="admin")return {code:403,error:"INDEPENDENT_ADMIN_REQUIRED"} as const;
 const assurance=await evaluateStaffMfa(db,token);
 if(!assurance.allowed)return {code:403,error:assurance.reason} as const;
 return {db,uid:user.user.id} as const;
}
export async function GET(req:NextRequest){
 const who=await admin(req);
 if("code" in who&&typeof who.code==="number")return no(who.code,who.error||"ACCESS_DENIED");
 const module=req.nextUrl.searchParams.get("module");
 if(!module||!isStaffCapability(module)||req.nextUrl.searchParams.size!==1)
  return no(400,"INVALID_MODULE");
 const {data, error}=await who.db.from("avofis_staff_work_items")
  .select("id,title,summary,module,staff_user_id,state,flow,amount_eur_cents,created_at")
  .eq("module",module).eq("state","review_requested")
  .order("created_at",{ascending:false}).limit(40);
 if(error)return no(503,"REVIEW_QUEUE_UNAVAILABLE");
 const ids=(data||[]).map(x=>x.id);
 const {data:signoffs,error:signError}=ids.length?
  await who.db.from("avofis_staff_work_item_signoffs")
   .select("work_item_id,reviewer_user_id,decision").in("work_item_id",ids):
  {data:[],error:null};
 if(signError)return no(503,"REVIEW_SIGNOFFS_UNAVAILABLE");
 return NextResponse.json({items:(data||[]).map(item=>({
  ...item,reviewers:(signoffs||[]).filter(s=>s.work_item_id===item.id)
   .map(s=>({reviewer_user_id:s.reviewer_user_id,decision:s.decision})),
  canIndependentlyReview:item.staff_user_id!==who.uid&&
   !(signoffs||[]).some(s=>s.work_item_id===item.id&&s.reviewer_user_id===who.uid)
 })),status:"INTERNAL_REVIEW_ONLY",maySendToBank:false,mayFileWithCourt:false},
 {headers:{"Cache-Control":"no-store"}});
}
export async function POST(req:NextRequest){
 if(!canWrite)return no(503,"INTERNAL_REVIEW_WRITES_DISABLED");
 if(req.headers.get("content-type")?.split(";")[0]!=="application/json")
  return no(415,"JSON_REQUIRED");
 const len=Number(req.headers.get("content-length")||0);
 if(len>1000)return no(413,"REQUEST_TOO_LARGE");
 let value:unknown;
 try{value=await req.json();}catch{return no(400,"INVALID_JSON");}
 if(!value||typeof value!=="object"||Array.isArray(value))return no(400,"INVALID_JSON");
 const body=value as Record<string,unknown>;
 if(Object.keys(body).sort().join(",")!=="decision,work_item_id")return no(400,"UNKNOWN_FIELDS");
 if(typeof body.work_item_id!=="string"||
  !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(body.work_item_id))
   return no(400,"INVALID_ITEM_ID");
 if(body.decision!=="reviewed_internal"&&body.decision!=="changes_requested")
  return no(400,"INVALID_DECISION");
 const who=await admin(req);
 if("code" in who&&typeof who.code==="number")return no(who.code,who.error||"ACCESS_DENIED");
 // Actual independent reviewer and owner checks reside in PostgreSQL RLS.
 const {error}=await who.db.from("avofis_staff_work_item_signoffs").insert({
  work_item_id:body.work_item_id,reviewer_user_id:who.uid,decision:body.decision
 });
 if(error)return no(403,"INDEPENDENT_REVIEW_REJECTED");
 return NextResponse.json({status:"INTERNAL_REVIEW_RECORDED",mayApproveBankTransfer:false,
  maySendOfficially:false},{status:201,headers:{"Cache-Control":"no-store"}});
}
