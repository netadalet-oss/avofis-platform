"use client";
import {useCallback,useEffect,useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase";
type TotpSetup={factorId:string;qr:string;secret:string};
const mayEnroll=process.env.NEXT_PUBLIC_AVOFIS_STAFF_MFA_ENROLLMENT_ENABLED==="true";
export default function StaffMfaPage(){
 const router=useRouter();
 const [factorId,setFactorId]=useState("");
 const [setup,setSetup]=useState<TotpSetup|null>(null);
 const [code,setCode]=useState("");
 const [busy,setBusy]=useState(false);
 const [message,setMessage]=useState("");
 const [ready,setReady]=useState(false);
 const [hasFactor,setHasFactor]=useState(false);
 const examine=useCallback(async()=>{
  setMessage("");
  const {data:{user},error}=await supabase.auth.getUser();
  if(error||!user){router.replace("/login");return;}
  const {data:staff,error:roleError}=await supabase.from("avofis_staff")
   .select("role").eq("user_id",user.id).maybeSingle();
  if(roleError||!staff||!["admin","operator"].includes(staff.role)){
   await supabase.auth.signOut();router.replace("/login");return;
  }
  const {data:aal,error:aalError}=await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if(aalError||!aal){setMessage("İkinci faktör doğrulama durumu alınamadı.");return;}
  if(aal.currentLevel==="aal2"){router.replace("/dashboard");return;}
  const {data:factors,error:factorError}=await supabase.auth.mfa.listFactors();
  if(factorError||!factors){setMessage("Doğrulama cihazları şu anda görüntülenemiyor.");return;}
  const existing=factors.totp?.find(f=>f.status==="verified");
  if(existing){setFactorId(existing.id);setHasFactor(true);}
  else {setFactorId("");setHasFactor(false);}
  setReady(true);
 },[router]);
 useEffect(()=>{void examine();},[examine]);
 async function enroll(){
  if(!mayEnroll||busy)return;
  setBusy(true);setMessage("");
  try{
   const {data,error}=await supabase.auth.mfa.enroll({factorType:"totp",friendlyName:"AVOfis Personel"});
   if(error||!data?.totp){setMessage("Doğrulama kurulumu başlatılamadı.");return;}
   setSetup({factorId:data.id,qr:data.totp.qr_code,secret:data.totp.secret});
   setFactorId(data.id);
  }catch{setMessage("Kurulum şu anda yapılamıyor.");}
  finally{setBusy(false);}
 }
 async function verify(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();if(busy||!/^[0-9]{6}$/.test(code)||!factorId)return;
  setBusy(true);setMessage("");
  try{
   const {error}=await supabase.auth.mfa.challengeAndVerify({factorId,code});
   if(error){setMessage("Kod doğrulanamadı. Lütfen kimlik doğrulama uygulamanızdaki güncel kodu kullanınız.");return;}
   setCode("");setSetup(null);
   const {data,error:aalError}=await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
   if(aalError||data?.currentLevel!=="aal2"){
    setMessage("İkinci faktör doğrulaması henüz tamamlanmadı.");return;
   }
   router.replace("/dashboard");router.refresh();
  }catch{setMessage("Doğrulama işlemi şu anda tamamlanamadı.");}
  finally{setBusy(false);}
 }
 return <main className="min-h-screen bg-[#F4F7FB] px-5 py-12 text-[#172B43]">
  <div className="mx-auto w-full max-w-[480px] rounded-2xl border border-[#DEE7F0] bg-white px-7 py-9 shadow-sm sm:px-9">
   <div className="flex items-center justify-between">
    <Link href="/login" className="text-xl font-semibold tracking-tight">AVOfis<span className="text-[#B59A62]">.</span></Link>
    <span className="rounded-full bg-[#F1F5F9] px-3 py-1 text-[11px] font-medium text-[#5F7186]">Personel güvenliği</span>
   </div>
   <h1 className="mt-9 text-[23px] font-semibold">İki aşamalı kimlik doğrulama</h1>
   <p className="mt-3 text-[13px] leading-7 text-[#62768C]">Görev, dosya, mesaj ve mali kayıtlarınıza erişim için hesabınıza bağlı ikinci faktörün doğrulanması gereklidir.</p>
   {!ready?<p role="status" className="mt-7 text-[13px] text-[#64778B]">Hesap ve doğrulama durumu inceleniyor…</p>:
    hasFactor?<p className="mt-6 text-[12px] leading-6 text-[#526B81]">Kimlik doğrulama uygulamanızda görünen altı haneli kodu giriniz.</p>:
    !mayEnroll?<p role="status" className="mt-6 rounded-lg border border-[#EADBBE] bg-[#FFFAF0] px-4 py-3 text-[12px] leading-6 text-[#715B31]">
      Hesabınıza ait ikinci faktörün kurulumu, güvenli personel staging ortamı yetkilendirilince etkinleştirilecektir. Bu süre içinde özel kayıtlar açılmaz.
     </p>:
    !setup?<button type="button" onClick={()=>void enroll()} disabled={busy}
      className="mt-6 rounded-lg bg-[#193B5C] px-5 py-3 text-[12px] font-semibold text-white disabled:opacity-50">Kimlik doğrulama uygulaması kur</button>:
    <div className="mt-6 rounded-xl border border-[#DCE5EE] p-4">
     <p className="text-[12px] leading-6 text-[#5A6F85]">QR kodunu kişisel kimlik doğrulama uygulamanızla tarayın; kod yalnız bu oturumda görüntülenir.</p>
     {setup.qr.startsWith("data:image/")&&<img src={setup.qr} alt="Kimlik doğrulama uygulaması için QR kodu" width={192} height={192}
       className="mx-auto my-4 h-48 w-48 rounded-lg border border-[#E6EDF4] bg-white p-2"/>}
     <p className="text-[11px] text-[#6B7D91]">QR kodu açılamazsa aşağıdaki kurulum anahtarını doğrulama uygulamanıza yazabilirsiniz. Bu anahtarı kimseyle paylaşmayın.</p>
     <code className="mt-2 block select-all break-all rounded-lg bg-[#F4F6F9] p-3 text-[11px]">{setup.secret}</code>
    </div>}
   {ready&&(hasFactor||Boolean(setup))&&<form onSubmit={e=>void verify(e)} className="mt-6">
    <label htmlFor="totp-code" className="block text-[12px] font-semibold">Doğrulama kodu</label>
    <input id="totp-code" value={code} onChange={e=>setCode(e.target.value.replace(/[^0-9]/g,"").slice(0,6))}
      type="text" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required
      className="mt-2 w-full rounded-lg border border-[#D2DCE7] px-4 py-3 text-[18px] tracking-[.25em] outline-none focus:border-[#24547A]"/>
    <button type="submit" disabled={busy||code.length!==6} className="mt-4 w-full rounded-lg bg-[#193B5C] px-4 py-3 text-[13px] font-semibold text-white disabled:opacity-50">
     {busy?"Doğrulanıyor…":"İkinci faktörü doğrula"}</button>
   </form>}
   {message&&<p role="alert" className="mt-5 rounded-lg border border-[#EAD9C0] bg-[#FFFAF1] p-3 text-[12px] leading-6 text-[#765A2E]">{message}</p>}
   <p className="mt-8 text-[11px] leading-6 text-[#8693A2]">DigiD, eHerkenning veya advocatenpas bilgileri bu alana girilmez. Personel oturumu resmî kurum yetkisi vermez.</p>
  </div>
 </main>;
}
