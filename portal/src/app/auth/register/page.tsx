"use client";
import { useState,type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { PageFrame } from "@/components/avofis/PageFrame";

const enabled=process.env.NEXT_PUBLIC_AVOFIS_CLIENT_PORTAL_ENABLED==="true";
export default function RegisterPage(){
 const router=useRouter();
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
    if(error){setError("Hesap oluşturulamadı: "+error.message);return;}
    if(data.session){router.replace("/musteri");router.refresh();return;}
    setSuccess("Hesabı doğrulamak için e-postanıza gönderilen bağlantıyı kullanın.");
  }catch{setError("Kayıt işlemi tamamlanamadı. Lütfen tekrar deneyin.");}
  finally{setBusy(false);}
 }
 return <PageFrame eyebrow="MÜŞTERİ ALANI" title="Müşteri hesabı oluşturun" description="Hesap, yalnızca yetkilendirilmiş dosya işlemlerine erişim sağlar; tek başına bir hizmet sözleşmesi veya ücretli başvuru oluşturmaz.">
   <div className="avofis-card max-w-lg rounded-[18px] border p-5 sm:p-7">
    {!enabled?<div role="status" className="rounded-xl border border-[#dfbf59]/20 bg-[#071738] p-5">
      <p className="text-[15px] font-semibold text-[#F2F5FF]">Hesap açılışı henüz etkin değil.</p>
      <p className="mt-2 text-[13px] leading-[1.8] text-[#B9C5DF]">Şirket kuruluşu ve veri güvenliği hazırlıkları tamamlandığında müşteri kaydı açılacaktır.</p>
    </div>:success?<p role="status" className="rounded-lg border border-[#dfbf59]/20 bg-[#071738] p-4 text-[13px] leading-6 text-[#F2F5FF]">{success}</p>:<form onSubmit={submit} className="space-y-4">
      <label className="block text-[13px] font-semibold text-[#E6ECF7]">Ad soyad<input type="text" autoComplete="name" required maxLength={100} value={name} onChange={e=>setName(e.target.value)} className="avofis-field"/></label>
      <label className="block text-[13px] font-semibold text-[#E6ECF7]">E-posta adresi<input type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} className="avofis-field"/></label>
      <label className="block text-[13px] font-semibold text-[#E6ECF7]">Parola (en az 12 karakter)<input type="password" autoComplete="new-password" minLength={12} required value={password} onChange={e=>setPassword(e.target.value)} className="avofis-field"/></label>
      <label className="flex items-start gap-3 text-[13px] leading-[1.7] text-[#DCE3F1]"><input className="mt-1 h-4 w-4 shrink-0" type="checkbox" checked={agreed} required onChange={e=>setAgreed(e.target.checked)}/><span><Link href="/gizlilik" className="font-semibold text-[#dfbf59] underline">Gizlilik bilgilendirmesini</Link> okudum ve hesap bilgilerimin işlenmesine ilişkin açıklamayı anladım.</span></label>
      {error&&<p role="alert" className="rounded-lg border border-red-400/30 bg-red-950/30 p-3 text-[13px] text-red-200">{error}</p>}
      <button disabled={busy||!agreed} className="avofis-cta avofis-btn w-full disabled:cursor-not-allowed disabled:opacity-50">{busy?"Kaydediliyor…":"Hesap oluştur"}</button>
    </form>}
    <p className="mt-5 border-t border-[#dfbf59]/15 pt-4 text-[13px] text-[#B9C5DF]">Zaten hesabınız var mı? <Link href="/auth/login" className="font-semibold text-[#dfbf59]">Giriş yapın</Link></p>
   </div>
 </PageFrame>;
}
