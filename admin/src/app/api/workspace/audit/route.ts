import {createClient} from "@supabase/supabase-js";
import {NextRequest,NextResponse} from "next/server";
export const runtime="nodejs";export const dynamic="force-dynamic";
const fail=(status:number,error:string)=>NextResponse.json({error},{status,headers:{"Cache-Control":"no-store"}});
export async function GET(req:NextRequest){
 if(process.env.AVOFIS_STAFF_WORKSPACE_STAGING_ENABLED!=="true")
  return fail(503,"STAFF_AUDIT_STAGING_DISABLED");
 const auth=req.headers.get("authorization")||"";
 if(!/^Bearer [A-Za-z0-9._-]{32,4096}$/.test(auth))return fail(401,"LOGIN_REQUIRED");
 if(req.nextUrl.searchParams.size!==0)return fail(400,"UNKNOWN_PARAMETERS");
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL, key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key||!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url))
  return fail(503,"STAGING_DB_NOT_READY");
 const token=auth.slice(7),db=createClient(url,key,{
  auth:{persistSession:false,autoRefreshToken:false},
  global:{headers:{Authorization:"Bearer "+token}}
 });
 const {data:identity,error:authError}=await db.auth.getUser(token);
 if(authError||!identity.user)return fail(401,"SESSION_NOT_VERIFIED");
 const {data:staff,error:staffError}=await db.from("avofis_staff")
  .select("role").eq("user_id",identity.user.id).maybeSingle();
 if(staffError||staff?.role!=="admin")return fail(403,"AUDIT_ADMIN_ONLY");
 const [privilege,work,signoff]=await Promise.all([
  db.from("avofis_staff_capability_events")
   .select("staff_user_id,capability,actor_user_id,action,recorded_at")
   .order("recorded_at",{ascending:false}).limit(40),
  db.from("avofis_staff_work_item_events")
   .select("work_item_id,actor_user_id,event_kind,from_state,to_state,recorded_at")
   .order("recorded_at",{ascending:false}).limit(40),
  db.from("avofis_staff_work_item_signoffs")
   .select("work_item_id,reviewer_user_id,decision,reviewed_at")
   .order("reviewed_at",{ascending:false}).limit(40)
 ]);
 if(privilege.error||work.error||signoff.error)return fail(503,"AUDIT_STREAM_NOT_READY");
 return NextResponse.json({
  privilegeEvents:privilege.data||[],workEvents:work.data||[],
  internalSignoffs:signoff.data||[],scope:"STAGING_ADMIN_READ_ONLY",
  tamperEvident:false,independentAuditAcceptance:false,
  legalOrFinancialApproval:false
 },{headers:{"Cache-Control":"no-store"}});
}
