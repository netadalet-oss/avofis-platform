import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
export const runtime="nodejs";
export async function POST(request:NextRequest){
 const mollie=process.env.MOLLIE_API_KEY,url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY;
 if(!mollie||!url||!key)return new NextResponse(null,{status:503});
 if(Number(request.headers.get("content-length")||0)>1000)return new NextResponse(null,{status:413});
 let id="";
 try{id=(await request.formData()).get("id")?.toString()||"";}catch{return new NextResponse(null,{status:400});}
 if(!/^tr_[a-zA-Z0-9]{6,40}$/.test(id))return new NextResponse(null,{status:400});
 const provider=await fetch("https://api.mollie.com/v2/payments/"+encodeURIComponent(id),{headers:{Authorization:"Bearer "+mollie},cache:"no-store"});
 if(!provider.ok)return new NextResponse(null,{status:503});
 const payment=await provider.json();
 const db=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
 const {data:stored,error}=await db.from("avofis_payments").select("id,case_id,amount_eur_cents,status").eq("mollie_id",id).maybeSingle();
 if(error||!stored)return new NextResponse(null,{status:404});
 if(payment.id!==id||payment.metadata?.caseId!==stored.case_id||payment.amount?.currency!=="EUR"||Math.round(Number(payment.amount.value)*100)!==stored.amount_eur_cents)return new NextResponse(null,{status:409});
 const allowed=["open","pending","authorized","paid","failed","canceled","expired","refunded","charged_back"];
 if(!allowed.includes(payment.status))return new NextResponse(null,{status:409});
 if(stored.status==="paid"&&payment.status!=="refunded"&&payment.status!=="charged_back")return new NextResponse(null,{status:200});
 const updated=await db.from("avofis_payments").update({status:payment.status,updated_at:new Date().toISOString()}).eq("id",stored.id);
 return new NextResponse(null,{status:updated.error?503:200});
}
