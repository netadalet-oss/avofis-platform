"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function RegisterPage(){
 const router=useRouter();
 const [name,setName]=useState(""),[email,setEmail]=useState(""),[password,setPassword]=useState(""),[agree,setAgree]=useState(false);
 const [loading,setLoading]=useState(false),[message,setMessage]=useState(""),[successful,setSuccessful]=useState(false);
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(!agree||name.trim().length<2||password.length<12)return;
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
 return <main className="min-h-screen bg-[#F7F6F2] text-[#193A43]"><div className="mx-auto max-w-lg px-5 py-12 md:py-20"><Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold"><ArrowLeft className="h-4 w-4"/> AVOfis</Link>
 <div className="mt-12 rounded-[28px] border border-[#D8E4DC] bg-white p-7 md:p-10"><p className="text-xs font-bold tracking-[.2em] text-[#AA8254]">MÜŞTERİ HESABI</p><h1 className="mt-4 text-3xl font-semibold tracking-[-.05em]">Hesap oluşturun.</h1><p className="mt-4 text-sm leading-7 text-[#627D79]">Kayıt hesabınızı oluşturur; dosya kabulü ve ücretli hizmet sözleşmesi yerine geçmez. Hizmetler yalnızca açılış koşulları tamamlandığında etkinleştirilir.</p>
 {successful?<div className="mt-7 rounded-xl bg-[#EAF4ED] p-5 text-sm text-[#326A5A]" role="status">{message||"Kayıt tamamlandı. Müşteri alanına yönlendiriliyorsunuz."}</div>:<form onSubmit={submit} className="mt-7 space-y-5">
 <label className="block text-sm font-semibold">Ad soyad<input autoComplete="name" value={name} onChange={e=>setName(e.target.value)} maxLength={100} required className="mt-2 w-full rounded-xl border border-[#CBDCD0] bg-white p-3.5 font-normal"/></label>
 <label className="block text-sm font-semibold">E-posta<input autoComplete="email" type="email" value={email} onChange={e=>setEmail(e.target.value)} maxLength={254} required className="mt-2 w-full rounded-xl border border-[#CBDCD0] bg-white p-3.5 font-normal"/></label>
 <label className="block text-sm font-semibold">Parola (en az 12 karakter)<input autoComplete="new-password" type="password" value={password} onChange={e=>setPassword(e.target.value)} minLength={12} required className="mt-2 w-full rounded-xl border border-[#CBDCD0] bg-white p-3.5 font-normal"/></label>
 <label className="flex items-start gap-3 text-sm leading-6"><input type="checkbox" checked={agree} required onChange={e=>setAgree(e.target.checked)} className="mt-1 h-4 w-4"/><span><Link href="/gizlilik" className="font-semibold underline">Gizlilik açıklamasını</Link> okudum. Hesap oluşturulması için gerekli verilerin işlenmesi hakkında bilgilendirildim.</span></label>
 {message&&<p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{message}</p>}
 <button disabled={loading||!agree} className="w-full rounded-full bg-[#173A43] px-5 py-4 text-sm font-semibold text-white disabled:opacity-50">{loading?"Kaydediliyor...":"Hesap oluştur"}</button>
 </form>}
 <p className="mt-7 text-center text-sm text-[#627C76]">Zaten hesabınız var mı? <Link href="/auth/login" className="font-semibold underline">Giriş yapın</Link></p>
 </div><p className="mt-6 flex items-start gap-2 text-xs leading-6 text-[#627C76]"><ShieldCheck className="mt-1 h-4 w-4 shrink-0"/> Hukukî hizmet yetkisi ve müşteri dosya sistemi birbirinden ayrı değerlendirilir.</p>
 </div></main>;
}
