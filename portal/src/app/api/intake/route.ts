import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";
import { getJourney,validateJourneyDetails } from "@/lib/journeys";
import { intakeReleased } from "@/lib/release-authorization";

export const runtime="nodejs";
const countries=new Set(["Netherlands","Türkiye","Germany","Other"]);
const languages=new Set(["tr","nl","en"]);
const fail=(status:number)=>NextResponse.json({error:"Invalid or unavailable request"},{status,headers:{"Cache-Control":"no-store"}});
export async function POST(request:NextRequest){
 if(!intakeReleased())return fail(503);
 const supabaseUrl=process.env.NEXT_PUBLIC_SUPABASE_URL,serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY,turnstileSecret=process.env.TURNSTILE_SECRET_KEY;
 if(!supabaseUrl||!serviceKey||!turnstileSecret)return fail(503);
 if(Number(request.headers.get("content-length")||0)>7000)return fail(413);
 let body:unknown;
 try{body=await request.json();}catch{return fail(400);}
 if(!body||typeof body!=="object"||Array.isArray(body))return fail(400);
 const data=body as Record<string,unknown>;
 const str=(key:string)=>typeof data[key]==="string"?String(data[key]).trim():"";
 const name=str("name"),email=str("email").toLowerCase(),country=str("country"),service=str("service");
 const message=str("message"),lang=str("lang"),token=str("turnstileToken"),journeyId=str("journey");
 const journey=getJourney(journeyId);
 const details=data.details;
 if(!journey||journey.service!==service||!validateJourneyDetails(journeyId,details)||
    name.length<2||name.length>100||email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||
    message.length>500||!countries.has(country)||!languages.has(lang)||data.privacyAccepted!==true||
    token.length<10||token.length>4096)return fail(400);
 try{
   const challenge=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{
     method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},
     body:new URLSearchParams({secret:turnstileSecret,response:token}).toString(),cache:"no-store"
   });
   if(!challenge.ok)throw new Error("challenge unavailable");
   const result=await challenge.json();
   if(result.success!==true)return fail(403);
   const db=createClient(supabaseUrl,serviceKey,{auth:{persistSession:false,autoRefreshToken:false}});
   const id=randomUUID();
   const saved=await db.from("avofis_leads").insert({
     id,full_name:name,email,country,service_key:service,summary:message,locale:lang,
     journey_key:journeyId,intake_details:details,
     privacy_notice_version:"2026-10-v1",privacy_accepted_at:new Date().toISOString(),status:"new"
   });
   if(saved.error)throw new Error("Insert failed");
   return NextResponse.json({reference:id.slice(0,8).toUpperCase()},{status:201,headers:{"Cache-Control":"no-store"}});
 }catch(error){
   console.error("AVOfis intake error",error instanceof Error?error.name:"unknown");
   return fail(503);
 }
}
