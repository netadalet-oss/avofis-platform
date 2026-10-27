"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { ArrowLeft, FilePlus2, Inbox, LockKeyhole, MessageSquareText, RefreshCw, ShieldCheck } from "lucide-react";

type Lead={id:string;full_name:string;email:string;service_key:string;country:string;summary:string;status:string;created_at:string;};
type Matter={id:string;client_user_id:string;title:string;service_key:string;price_eur_cents:number;status:string;created_at:string;};
type Conversation={id:string;case_id:string;sender_id:string;body:string;created_at:string;};
type Payment={id:string;case_id:string;status:string;amount_eur_cents:number;};
export default function ManagementPage(){
 const {user,loading:authLoading}=useUser();
 const [isStaff,setIsStaff]=useState<boolean|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState("");
 const [leads,setLeads]=useState<Lead[]>([]),[cases,setCases]=useState<Matter[]>([]),[messages,setMessages]=useState<Conversation[]>([]),[payments,setPayments]=useState<Payment[]>([]);
 const [userId,setUserId]=useState(""),[title,setTitle]=useState(""),[service,setService]=useState("documents"),[price,setPrice]=useState("0.00");
 const [chosen,setChosen]=useState(""),[agreementText,setAgreementText]=useState(""),[version,setVersion]=useState("2026-10-v1"),[note,setNote]=useState("");
 const [busy,setBusy]=useState(false);
 const ready=process.env.NEXT_PUBLIC_AVOFIS_CLIENT_PORTAL_ENABLED==="true";
 async function load(){
  setLoading(true);setError("");
  const results=await Promise.all([
    supabase.from("avofis_leads").select("id,full_name,email,service_key,country,summary,status,created_at").order("created_at",{ascending:false}).limit(100),
    supabase.from("avofis_cases").select("id,client_user_id,title,service_key,price_eur_cents,status,created_at").order("created_at",{ascending:false}).limit(100),
    supabase.from("avofis_messages").select("id,case_id,sender_id,body,created_at").order("created_at",{ascending:false}).limit(200),
    supabase.from("avofis_payments").select("id,case_id,status,amount_eur_cents").order("created_at",{ascending:false}).limit(100)
  ]);
  if(results.some(x=>x.error))setError("Yönetim kayıtları okunamadı. Veritabanı politikalarını kontrol edin.");
  else {setLeads(results[0].data as Lead[]||[]);setCases(results[1].data as Matter[]||[]);setMessages(results[2].data as Conversation[]||[]);setPayments(results[3].data as Payment[]||[]);}
  setLoading(false);
 }
 useEffect(()=>{if(!user){setIsStaff(null);return;}void (async()=>{const {data,error}=await supabase.from("avofis_staff").select("role").eq("user_id",user.id).maybeSingle();setIsStaff(!error&&!!data);if(data)await load();})();},[user?.id]);
 async function createMatter(e:FormEvent){
  e.preventDefault();
  if(!isStaff||!ready)return;
  const cents=Math.round(Number(price)*100);
  if(!/^[0-9a-f-]{36}$/i.test(userId)||!title.trim()||!Number.isInteger(cents)||cents<0||cents>10000000){setError("Geçerli müşteri UUID, ad ve ücret giriniz.");return;}
  setBusy(true);setError("");
  const {error}=await supabase.from("avofis_cases").insert({client_user_id:userId.trim(),title:title.trim().slice(0,160),service_key:service,price_eur_cents:cents,status:"awaiting_agreement"});
  if(error)setError(error.message);else {setTitle("");setUserId("");await load();}setBusy(false);
 }
 async function createAgreement(e:FormEvent){
  e.preventDefault();if(!isStaff||!ready||!chosen||agreementText.trim().length<50)return;
  setBusy(true);setError("");
  const {error}=await supabase.from("avofis_agreements").insert({case_id:chosen,agreement_version:version.trim(),legal_text:agreementText.trim()});
  if(error)setError("Sözleşme oluşturulamadı: "+error.message);else {setAgreementText("");await load();}setBusy(false);
 }
 async function sendMessage(e:FormEvent){
  e.preventDefault();if(!user||!chosen||!note.trim())return;
  setBusy(true);
  const {error}=await supabase.from("avofis_messages").insert({sender_id:user.id,case_id:chosen,body:note.trim().slice(0,1500)});
  setError(error?error.message:"");if(!error){setNote("");await load();}setBusy(false);
 }
 async function markLead(id:string,status:string){
   const {error}=await supabase.from("avofis_leads").update({status}).eq("id",id);
   if(error)setError(error.message);else await load();
 }
 async function setCaseStatus(id:string,status:string){
   const {error}=await supabase.from("avofis_cases").update({status}).eq("id",id);
   if(error)setError(error.message);else await load();
 }
 return <main className="min-h-screen bg-[#F7F6F2] text-[#173943]"><div className="mx-auto max-w-6xl px-5 py-12">
 <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold"><ArrowLeft className="h-4 w-4"/>AVOfis</Link>
 <p className="mt-12 text-xs font-semibold tracking-[.2em] text-[#B08855]">YETKİLİ PERSONEL</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.06em]">Dosya yönetimi</h1><p className="mt-4 text-sm leading-7 text-[#68817A]">Yalnızca veritabanında bağımsız olarak yetkilendirilmiş personel. Kayıt formundaki rol seçimi yönetim yetkisi vermez.</p>
 {!ready?<div className="mt-9 rounded-2xl bg-white p-7"><LockKeyhole className="h-7 w-7"/><p className="mt-3">Yönetim paneli henüz kullanıma açılmadı.</p></div>:
 authLoading?<p className="mt-9">Hesap kontrol ediliyor...</p>:
 !user?<Link className="mt-9 inline-block rounded-full bg-[#173A43] px-5 py-3 text-white" href="/auth/login">Giriş yap</Link>:
 isStaff===null?<p className="mt-9">Yetki kontrol ediliyor...</p>:
 !isStaff?<p className="mt-9 rounded-2xl bg-white p-7 text-sm">Bu hesap yönetici değil. Yetki, Supabase veritabanındaki avofis_staff kayıtlarıyla tanımlanır.</p>:
 <div className="mt-9 space-y-7">
 {error&&<div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
 <div className="flex gap-3"><button onClick={()=>void load()} className="inline-flex items-center gap-2 rounded-full border border-[#BFD1C8] px-4 py-2 text-sm"><RefreshCw className="h-4 w-4"/>Yenile</button><p className="text-xs text-[#7B8D86]">Başvuru: {leads.length} · Dosya: {cases.length}</p></div>
 <section className="rounded-3xl bg-white p-6"><h2 className="flex items-center gap-2 text-xl font-semibold"><Inbox className="h-5 w-5"/> Ön başvurular</h2><div className="mt-5 space-y-3">{leads.map(l=><div key={l.id} className="rounded-xl border border-[#E0EAE1] p-4"><div className="flex flex-wrap justify-between gap-3"><div><p className="font-semibold">{l.full_name} · {l.service_key}</p><p className="mt-1 text-xs text-[#5F7874]">{l.email} · {l.country} · {new Date(l.created_at).toLocaleDateString("tr-TR")}</p><p className="mt-2 break-words text-sm">{l.summary}</p></div><select value={l.status} onChange={e=>void markLead(l.id,e.target.value)} className="h-10 rounded-lg border border-[#BBD0C3] px-2 text-sm"><option value="new">Yeni</option><option value="reviewed">İncelendi</option><option value="closed">Kapatıldı</option></select></div></div>)}{!leads.length&&<p className="text-sm text-[#6D807A]">Başvuru yok.</p>}</div></section>
 <section className="rounded-3xl bg-white p-6"><h2 className="flex items-center gap-2 text-xl font-semibold"><FilePlus2 className="h-5 w-5"/> Müşteri dosyası aç</h2><p className="mt-2 text-xs leading-6 text-[#6D807A]">Müşterinin e-postası doğrulanmış Supabase Auth hesabındaki UUID, müşteri tarafından güvenli panelden paylaşılabilir. Doğrulama ve sözleşme kontrollerini atlamayın.</p><form onSubmit={createMatter} className="mt-5 grid gap-3 md:grid-cols-2"><input aria-label="Müşteri UUID" value={userId} onChange={e=>setUserId(e.target.value)} required placeholder="Müşteri kullanıcı UUID" className="rounded-xl border border-[#CCDCD1] p-3"/><input aria-label="Dosya başlığı" value={title} onChange={e=>setTitle(e.target.value)} required placeholder="Dosya adı" className="rounded-xl border border-[#CCDCD1] p-3"/><select aria-label="Hizmet" value={service} onChange={e=>setService(e.target.value)} className="rounded-xl border border-[#CCDCD1] p-3"><option value="documents">Belge ve apostil</option><option value="administration">İdarî işlemler</option><option value="diplomas">Diploma</option><option value="business">Şirket kuruluş</option><option value="translation">Tercüme</option><option value="expert">Uzman koordinasyonu</option></select><input aria-label="EUR hizmet bedeli" type="number" min="0" max="100000" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} className="rounded-xl border border-[#CCDCD1] p-3"/><button disabled={busy} className="rounded-full bg-[#173A43] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">Dosya oluştur</button></form></section>
 <section className="rounded-3xl bg-white p-6"><h2 className="text-xl font-semibold">Açık dosyalar ve sözleşme</h2><div className="mt-4 space-y-3">{cases.map(c=><div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#F1F5F0] p-4"><div><p className="font-semibold">{c.title}</p><p className="mt-1 break-all text-xs text-[#71877C]">Dosya {c.id} · Müşteri {c.client_user_id}</p><p className="mt-1 text-xs">{(c.price_eur_cents/100).toFixed(2)} € · Ödeme {payments.filter(p=>p.case_id===c.id).map(p=>p.status).join(", ")||"yok"}</p></div><select value={c.status} onChange={e=>void setCaseStatus(c.id,e.target.value)} className="rounded-lg border border-[#BBCFC3] px-3 py-2 text-sm">{["review","awaiting_agreement","open","completed","closed"].map(v=><option key={v} value={v}>{v}</option>)}</select></div>)}</div><form onSubmit={createAgreement} className="mt-6 space-y-3"><h3 className="font-semibold">Sözleşme oluştur</h3><select required value={chosen} onChange={e=>setChosen(e.target.value)} className="w-full rounded-xl border border-[#CDDDD2] p-3"><option value="">Dosya seçiniz</option>{cases.map(c=><option value={c.id} key={c.id}>{c.title} · {c.id.slice(0,8)}</option>)}</select><input aria-label="Sözleşme sürümü" value={version} onChange={e=>setVersion(e.target.value)} className="w-full rounded-xl border border-[#CDDDD2] p-3"/><textarea required minLength={50} maxLength={25000} rows={7} placeholder="Hukuk ve tüketici şartları uzmanı tarafından onaylanmış, kapsam, ücret, KDV ve cayma koşulları yazılmış sözleşme metnini buraya yerleştirin." value={agreementText} onChange={e=>setAgreementText(e.target.value)} className="w-full rounded-xl border border-[#CDDDD2] p-3 text-sm"/><button disabled={busy} className="rounded-full bg-[#173A43] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">Sözleşmeyi dosyaya ekle</button></form></section>
 <section className="rounded-3xl bg-white p-6"><h2 className="flex items-center gap-2 text-xl font-semibold"><MessageSquareText className="h-5 w-5"/> Mesajlar</h2><div className="mt-4 max-h-80 space-y-2 overflow-auto">{messages.filter(m=>!chosen||m.case_id===chosen).map(m=><div key={m.id} className="rounded-xl bg-[#F2F6F2] p-3 text-sm"><p className="text-xs text-[#5B7D74]">{m.case_id.slice(0,8)} · {m.sender_id.slice(0,8)} · {new Date(m.created_at).toLocaleString("tr-TR")}</p><p className="mt-2 whitespace-pre-wrap break-words">{m.body}</p></div>)}</div><form onSubmit={sendMessage} className="mt-4"><p className="mb-2 text-xs text-[#618079]">Mesaj göndermek için yukarıdan dosya seçiniz.</p><textarea rows={3} maxLength={1500} value={note} onChange={e=>setNote(e.target.value)} className="w-full rounded-xl border border-[#CDDDD2] p-3"/><button disabled={busy||!chosen||!note.trim()} className="mt-3 rounded-full bg-[#173A43] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">Müşteriye mesaj</button></form></section>
 </div>}
 </div></main>;
}
