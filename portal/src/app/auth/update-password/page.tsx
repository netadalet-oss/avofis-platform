"use client";
import { useEffect,useState,type FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { publicCustomerTransactionsAuthorized } from "@/lib/public-release-status";
import { PUBLIC_ACCOUNT_LOGIN_ENABLED } from "@/lib/launch-gates";
import { PageFrame } from "@/components/avofis/PageFrame";
import { usePortalLanguage } from "@/hooks/usePortalLanguage";
import { accountText } from "@/lib/account-text";

export default function UpdatePasswordPage(){
  const lang=usePortalLanguage(),t=accountText[lang].update;
  const enabled=publicCustomerTransactionsAuthorized && PUBLIC_ACCOUNT_LOGIN_ENABLED;
  const [ready,setReady]=useState(false),[checking,setChecking]=useState(true);
  const [password,setPassword]=useState(""),[busy,setBusy]=useState(false);
  const [error,setError]=useState(""),[done,setDone]=useState(false);
  useEffect(()=>{
    if(!enabled){setReady(false);setChecking(false);return;}
    let mounted=true;
    void supabase.auth.getSession().then(({data})=>{if(mounted){setReady(!!data.session);setChecking(false);}});
    const {data}=supabase.auth.onAuthStateChange((event,session)=>{
      if(event==="PASSWORD_RECOVERY"||event==="SIGNED_IN"){setReady(!!session);setChecking(false);}
    });
    return ()=>{mounted=false;data.subscription.unsubscribe();};
  },[]);
  async function submit(e:FormEvent<HTMLFormElement>){
    e.preventDefault();if(!enabled||password.length<12)return;setBusy(true);setError("");
    const {error}=await supabase.auth.updateUser({password});
    if(error)setError(t.error);
    else setDone(true);
    setBusy(false);
  }
  return <PageFrame lang={lang} eyebrow={t.eyebrow} title={t.title} description={t.description}>
    <div className="avofis-card max-w-lg rounded-[18px] border p-5 sm:p-7">
      {!enabled?<p role="status" className="text-[13px] leading-7 text-[#B9C5DF]">Müşteri hesabı ve parola güncelleme işlemleri bağımsız güvenlik ve hukukî onay tamamlanana kadar kapalıdır. Bu ekranda parola veya kişisel bilgi istenmez.</p>
      :checking?<p className="text-[13px] text-[#B9C5DF]">{t.checking}</p>
      :done?<div role="status"><p className="text-[15px] font-semibold text-[#F2F5FF]">{t.done}</p><Link href={"/auth/login?lang="+lang} className="mt-3 inline-flex min-h-11 items-center text-[13px] font-semibold text-[#dfbf59]">{t.login}</Link></div>
      :!ready?<div role="alert"><p className="text-[13px] leading-[1.8] text-[#B9C5DF]">{t.invalid}</p><Link href={"/auth/forgot-password?lang="+lang} className="mt-4 inline-flex min-h-11 items-center text-[13px] font-semibold text-[#dfbf59]">{t.renew}</Link></div>
      :<form onSubmit={submit} className="space-y-4">
        <label className="avofis-form-label block">{t.password}<input type="password" autoComplete="new-password" minLength={12} required value={password} onChange={e=>setPassword(e.target.value)} className="avofis-field"/></label>
        {error&&<p role="alert" className="rounded-lg border border-red-400/25 bg-red-950/30 p-3 text-[13px] text-red-200">{error}</p>}
        <button disabled={busy||password.length<12} className="avofis-cta avofis-btn w-full disabled:opacity-50">{busy?t.busy:t.submit}</button>
      </form>}
    </div>
  </PageFrame>;
}
