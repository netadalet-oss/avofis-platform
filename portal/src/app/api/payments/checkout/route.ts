import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { paymentsReleased } from "@/lib/release-authorization";

export const runtime="nodejs";
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const response=(error:string,status:number)=>NextResponse.json({error},{status,headers:{"Cache-Control":"no-store"}});
export async function POST(request:NextRequest){
  if(!paymentsReleased())return response("Payment is not available",503);
  const url=process.env.NEXT_PUBLIC_SUPABASE_URL,key=process.env.SUPABASE_SERVICE_ROLE_KEY,mollie=process.env.MOLLIE_API_KEY,base=process.env.AVOFIS_PUBLIC_BASE_URL;
  if(!url||!key||!mollie||!base||(process.env.NODE_ENV==="production"&&!base.startsWith("https://")))return response("Not configured",503);
  const auth=request.headers.get("authorization")||"";
  if(!auth.startsWith("Bearer "))return response("Sign in required",401);
  let body:Record<string,unknown>;
  try{body=await request.json();}catch{return response("Invalid request",400);}
  const caseId=typeof body.caseId==="string"?body.caseId:"";
  if(!uuid.test(caseId))return response("Invalid case",400);
  const db=createClient(url,key,{auth:{autoRefreshToken:false,persistSession:false}});
  const {data:{user},error:authError}=await db.auth.getUser(auth.slice(7));
  if(authError||!user||!user.email_confirmed_at)return response("Email verification required",401);
  const {data:caseRecord,error:caseError}=await db.from("avofis_cases").select("id,client_user_id,price_eur_cents,status").eq("id",caseId).eq("client_user_id",user.id).maybeSingle();
  if(caseError||!caseRecord||caseRecord.status==="closed"||caseRecord.status==="review"||caseRecord.price_eur_cents<1)return response("Case unavailable",403);
  const {data:agreement}=await db.from("avofis_agreements").select("id,signed_at").eq("case_id",caseId).maybeSingle();
  if(!agreement?.signed_at)return response("Agreement not accepted",409);
  const {data:previous}=await db.from("avofis_payments").select("checkout_url,status").eq("case_id",caseId).in("status",["open","pending","authorized","paid"]).order("created_at",{ascending:false}).limit(1).maybeSingle();
  const {data:disputed}=await db.from("avofis_payments").select("id").eq("case_id",caseId).in("status",["refunded","charged_back"]).limit(1).maybeSingle();
  if(disputed)return response("Please contact support before attempting another payment",409);
  if(previous){
    if(previous.status==="paid")return response("Already paid",409);
    return NextResponse.json({checkoutUrl:previous.checkout_url},{headers:{"Cache-Control":"no-store"}});
  }
  const amount=(caseRecord.price_eur_cents/100).toFixed(2);
  const baseUrl=base.replace(/\/$/,"");
  const paymentBody={
    amount:{currency:"EUR",value:amount},
    description:"AVOfis service "+caseId.slice(0,8),
    redirectUrl:baseUrl+"/musteri?payment=return",
    webhookUrl:baseUrl+"/api/payments/webhook",
    metadata:{caseId},
  };
  let payment:any;
  try{
    const result=await fetch("https://api.mollie.com/v2/payments",{
      method:"POST",
      headers:{"Authorization":"Bearer "+mollie,"Content-Type":"application/json","Idempotency-Key":"avofis-"+agreement.id},
      body:JSON.stringify(paymentBody),
      cache:"no-store"
    });
    if(!result.ok)throw new Error("Payment provider unavailable");
    payment=await result.json();
  }catch{return response("Payment provider unavailable",503);}
  const checkoutUrl=payment?._links?.checkout?.href;
  if(typeof payment?.id!=="string"||typeof checkoutUrl!=="string"||!checkoutUrl.startsWith("https://www.mollie.com/"))return response("Invalid provider response",503);
  const {error:saveError}=await db.from("avofis_payments").insert({case_id:caseId,mollie_id:payment.id,amount_eur_cents:caseRecord.price_eur_cents,status:"open",checkout_url:checkoutUrl});
  if(saveError){
    const {data:saved}=await db.from("avofis_payments").select("checkout_url").eq("mollie_id",payment.id).maybeSingle();
    if(saved)return NextResponse.json({checkoutUrl:saved.checkout_url},{headers:{"Cache-Control":"no-store"}});
    return response("Could not save payment",503);
  }
  return NextResponse.json({checkoutUrl},{headers:{"Cache-Control":"no-store"}});
}
