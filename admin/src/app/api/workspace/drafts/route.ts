import {createClient} from "@supabase/supabase-js";
import {NextRequest,NextResponse} from "next/server";
import {isStaffCapability,type StaffCapability} from "@/lib/workspace-model";
export const runtime="nodejs";export const dynamic="force-dynamic";
const refuse=(status:number,error:string)=>NextResponse.json({error},{status,headers:{"Cache-Control":"no-store"}});
const enabled=process.env.AVOFIS_STAFF_WORKSPACE_STAGING_ENABLED==="true";
const writable=enabled&&process.env.AVOFIS_STAFF_WORK_ITEM_WRITES_ENABLED==="true";
async function verify(req:NextRequest,cap:string){
 if(!enabled)return {code:503,why:"STAFF_STAGING_NOT_CONNECTED"} as const;
 const header=req.headers.get("authorization")||"";
 if(!/^Bearer [A-Za-z0-9._-]{32,4096}$/.test(header))
  return {code:401,why:"LOGIN_REQUIRED"} as const;
 if(!isStaffCapability(cap))return {code:400,why:"UNKNOWN_MODULE"} as const;
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 if(!url||!key||!/^https:\/\/[a-z0-9-]+\.supabase\.co\/?$/.test(url))
  return {code:503,why:"STAFF_DATABASE_NOT_CONFIGURED"} as const;
 const token=header.slice(7);
 const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false},
  global:{headers:{Authorization:"Bearer "+token}}});
 const {data:identity,error:userError}=await db.auth.getUser(token);
 if(userError||!identity.user)return {code:401,why:"SESSION_NOT_VERIFIED"} as const;
 const uid=identity.user.id;
 const {data:staff,error:staffError}=await db.from("avofis_staff")
  .select("role").eq("user_id",uid).maybeSingle();
 if(staffError||!staff||!["admin","operator"].includes(staff.role))
  return {code:403,why:"NOT_STAFF"} as const;
 if(staff.role==="operator"){
  const {data:grants,error}=await db.from("avofis_staff_capability_grants")
   .select("capability").eq("staff_user_id",uid).eq("capability",cap);
  if(error||!grants?.length)return {code:403,why:"MODULE_NOT_GRANTED"} as const;
 }
 return {db,uid,cap:cap as StaffCapability} as const;
}
export async function GET(req:NextRequest){
 const cap=req.nextUrl.searchParams.get("module")||"";
 const a=await verify(req,cap);
 if(typeof a.code==="number")return refuse(a.code,a.why||"AUTHORIZATION_FAILED");
 const {data,error}=await a.db.from("avofis_staff_work_items")
  .select("id,module,title,summary,state,flow,amount_eur_cents,created_at,case_id")
  .eq("staff_user_id",a.uid).eq("module",a.cap)
  .order("created_at",{ascending:false}).limit(60);
 if(error)return refuse(503,"DRAFTS_NOT_AVAILABLE");
 return NextResponse.json({items:data||[],status:"INTERNAL_ONLY",canSubmitExternally:false},
  {headers:{"Cache-Control":"no-store"}});
}
export async function POST(req:NextRequest){
 const length=Number(req.headers.get("content-length")||0);
 if(length>5500)return refuse(413,"DRAFT_TOO_LARGE");
 if(req.headers.get("content-type")?.split(";")[0]!=="application/json")
  return refuse(415,"JSON_REQUIRED");
 let body:Record<string,unknown>;
 try{body=await req.json();}catch{return refuse(400,"INVALID_JSON");}
 if(!body||typeof body!=="object"||Array.isArray(body))return refuse(400,"INVALID_DRAFT");
 const module=body.module;
 if(typeof module!=="string")return refuse(400,"MODULE_REQUIRED");
 const a=await verify(req,module);
 if(typeof a.code==="number")return refuse(a.code,a.why||"AUTHORIZATION_FAILED");
 if(!writable)return refuse(503,"DRAFT_WRITES_DISABLED");
 const allow=new Set(["module","title","summary","case_id","amount_eur_cents"]);
 if(Object.keys(body).some(k=>!allow.has(k)))return refuse(400,"UNKNOWN_FIELD");
 const title=body.title,summary=body.summary??"";
 if(typeof title!=="string"||title.trim().length<4||title.length>160||
    typeof summary!=="string"||summary.length>2500)return refuse(400,"INVALID_TEXT");
 const caseId=body.case_id;
 if(caseId!==undefined&&caseId!==null&&
   (typeof caseId!=="string"||!/^[0-9a-f-]{36}$/i.test(caseId)))
  return refuse(400,"INVALID_CASE");
 const financial=a.cap==="billing"||a.cap==="payables";
 const amount=body.amount_eur_cents;
 if(financial&&(!Number.isInteger(amount)||Number(amount)<0||Number(amount)>100000000))
  return refuse(400,"INVALID_FINANCIAL_AMOUNT");
 if(!financial&&amount!==undefined)return refuse(400,"AMOUNT_NOT_ALLOWED");
 const {data,error}=await a.db.from("avofis_staff_work_items")
  .insert({staff_user_id:a.uid,case_id:caseId||null,module:a.cap,
   title:title.trim(),summary,state:"draft",
   flow:financial?(a.cap==="billing"?"income":"expense"):null,
   amount_eur_cents:financial?amount:null})
  .select("id,created_at").single();
 if(error)return refuse(403,"DRAFT_PERSISTENCE_REFUSED");
 return NextResponse.json({item:data,status:"DRAFT_ONLY",canSubmitExternally:false},
  {status:201,headers:{"Cache-Control":"no-store"}});
}
