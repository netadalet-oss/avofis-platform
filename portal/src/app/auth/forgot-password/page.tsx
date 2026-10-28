"use client";
import { useState,type FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { PageFrame } from "@/components/avofis/PageFrame";

export default function ForgotPasswordPage(){
  const [email,setEmail]=useState("");
  const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState("");
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();setBusy(true);setMessage("");
    const {error}=await supabase.auth.resetPasswordForEmail(email.trim(),{redirectTo:window.location.origin+"/auth/update-password"});
    setMessage(error?"İstek şu anda gönderilemedi. Lütfen tekrar deneyin.":"Bu adres kayıtlıysa parola yenileme bağlantısı e-postayla gönderilir.");
    setBusy(false);
  }
  return <PageFrame eyebrow="HESAP GÜVENLİĞİ" title="Parola yenileme" description="Hesabınıza yeniden erişebilmek için e-posta adresinizi girin.">
    <div className="avofis-card max-w-lg rounded-[18px] border p-5 sm:p-7">
      {message?<p role="status" className="rounded-lg border border-[#dfbf59]/20 bg-[#071738] p-4 text-[13px] leading-[1.8] text-[#DCE3F1]">{message}</p>:<form onSubmit={submit} className="space-y-4">
        <label className="avofis-form-label block">E-posta adresi<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} className="avofis-field"/></label>
        <button disabled={busy} className="avofis-cta avofis-btn w-full disabled:opacity-50">{busy?"Gönderiliyor…":"Yenileme bağlantısı gönder"}</button>
      </form>}
      <Link href="/auth/login" className="mt-5 inline-flex min-h-10 items-center text-[13px] font-semibold text-[#dfbf59]">Giriş sayfasına dön</Link>
    </div>
  </PageFrame>;
}
