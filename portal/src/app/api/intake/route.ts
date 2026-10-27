import { NextRequest,NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { services } from "@/lib/avofis-site";
export const runtime="nodejs";

const categories=new Set([...services.map(s=>s.slug),"documents","administration","diplomas","business","translation","expert","other"]);
const countries=new Set(["Netherlands","Germany","Türkiye","Belgium","France","Austria","Switzerland","Luxembourg","Spain","Italy","United Kingdom","Other"]);
const languages=new Set(["tr","nl","de","en"]);
const applicantRoles=new Set(["self","family","business"]);
const issueStages=new Set(["new","ongoing","missing","decision","dispute"]);

export async function POST(request:NextRequest){
 if(process.env.AVOFIS_LEGAL_READY!=="true"||process.env.AVOFIS_INTAKE_ENABLED!=="true"||process.env.NEXT_PUBLIC_AVOFIS_INTAKE_ENABLED!=="true")
   return NextResponse.json({error:"Intake is not available"},{status:503});
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY,secret=process.env.TURNSTILE_SECRET_KEY;
 if(!url||!key||!secret)return NextResponse.json({error:"Service unavailable"},{status:503});
 if(Number(request.headers.get("content-length")||0)>6500)return NextResponse.json({error:"Invalid request"},{status:413});
 let p:Record<string,unknown>;
 try{p=await request.json();if(typeof p!=="object"||p===null||Array.isArray(p))throw new Error("not object");}
 catch{return NextResponse.json({error:"Invalid request"},{status:400});}
 const get=(k:string)=>typeof p[k]==="string"?String(p[k]).trim():"";
 const name=get("name"),email=get("email").toLowerCase(),message=get("message"),service=get("service");
 const country=get("country"),lang=get("lang"),applicantRole=get("applicantRole"),stage=get("stage"),date=get("decisionDate"),token=get("turnstileToken");
 const otherCountry=get("otherCountry"),secondaryCountry=get("secondaryCountry"),authorityName=get("authorityName");
 const validDate=(!date||(/^\d{4}-\d{2}-\d{2}$/.test(date)&&Number.isFinite(Date.parse(date+"T00:00:00Z"))&&new Date(date+"T00:00:00Z").toISOString().slice(0,10)===date));
 if(name.length<2||name.length>100||email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||
   message.length>500||!categories.has(service)||!countries.has(country)||!languages.has(lang)||
   !applicantRoles.has(applicantRole)||!issueStages.has(stage)||!validDate||
 (country==="Other"&&(otherCountry.length<2||otherCountry.length>80))||
 otherCountry.length>80||secondaryCountry.length>80||authorityName.length>120||
 p.privacyAccepted!==true||
   token.length<10||token.length>4096)return NextResponse.json({error:"Invalid request"},{status:400});
 try{
   const resp=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{
    method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},
    body:new URLSearchParams({secret,response:token}).toString(),cache:"no-store"
   });
   if(!resp.ok)throw new Error("verification unavailable");
   const verified=await resp.json();
   if(verified.success!==true)return NextResponse.json({error:"Verification failed"},{status:403});
   const db=createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});
   const id=randomUUID();
   const {error}=await db.from("avofis_leads").insert({
    id,full_name:name,email,service_key:service,country,summary:message,locale:lang,
    applicant_role:applicantRole,issue_stage:stage,decision_notified_on:date||null,
 other_country:country==="Other"?otherCountry:"",secondary_country:secondaryCountry,authority_name:authorityName,
    privacy_notice_version:"2026-10-v1",privacy_accepted_at:new Date().toISOString(),status:"new"
   });
   if(error)throw error;
   return NextResponse.json({reference:id.slice(0,8).toUpperCase()},{status:201,headers:{"Cache-Control":"no-store"}});
 }catch(e){console.error("Intake processing failure",e instanceof Error?e.name:"unknown");return NextResponse.json({error:"Service unavailable"},{status:503});}
}
