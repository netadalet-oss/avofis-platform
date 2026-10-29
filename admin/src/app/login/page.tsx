"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import {supabase} from "@/lib/supabase";
export default function StaffLogin(){
 const router=useRouter();
 const [email,setEmail]=useState(""),[password,setPassword]=useState("");
 const [loading,setLoading]=useState(false),[error,setError]=useState("");
 async function enter(e:React.FormEvent<HTMLFormElement>){
  e.preventDefault();if(loading)return;setLoading(true);setError("");
  try{
   const {error:authErr}=await supabase.auth.signInWithPassword({email:email.trim(),password});
   if(authErr){setError("Giriş bilgileri doğrulanamadı. Lütfen hesabınızı kontrol ediniz.");return;}
   const {data:{user},error:userErr}=await supabase.auth.getUser();
   if(userErr||!user){setError("Oturum doğrulanamadı.");await supabase.auth.signOut();return;}
   const {data,error:roleErr}=await supabase.from("avofis_staff")
    .select("role").eq("user_id",user.id).maybeSingle();
   if(roleErr||!data||!["admin","operator"].includes(data.role)){
    await supabase.auth.signOut();
    setError("Bu hesap için etkin personel yetkisi bulunmuyor.");
    return;
   }
   router.replace("/dashboard");
  }catch{setError("Giriş şu anda tamamlanamadı. Lütfen daha sonra yeniden deneyiniz.");}
  finally{setLoading(false);}
 }
 return <main className="flex min-h-screen items-center justify-center bg-[#F3F6FA] px-5 py-12 text-[#1A2E45]">
  <div className="w-full max-w-[425px] rounded-2xl border border-[#DFE7EF] bg-white px-7 py-9 shadow-[0_20px_65px_rgba(15,40,70,.065)] sm:px-9">
   <div className="flex items-center justify-between">
    <span className="text-[23px] font-semibold tracking-tight">AVOfis<span className="text-[#AA8A45]">.</span></span>
    <span className="rounded-full bg-[#F0F4F8] px-3 py-1 text-[11px] font-medium text-[#5D738B]">Personel alanı</span>
   </div>
   <h1 className="mt-11 text-[24px] font-semibold tracking-tight">Güvenli personel girişi</h1>
   <p className="mt-2 text-[13px] leading-7 text-[#65778B]">Yalnızca kayıtlı ve yetkilendirilmiş çalışanlar, kendi hesaplarıyla görev alanlarına erişebilir.</p>
   <form onSubmit={e=>void enter(e)} className="mt-8 space-y-5">
    <div><label htmlFor="staff-email" className="block text-[12px] font-semibold">Kurumsal e-posta</label>
     <input id="staff-email" name="email" autoComplete="username" inputMode="email" type="email"
      value={email} onChange={e=>setEmail(e.target.value)} required maxLength={254}
      className="mt-2 w-full rounded-lg border border-[#D5DEEA] px-4 py-3 text-[13px] outline-none focus:border-[#315A83]" placeholder="ad.soyad@kurum.example"/>
    </div>
    <div><label htmlFor="staff-password" className="block text-[12px] font-semibold">Şifreniz</label>
     <input id="staff-password" name="password" type="password" autoComplete="current-password"
      value={password} onChange={e=>setPassword(e.target.value)} required
      className="mt-2 w-full rounded-lg border border-[#D5DEEA] px-4 py-3 text-[13px] outline-none focus:border-[#315A83]"/>
    </div>
    {error&&<p role="alert" className="rounded-lg border border-[#EED6D0] bg-[#FFF5F2] px-4 py-3 text-[12px] leading-6 text-[#8B4538]">{error}</p>}
    <button disabled={loading} type="submit" className="w-full rounded-lg bg-[#153A5B] py-3 text-[13px] font-semibold text-white hover:bg-[#205077] disabled:opacity-50">{loading?"Kimlik doğrulanıyor…":"Güvenli giriş"}</button>
   </form>
   <p className="mt-6 text-[11px] leading-6 text-[#7A8797]">Erişim, personel kaydı ve dosyaya özgü yetkiler ayrıca doğrulanır. Yetkisiz kişilerin iş kayıtlarına erişimi engellenir.</p>
  </div>
 </main>;
}
