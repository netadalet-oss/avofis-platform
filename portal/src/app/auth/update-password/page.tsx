"use client";
import { useEffect,useState,type FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { PageFrame } from "@/components/avofis/PageFrame";

export default function UpdatePasswordPage(){
  const [ready,setReady]=useState(false),[checking,setChecking]=useState(true);
  const [password,setPassword]=useState(""),[busy,setBusy]=useState(false);
  const [error,setError]=useState(""),[done,setDone]=useState(false);
  useEffect(()=>{
    let mounted=true;
    void supabase.auth.getSession().then(({data})=>{if(mounted){setReady(!!data.session);setChecking(false);}});
    const {data}=supabase.auth.onAuthStateChange((event,session)=>{
      if(event==="PASSWORD_RECOVERY"||event==="SIGNED_IN"){setReady(!!session);setChecking(false);}
    });
    return ()=>{mounted=false;data.subscription.unsubscribe();};
  },[]);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();if(password.length<12)return;setBusy(true);setError("");
    const {error}=await supabase.auth.updateUser({password});
    if(error)setError("Parola güncellenemedi. Yenileme bağlantısını kontrol edin.");
    else setDone(true);
    setBusy(false);
  }
  return <PageFrame eyebrow="HESAP GÜVENLİĞİ" title="Yeni parola belirleyin" description="Yeni parolanız en az 12 karakterden oluşmalıdır.">
    <div className="avofis-card max-w-lg rounded-[18px] border p-5 sm:p-7">
      {checking?<p className="text-[13px] text-[#B9C5DF]">Yenileme bağlantısı kontrol ediliyor…</p>
      :done?<div role="status"><p className="text-[15px] font-semibold text-[#F2F5FF]">Parolanız güncellendi.</p><Link href="/auth/login" className="mt-3 inline-flex min-h-10 items-center text-[13px] font-semibold text-[#dfbf59]">Giriş yapın</Link></div>
      :!ready?<div role="alert"><p className="text-[13px] leading-[1.8] text-[#B9C5DF]">Bağlantı geçersiz veya süresi dolmuş olabilir. Yeni bir parola yenileme bağlantısı isteyin.</p><Link href="/auth/forgot-password" className="mt-4 inline-flex min-h-10 items-center text-[13px] font-semibold text-[#dfbf59]">Yeni bağlantı iste</Link></div>
      :<form onSubmit={submit} className="space-y-4">
        <label className="avofis-form-label block">Yeni parola<input type="password" autoComplete="new-password" minLength={12} required value={password} onChange={e=>setPassword(e.target.value)} className="avofis-field"/></label>
        {error&&<p role="alert" className="rounded-lg border border-red-400/25 bg-red-950/30 p-3 text-[13px] text-red-200">{error}</p>}
        <button disabled={busy||password.length<12} className="avofis-cta avofis-btn w-full disabled:opacity-50">{busy?"Kaydediliyor…":"Parolayı güncelle"}</button>
      </form>}
    </div>
  </PageFrame>;
}
