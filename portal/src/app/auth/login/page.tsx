"use client";
import { useState,type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PageFrame } from "@/components/avofis/PageFrame";
import { usePortalLanguage } from "@/hooks/usePortalLanguage";
import { accountText } from "@/lib/account-text";

export default function LoginPage(){
 const router=useRouter();
 const lang=usePortalLanguage(),t=accountText[lang].login;
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 async function submit(event:FormEvent<HTMLFormElement>){
   event.preventDefault();setBusy(true);setError("");
   try{
     const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});
     if(error){setError(t.failed);return;}
     router.replace("/musteri?lang="+lang);router.refresh();
   }catch{setError(t.unavailable);}
   finally{setBusy(false);}
 }
 return <PageFrame lang={lang} eyebrow={t.eyebrow} title={t.title} description={t.description}>
   <div className="avofis-card max-w-lg rounded-[18px] border p-5 sm:p-7">
     <form onSubmit={submit} className="space-y-4">
       <label className="block text-[13px] font-semibold text-[#E6ECF7]">{t.email}<input type="email" autoComplete="email" value={email} required maxLength={254} onChange={e=>setEmail(e.target.value)} className="avofis-field"/></label>
       <label className="block text-[13px] font-semibold text-[#E6ECF7]">{t.password}<input type="password" autoComplete="current-password" value={password} required onChange={e=>setPassword(e.target.value)} className="avofis-field"/></label>
       {error&&<p role="alert" className="rounded-lg border border-red-400/30 bg-red-950/30 p-3 text-[13px] leading-6 text-red-200">{error}</p>}
       <button disabled={busy} className="avofis-cta avofis-btn w-full disabled:cursor-not-allowed disabled:opacity-50">{busy?t.busy:t.submit}</button>
     </form>
     <div className="mt-5 flex flex-wrap justify-between gap-3 border-t border-[#dfbf59]/15 pt-4 text-[13px] font-medium text-[#dfbf59]">
       <Link href={"/auth/register?lang="+lang}>{t.register}</Link><Link href={"/auth/forgot-password?lang="+lang}>{t.forgot}</Link>
     </div>
   </div>
 </PageFrame>;
}
