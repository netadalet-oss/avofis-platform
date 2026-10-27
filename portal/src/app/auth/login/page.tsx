"use client";
import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function LoginPage(){
 const router=useRouter();
 const [email,setEmail]=useState(""),[password,setPassword]=useState(""),[busy,setBusy]=useState(false),[error,setError]=useState("");
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();setBusy(true);setError("");
  try{const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});if(error){setError(error.message);return;}
    router.replace("/musteri");router.refresh();
  }catch{setError("Giriş yapılamadı. Lütfen tekrar deneyin.");}
  finally{setBusy(false);}
 }
 return <main className="avofis-theme min-h-screen bg-[#030A22] text-[#dfbf59]"><div className="mx-auto max-w-lg px-5 py-12 md:py-20">
 <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold"><ArrowLeft className="h-4 w-4"/>AVOfis</Link>
 <div className="mt-12 rounded-[28px] border border-[#dfbf59]/25 avofis-card p-7 md:p-10"><LockKeyhole className="h-7 w-7 text-[#dfbf59]"/><h1 className="mt-5 text-3xl font-semibold tracking-[-.05em]">Güvenli giriş</h1><p className="mt-3 text-sm leading-7 text-[#B9C5DF]">Müşteri dosyalarınıza, sözleşmelerinize ve mesajlarınıza hesabınızla erişin.</p>
 <form onSubmit={submit} className="mt-7 space-y-5"><label className="block text-sm font-semibold">E-posta<input type="email" autoComplete="email" value={email} onChange={e=>setEmail(e.target.value)} required className="mt-2 w-full rounded-xl border border-[#dfbf59]/25 avofis-card p-3.5 font-normal"/></label><label className="block text-sm font-semibold">Parola<input type="password" autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} required className="mt-2 w-full rounded-xl border border-[#dfbf59]/25 avofis-card p-3.5 font-normal"/></label>
 {error&&<p role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
 <button disabled={busy} className="w-full rounded-full avofis-cta px-5 py-4 text-sm font-semibold text-white disabled:opacity-50">{busy?"Giriş yapılıyor...":"Giriş yap"}</button></form>
 <div className="mt-7 flex flex-wrap justify-between gap-4 text-sm"><Link className="font-semibold underline" href="/auth/register">Yeni hesap oluştur</Link><Link className="font-semibold underline" href="/auth/forgot-password">Parolamı unuttum</Link></div></div></div></main>;
}
