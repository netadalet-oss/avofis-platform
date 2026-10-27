import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";
const categories = new Set(["documents","administration","diplomas","business","translation","expert","other"]);
const countries = new Set(["Netherlands","Türkiye","Germany","Other"]);
const languages = new Set(["tr","nl","en"]);

export async function POST(request:NextRequest) {
  if (process.env.AVOFIS_LEGAL_READY !== "true" || process.env.AVOFIS_INTAKE_ENABLED !== "true" || process.env.NEXT_PUBLIC_AVOFIS_INTAKE_ENABLED !== "true") {
    return NextResponse.json({error:"Intake is not available"},{status:503});
  }
  const supabaseUrl=process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY;
  const turnstileSecret=process.env.TURNSTILE_SECRET_KEY;
  if (!supabaseUrl || !serviceKey || !turnstileSecret) return NextResponse.json({error:"Service unavailable"},{status:503});
  const length=Number(request.headers.get("content-length")||0);
  if (length>5000) return NextResponse.json({error:"Invalid request"},{status:413});
  let payload:Record<string,unknown>;
  try {payload=await request.json();}catch{return NextResponse.json({error:"Invalid request"},{status:400});}
  const str=(k:string)=>typeof payload[k]==="string"?String(payload[k]).trim():"";
  const name=str("name"),email=str("email").toLowerCase(),message=str("message"),service=str("service"),country=str("country"),lang=str("lang"),token=str("turnstileToken");
  if (name.length<2 || name.length>100 || email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || message.length>500 || !categories.has(service) || !countries.has(country) || !languages.has(lang) || payload.privacyAccepted!==true || token.length<10 || token.length>4096) {
    return NextResponse.json({error:"Invalid request"},{status:400});
  }
  try {
    const verification=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{
      method:"POST",headers:{"Content-Type":"application/x-www-form-urlencoded"},
      body:new URLSearchParams({secret:turnstileSecret,response:token}).toString(),
      cache:"no-store"
    });
    if (!verification.ok) throw new Error("captcha unavailable");
    const verified=await verification.json();
    if (verified.success!==true) return NextResponse.json({error:"Verification failed"},{status:403});
    const id=randomUUID();
    const db=createClient(supabaseUrl,serviceKey,{auth:{autoRefreshToken:false,persistSession:false}});
    const result=await db.from("avofis_leads").insert({
      id,full_name:name,email,service_key:service,country,summary:message,locale:lang,
      privacy_notice_version:"2026-10-v1",privacy_accepted_at:new Date().toISOString(),status:"new"
    });
    if (result.error) throw result.error;
    return NextResponse.json({reference:id.slice(0,8).toUpperCase()},{status:201,headers:{"Cache-Control":"no-store"}});
  } catch(e) {console.error("Intake processing failure", e instanceof Error?e.name:"unknown");return NextResponse.json({error:"Service unavailable"},{status:503});}
}
