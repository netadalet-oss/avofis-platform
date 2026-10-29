import {createClient} from "@supabase/supabase-js";
import {NextRequest,NextResponse} from "next/server";
import {isStaffCapability} from "@/lib/workspace-model";
export const runtime="nodejs";export const dynamic="force-dynamic";
const reject=(status:number,error:string)=>NextResponse.json({error},{status,headers:{"Cache-Control":"no-store"}});
const staging=process.env.AVOFIS_STAFF_WORKSPACE_STAGING_ENABLED==="true";
const writes=staging&&process.env.AVOFIS_STAFF_GRANTS_ENABLED==="true";
async function getAdmin(req:NextRequest){
 if(!staging)return {status:503,reason:"STAFF_STAGING_UNAVAILABLE"} as const;
 const h=req.headers.get("authorization")||"";
 if(!/^Bearer [A-Za-z0-9._-]{32,4096}$/.test(h))return {status:401,reason:"LOGIN_REQUIRED"} as const;
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key||!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url))
  return {status:503,reason:"STAFF_DATABASE_UNCONFIGURED"} as const;
 const token=h.slice(7);
 const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},
  global:{headers:{Authorization:"Bearer "+token}}});
 const {data:user,error}=await db.auth.getUser(token);
 if(error||!user.user)return {status:401,reason:"SESSION_INVALID"} as const;
 const uid=user.user.id;
 const {data:role,error:roleError}=await db.from("avofis_staff").select("role")
  .eq("user_id",uid).maybeSingle();
 if(roleError||role?.role!=="admin")return {status:403,reason:"ADMIN_ROLE_REQUIRED"} as const;
 return {db,uid} as const;
}
export async function GET(req:NextRequest){
 const a=await getAdmin(req);
 if(typeof a.status==="number")return reject(a.status,a.reason||"NO_ACCESS");
 if(req.nextUrl.searchParams.size!==0)return reject(400,"UNKNOWN_PARAMETERS");
 const [staff,grants,audit]=await Promise.all([
  a.db.from("avofis_staff").select("user_id,role").order("user_id").limit(100),
  a.db.from("avofis_staff_capability_grants")
   .select("staff_user_id,capability,granted_at").limit(1000),
  a.db.from("avofis_staff_capability_events")
   .select("staff_user_id,capability,action,recorded_at").order("recorded_at",{ascending:false}).limit(40)
 ]);
 if(staff.error||grants.error||audit.error)return reject(503,"STAFF_GRANT_REGISTRY_NOT_READY");
 return NextResponse.json({staff:staff.data||[],grants:grants.data||[],
  audit:audit.data||[],scope:"VERIFIED_ADMIN_STAGING_ONLY",
  liveChangesEnabled:false},{headers:{"Cache-Control":"no-store"}});
}
async function change(req:NextRequest,kind:"grant"|"revoke"){
 if(!writes)return reject(503,"PERSONAL_GRANT_WRITES_DISABLED");
 const contentType=req.headers.get("content-type")?.split(";")[0];
 if(contentType!=="application/json")return reject(415,"JSON_REQUIRED");
 if(Number(req.headers.get("content-length")||0)>500)return reject(413,"REQUEST_TOO_LARGE");
 let value:unknown;
 try{value=await req.json();}catch{return reject(400,"INVALID_JSON");}
 if(!value||typeof value!=="object"||Array.isArray(value))return reject(400,"INVALID_JSON");
 const body=value as Record<string,unknown>;
 if(Object.keys(body).sort().join(",")!=="capability,staff_user_id")return reject(400,"UNKNOWN_FIELDS");
 if(typeof body.staff_user_id!=="string"||!/^([0-9a-f]{8}-){4}[0-9a-f]{12}$/i.test(body.staff_user_id))
  return reject(400,"INVALID_STAFF_ID");
 if(typeof body.capability!=="string"||!isStaffCapability(body.capability))
  return reject(400,"UNKNOWN_CAPABILITY");
 const a=await getAdmin(req);
 if(typeof a.status==="number")return reject(a.status,a.reason||"NO_ACCESS");
 if(body.staff_user_id===a.uid)return reject(403,"SELF_GRANT_PROHIBITED");
 if(kind==="grant"){
  const {error}=await a.db.from("avofis_staff_capability_grants").insert({
   staff_user_id:body.staff_user_id,capability:body.capability,granted_by:a.uid
  });
  if(error)return reject(403,"GRANT_REJECTED");
 }else{
  const {data,error}=await a.db.from("avofis_staff_capability_grants")
   .delete().eq("staff_user_id",body.staff_user_id).eq("capability",body.capability)
   .select("staff_user_id");
  if(error||!data?.length)return reject(403,"REVOKE_REJECTED");
 }
 return NextResponse.json({status:kind==="grant"?"GRANT_RECORDED":"REVOKE_RECORDED",
  officialAuthorityGranted:false,mayTransmitClientData:false},
  {headers:{"Cache-Control":"no-store"}});
}
export async function POST(req:NextRequest){return change(req,"grant");}
export async function DELETE(req:NextRequest){return change(req,"revoke");}
