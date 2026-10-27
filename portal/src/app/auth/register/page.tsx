"use client";
import { useState,type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PageFrame } from "@/components/avofis/PageFrame";
import { usePortalLanguage } from "@/hooks/usePortalLanguage";
import { accountText } from "@/lib/account-text";

const enabled=process.env.NEXT_PUBLIC_AVOFIS_CLIENT_PORTAL_ENABLED==="true";
export default function RegisterPage(){
 const router=useRouter();
 const lang=usePortalLanguage(),t=accountText[lang].register;
 const [name,setName]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState("");
 const [agreed,setAgreed]=useState(false),[busy,setBusy]=useState(false);
 const [error,setError]=useState(""),[success,setSuccess]=useState("");
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(!enabled||!agreed||name.trim().length<2||password.length<12)return;
  setBusy(true);setError("");
  try{
    const {data,error}=await supabase.auth.signUp({
      email:email.trim().toLowerCase(),password,
      options:{data:{full_name:name.trim(),role:"client"},emailRedirectTo:window.location.origin+"/musteri"}
    });
    if(error){setError(t.error);return;}
    if(data.session){router.replace("/musteri?lang="+lang);router.refresh();return;}
    setSuccess(t.success);
  }catch{setError(t.error);}
  finally{setBusy(false);}
 }
 return <PageFrame lang={lang} eyebrow={t.eyebrow} title={t.title} description={t.description}>
   <div className="avofis-card max-w-lg rounded-[18px] border p-5 sm:p-7">
    {!enabled?<div role="status" className="rounded-xl border border-[#dfbf59]/20 bg-[#071738] p-5">
      <p className="text-[15px] font-semibold text-[#F2F5FF]">{t.closed}</p>
      <p className="mt-2 text-[13px] leading-[1.8] text-[#B9C5DF]">{t.closedDetail}</p>
    </div>:success?<p role="status" className="rounded-lg border border-[#dfbf59]/20 bg-[#071738] p-4 text-[13px] leading-6 text-[#F2F5FF]">{success}</p>:<form onSubmit={submit} className="space-y-4">
      <label className="block text-[13px] font-semibold text-[#E6ECF7]">{t.name}<input type="text" autoComplete="name" required maxLength={100} value={name} onChange={e=>setName(e.target.value)} className="avofis-field"/></label>
      <label className="block text-[13px] font-semibold text-[#E6ECF7]">{t.email}<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} className="avofis-field"/></label>
      <label className="block text-[13px] font-semibold text-[#E6ECF7]">{t.password}<input type="password" autoComplete="new-password" minLength={12} required value={password} onChange={e=>setPassword(e.target.value)} className="avofis-field"/></label>
      <label className="flex items-start gap-3 text-[13px] leading-[1.7] text-[#DCE3F1]"><input className="mt-1 h-4 w-4 shrink-0" type="checkbox" checked={agreed} required onChange={e=>setAgreed(e.target.checked)}/><span><Link href={"/gizlilik?lang="+lang} className="font-semibold text-[#dfbf59] underline">{t.privacy}</Link> {t.consent}</span></label>
      {error&&<p role="alert" className="rounded-lg border border-red-400/30 bg-red-950/30 p-3 text-[13px] text-red-200">{error}</p>}
      <button disabled={busy||!agreed} className="avofis-cta avofis-btn w-full disabled:cursor-not-allowed disabled:opacity-50">{busy?t.busy:t.submit}</button>
    </form>}
    <p className="mt-5 border-t border-[#dfbf59]/15 pt-4 text-[13px] text-[#B9C5DF]">{t.existing} <Link href={"/auth/login?lang="+lang} className="font-semibold text-[#dfbf59]">{t.login}</Link></p>
   </div>
 </PageFrame>;
}
