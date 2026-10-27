"use client";
import { useState,type FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { PageFrame } from "@/components/avofis/PageFrame";
import { usePortalLanguage } from "@/hooks/usePortalLanguage";
import { accountText } from "@/lib/account-text";

export default function ForgotPasswordPage(){
  const lang=usePortalLanguage(),t=accountText[lang].recovery;
  const [email,setEmail]=useState("");
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setMessage("");
    const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:window.location.origin+"/auth/update-password?lang="+lang});
    setMessage(error?t.error:t.success);
    setBusy(false);
  }
  return <PageFrame lang={lang} eyebrow={t.eyebrow} title={t.title} description={t.description}>
    <div className="avofis-card max-w-lg rounded-[18px] border p-5 sm:p-7">
      {message?<p role="status" className="rounded-lg border border-[#dfbf59]/20 bg-[#071738] p-4 text-[13px] leading-[1.8] text-[#DCE3F1]">{message}</p>:<form onSubmit={submit} className="space-y-4">
        <label className="avofis-form-label block">{t.email}<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} className="avofis-field"/></label>
        <button disabled={busy} className="avofis-cta avofis-btn w-full disabled:opacity-50">{busy?t.busy:t.submit}</button>
      </form>}
      <Link href={"/auth/login?lang="+lang} className="mt-5 inline-flex min-h-11 items-center text-[13px] font-semibold text-[#dfbf59]">{t.back}</Link>
    </div>
  </PageFrame>;
}
