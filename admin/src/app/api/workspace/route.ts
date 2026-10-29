import {createClient, type SupabaseClient} from "@supabase/supabase-js";
import {NextRequest,NextResponse} from "next/server";
import {availableWorkspaceSections,isStaffCapability,staffCapabilities,productionActions} from "@/lib/workspace-model";
import {legalSources,workstreams} from "@/lib/legal-workflows";

export const runtime="nodejs";
export const dynamic="force-dynamic";
const deny=(code:number,msg:string)=>NextResponse.json({error:msg},{status:code,headers:{"Cache-Control":"no-store"}});
const canUseBackend=process.env.AVOFIS_STAFF_WORKSPACE_STAGING_ENABLED==="true";
function tokenFor(req:NextRequest){
 const h=req.headers.get("authorization")||"";
 return /^Bearer [A-Za-z0-9._-]{32,4096}$/.test(h)?h.slice(7):null;
}
function getDb(token:string):SupabaseClient|null{
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key||!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url))return null;
 return createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},
  global:{headers:{Authorization:"Bearer "+token}}});
}
export async function GET(req:NextRequest){
 // Works in a separately provisioned staging, never production by default.
 if(!canUseBackend)return deny(503,"STAFF_WORKSPACE_AWAITING_STAGING");
 const token=tokenFor(req);if(!token)return deny(401,"LOGIN_REQUIRED");
 const client=getDb(token);if(!client)return deny(503,"STAFF_DATABASE_NOT_CONFIGURED");
 const {data:identity,error:identityError}=await client.auth.getUser(token);
 if(identityError||!identity.user)return deny(401,"SESSION_NOT_VERIFIED");
 const uid=identity.user.id;
 const {data:staff,error:roleError}=await client.from("avofis_staff")
  .select("user_id,role").eq("user_id",uid).maybeSingle();
 if(roleError||!staff||!["admin","operator"].includes(staff.role))
  return deny(403,"NOT_AN_ACTIVE_STAFF_MEMBER");
 const {data:grants,error:grantError}=await client.from("avofis_staff_capability_grants")
  .select("capability").eq("staff_user_id",uid);
 // Migration absent or RLS revoked => no operator access, not implicit all.
 if(grantError)return deny(503,"STAFF_GRANTS_NOT_VERIFIED");
 const allowed=(grants||[]).map(g=>g.capability as string).filter(isStaffCapability);
 const accessible=availableWorkspaceSections(staff.role,allowed);
 const selected=req.nextUrl.searchParams.get("section")||"overview";
 const q=(req.nextUrl.searchParams.get("q")||"").slice(0,80);
 if(req.nextUrl.searchParams.size>2)return deny(400,"UNKNOWN_QUERY_FIELDS");
 if(selected!=="overview"&&!isStaffCapability(selected))return deny(400,"UNKNOWN_MODULE");
 if(selected!=="overview"&&!accessible.some(v=>v.id===selected))
  return deny(403,"MODULE_NOT_GRANTED");
 const base={role:staff.role,employeeId:uid,sections:accessible,
  restrictedActions:productionActions,
  environment:"STAGING_ONLY",verifiedSession:true,
  liveActionsEnabled:false};
 if(selected==="overview")return NextResponse.json({...base,items:[]},
  {headers:{"Cache-Control":"no-store"}});
 if(selected==="research"||selected==="pleadings")
  return NextResponse.json({...base,items:workstreams.filter(w=>
   !q||[w.title,w.domain,w.country,w.professional,w.audience].join(" ").toLocaleLowerCase("tr-TR")
    .includes(q.toLocaleLowerCase("tr-TR"))),sources:legalSources},
   {headers:{"Cache-Control":"no-store"}});
 const source:{
  [key:string]:{table:string;columns:string;sort?:string}
 }={
  inbox:{table:"avofis_leads",columns:"id,country,service_key,status,created_at",sort:"created_at"},
  matters:{table:"avofis_cases",columns:"id,title,service_key,status,created_at",sort:"created_at"},
  messages:{table:"avofis_messages",columns:"id,case_id,body,created_at",sort:"created_at"},
  billing:{table:"avofis_payments",columns:"id,case_id,amount_eur_cents,status,created_at",sort:"created_at"},
  people:{table:"avofis_staff",columns:"user_id,role,created_at",sort:"created_at"}
 };
 const src=source[selected];
 if(!src)return NextResponse.json({...base,items:[],
  notice:"MODULE_DATA_SOURCE_NOT_YET_CONNECTED"},
  {headers:{"Cache-Control":"no-store"}});
 let query=client.from(src.table).select(src.columns).limit(60);
 if(src.sort)query=query.order(src.sort,{ascending:false});
 const {data,error}=await query;
 if(error)return deny(503,"MODULE_DATABASE_NOT_READY");
 return NextResponse.json({...base,items:data||[]},
  {headers:{"Cache-Control":"no-store"}});
}
