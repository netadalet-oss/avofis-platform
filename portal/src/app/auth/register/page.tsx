"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function RegisterPage(){
 const router=useRouter();
 const enabled=process.env.NEXT_PUBLIC_AVOFIS_CLIENT_PORTAL_ENABLED==="true";
 const [name,setName]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[agree,setAgree]=useState(false);
 const [loading,setLoading]=useState(false),[message,setMessage]=useState(""),[successful,setSuccessful]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(!enabled)return;if(!agree||name.trim().length<2||password.length<12)return;
  setLoading(true);setMessage("");
  const {data,error}=await supabase.auth.signUp({
   email:email.trim().toLowerCase(),
   password,
   options:{data:{full_name:name.trim(),role:"client"},emailRedirectTo:window.location.origin+"/musteri"}
  });
  if(error){setMessage("Hesap oluşturulamadı: "+error.message);}
  else if(data.session){setSuccessful(true);router.replace("/musteri");}
  else {setSuccessful(true);setMessage("Hesabınızı etkinleştirmek için e-postanızdaki doğrulama bağlantısını kullanın.");}
  setLoading(false);
 }
 return <main className="avofis-theme min-h-screen text-[#F2F5FF]"><div className="mx-auto max-w-lg px-5 py-9 sm:py-12"><Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold"><ArrowLeft className="h-4 w-4"/> AVOfis</Link>
 <div className="mt-8 rounded-[20px] border border-[#dfbf59]/25 avofis-card p-5 sm:p-6"><p className="text-xs font-bold tracking-[.2em] text-[#dfbf59]">MÜŞTERİ HESABI</p><h1 className="mt-4 text-3xl font-semibold tracking-[-.05em]">Hesap oluşturun.</h1><p className="mt-4 text-sm leading-7 text-[#B9C5DF]">Kayıt hesabınızı oluşturur; dosya kabulü ve ücretli hizmet sözleşmesi yerine geçmez. Hizmetler yalnızca açılış koşulları tamamlandığında etkinleştirilir.</p>
 {!enabled?<div role="status" className="mt-7 rounded-xl bg-[#071738] p-5 text-sm text-[#dfbf59]">Müşteri hesap açılışı henüz etkinleştirilmedi. Şirket ve veri koruma koşullarının tamamlanması bekleniyor.</div>:successful?<div className="mt-7 rounded-xl bg-[#071738] p-5 text-sm text-[#dfbf59]" role="status">{message||"Kayıt tamamlandı. Müşteri alanına yönlendiriliyorsunuz."}</div>:<form onSubmit={submit} className="mt-7 space-y-4">
 <label className="block text-sm font-semibold">Ad soyad<input autoComplete="name" value={name} onChange={e=>setName(e.target.value)} maxLength={100} required className="avofis-field mt-2 w-full rounded-xl border border-[#dfbf59]/25 avofis-card p-3.5 font-normal"/></label>
 <label className="block text-sm font-semibold">E-posta<input autoComplete="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} maxLength={254} required className="avofis-field mt-2 w-full rounded-xl border border-[#dfbf59]/25 avofis-card p-3.5 font-normal"/></label>
 <label className="block text-sm font-semibold">Parola (en az 12 karakter)<input autoComplete="new-password" type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={12} required className="avofis-field mt-2 w-full rounded-xl border border-[#dfbf59]/25 avofis-card p-3.5 font-normal"/></label>
 <label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" checked={agree} required onChange={e=>setAgree(e.target.checked)} className="mt-1 h-4 w-4"/><span><Link href="/gizlilik" className="font-semibold underline">Gizlilik açıklamasını</Link> okudum. Hesap oluşturulması için gerekli verilerin işlenmesi hakkında bilgilendirildim.</span></label>
 {message&&<p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{message}</p>}
 <button disabled={loading||!agree} className="w-full rounded-xl avofis-cta avofis-btn text-sm font-semibold text-white disabled:opacity-50">{loading?"Kaydediliyor...":"Hesap oluştur"}</button>
 </form>}
 <p className="mt-7 text-center text-sm text-[#B9C5DF]">Zaten hesabınız var mı? <Link href="/auth/login" className="font-semibold underline">Giriş yapın</Link></p>
 </div><p className="mt-6 flex items-start gap-2 text-xs leading-6 text-[#B9C5DF]"><ShieldCheck className="mt-1 h-4 w-4 shrink-0"/> Hukukî hizmet yetkisi ve müşteri dosya sistemi birbirinden ayrı değerlendirilir.</p>
 </div></main>;
}
