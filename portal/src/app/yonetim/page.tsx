"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { PageFrame } from "@/components/avofis/PageFrame";
import { StaffDocumentRequests } from "@/components/avofis/StaffDocumentRequests";
import { StaffDeliverables } from "@/components/avofis/StaffDeliverables";
import { getJourney } from "@/lib/journeys";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { ArrowLeft, FilePlus2, Inbox, LockKeyhole, MessageSquareText, RefreshCw, ShieldCheck } from "lucide-react";

type Lead={id:string;full_name:string;email:string;service_key:string;country:string;summary:string;status:string;created_at:string;journey_key:string|null;intake_details:Record<string,string>|null;};
type Matter={id:string;client_user_id:string;title:string;service_key:string;price_eur_cents:number;status:string;created_at:string;};
type Conversation={id:string;case_id:string;sender_id:string;body:string;created_at:string;};
type Payment={id:string;case_id:string;status:string;amount_eur_cents:number;};
export default function ManagementPage(){
 const {user,loading:authLoading}=useUser();
 const [isStaff,setIsStaff]=useState<boolean|null>(null),[loading,setLoading]=useState(false),[error,setError]=useState("");
 const [leads,setLeads]=useState<Lead[]>([]),[cases,setCases]=useState<Matter[]>([]),[messages,setMessages]=useState<Conversation[]>([]),[payments,setPayments]=useState<Payment[]>([]);
 const [leadId,setLeadId]=useState(""),[title,setTitle]=useState(""),[price,setPrice]=useState("0.00");
 const [chosen,setChosen]=useState(""),[agreementText,setAgreementText]=useState(""),[version,setVersion]=useState("2026-10-v1"),[note,setNote]=useState("");
 const [busy,setBusy]=useState(false);
 const [fileNames,setFileNames]=useState<string[]>([]);
 const ready=process.env.NEXT_PUBLIC_AVOFIS_CLIENT_PORTAL_ENABLED==="true";
 useEffect(()=>{
  const selectedCase=cases.find(c=>c.id===chosen);
  if(!isStaff||!selectedCase){setFileNames([]);return;}
  void supabase.storage.from("avofis-private").list(selectedCase.id+"/"+selectedCase.client_user_id,{limit:100}).then(({data,error})=>{if(!error)setFileNames((data||[]).map(f=>f.name));});
 },[chosen,isStaff,cases]);
 async function openStaffFile(name:string){
  const selectedCase=cases.find(c=>c.id===chosen);if(!selectedCase)return;
  const path=selectedCase.id+"/"+selectedCase.client_user_id+"/"+name;
  const {data,error}=await supabase.storage.from("avofis-private").createSignedUrl(path,60);
  if(error||!data?.signedUrl){setError("Dosya bağlantısı açılamadı.");return;}
  window.open(data.signedUrl,"_blank","noopener,noreferrer");
 }

 async function load(){
  setLoading(true);setError("");
  const results=await Promise.all([
    supabase.from("avofis_leads").select("id,full_name,email,service_key,country,summary,status,created_at,journey_key,intake_details").order("created_at",{ascending:false}).limit(100),
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
  if(!leadId||title.trim().length<3||!Number.isInteger(cents)||cents<0||cents>10000000){setError("Başvuru seçin, dosya adını ve geçerli ücreti girin.");return;}
  setBusy(true);setError("");
  const {data,error}=await supabase.rpc("avofis_open_case_from_lead",{p_lead:leadId,p_title:title.trim(),p_price_eur_cents:cents});
  if(error)setError("Dosya açılamadı. Bu başvurunun e-posta adresiyle doğrulanmış müşteri hesabı ve daha önce açılmamış dosya gereklidir.");else {setTitle("");setLeadId("");setChosen(String(data||""));await load();}setBusy(false);
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
 return <PageFrame wide eyebrow="PERSONEL ALANI" title="Dosya ve başvuru yönetimi" description="Başvuruların değerlendirilmesi, hizmet sözleşmeleri ve müşteri dosyaları yalnızca yetkilendirilmiş personelin erişimine açıktır.">
 {!ready?<div className="mt-9 rounded-2xl avofis-card p-5"><LockKeyhole className="h-7 w-7"/><p className="mt-3">Personel alanı henüz açılmadı.</p></div>:
 authLoading?<p className="mt-9">Hesap kontrol ediliyor...</p>:
 !user?<Link className="mt-9 inline-block rounded-xl avofis-cta avofis-btn text-white" href="/auth/login">Giriş yap</Link>:
 isStaff===null?<p className="mt-9">Yetki kontrol ediliyor...</p>:
 !isStaff?<p className="mt-9 rounded-2xl avofis-card p-5 text-sm">Bu hesap için personel erişim yetkisi bulunmuyor.</p>:
 <div className="mt-9 space-y-4">
 {error&&<div role="alert" className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
 <div className="flex gap-3"><button onClick={()=>void load()} className="inline-flex items-center gap-2 rounded-full border border-[#dfbf59]/25 px-4 py-2 text-sm"><RefreshCw className="h-4 w-4"/>Yenile</button><p className="text-xs text-[#B9C5DF]">Başvuru: {leads.length} · Dosya: {cases.length}</p></div>
 <section className="rounded-[18px] avofis-card p-6"><h2 className="flex items-center gap-2 text-lg font-semibold"><Inbox className="h-5 w-5"/> Ön başvurular</h2><div className="mt-5 space-y-3">{leads.map(l=><div key={l.id} className="rounded-xl border border-[#dfbf59]/25 p-4"><div className="flex flex-wrap justify-between gap-3"><div><p className="font-semibold">{l.full_name} · {getJourney(l.journey_key||"")?.title.tr||l.service_key}</p><p className="mt-1 text-xs text-[#dfbf59]">{l.email} · {l.country} · {new Date(l.created_at).toLocaleDateString("tr-TR")}</p><p className="mt-2 break-words text-sm">{l.summary}</p><dl className="mt-3 space-y-1 text-[13px] text-[#B9C5DF]">{Object.entries(l.intake_details||{}).map(([key,value])=>{const field=getJourney(l.journey_key||"")?.fields.find(f=>f.key===key);return <div key={key}><dt className="inline font-semibold">{field?.label.tr||"İşlem bilgisi"}: </dt><dd className="inline">{field?.options.find(o=>o.value===value)?.label.tr||"Belirtilmedi"}</dd></div>;})}</dl></div><select value={l.status} onChange={e=>void markLead(l.id,e.target.value)} className="h-10 rounded-lg border border-[#dfbf59]/25 px-2 text-sm"><option value="new">Yeni</option><option value="reviewed">İncelendi</option><option value="closed">Kapatıldı</option></select></div></div>)}{!leads.length&&<p className="text-sm text-[#B9C5DF]">Başvuru yok.</p>}</div></section>
 <section className="rounded-[18px] avofis-card p-6"><h2 className="flex items-center gap-2 text-lg font-semibold"><FilePlus2 className="h-5 w-5"/> Müşteri dosyası aç</h2><p className="mt-2 text-xs leading-6 text-[#B9C5DF]">Başvuruyla aynı e-posta adresine sahip, e-postası doğrulanmış müşteri hesabı gereklidir. Rastgele kullanıcı numarası kullanılmaz.</p><form onSubmit={createMatter} className="mt-5 grid gap-3 md:grid-cols-2"><label className="text-[13px] font-semibold">İncelenen başvuru<select value={leadId} onChange={e=>setLeadId(e.target.value)} required className="avofis-field"><option value="">Başvuru seçiniz</option>{leads.filter(l=>l.status!=="closed").map(l=><option key={l.id} value={l.id}>{l.full_name} · {getJourney(l.journey_key||"")?.title.tr||l.service_key}</option>)}</select></label><label className="text-[13px] font-semibold">Dosya adı<input value={title} minLength={3} maxLength={160} onChange={e=>setTitle(e.target.value)} required placeholder="İşlem ve kapsamı" className="avofis-field"/></label><label className="text-[13px] font-semibold">Teklif için EUR hizmet bedeli<input type="number" min="0" max="100000" step="0.01" value={price} onChange={e=>setPrice(e.target.value)} required className="avofis-field"/></label><button disabled={busy||!leadId||title.trim().length<3} className="avofis-cta avofis-btn self-end disabled:opacity-50">Başvurudan dosya aç</button></form><p className="mt-3 text-[12px] leading-6 text-[#B9C5DF]">Müşterinin ön başvurudaki e-posta adresi ile doğrulanmış hesabı yoksa dosya açılamaz. Bu işlem yalnızca yetkili personel tarafından yapılır. Teklifte KDV, resmî harçlar ve üçüncü kişi giderleri ayrıca belirtilmelidir.</p></section>
 <section className="rounded-[18px] avofis-card p-6"><h2 className="text-lg font-semibold">Dosyalar ve sözleşmeler</h2><div className="mt-4 space-y-3">{cases.map(c=><div key={c.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#071738] p-4"><div><p className="font-semibold">{c.title}</p><p className="mt-1 break-all text-xs text-[#B9C5DF]">Dosya {c.id} · Müşteri {c.client_user_id}</p><p className="mt-1 text-xs">{(c.price_eur_cents/100).toFixed(2)} € · Ödeme: {payments.filter(p=>p.case_id===c.id).map(p=>({paid:"Ödendi",open:"Bekliyor",pending:"İşlemde",refunded:"İade edildi"} as Record<string,string>)[p.status]||p.status).join(", ")||"Kayıt yok"}</p></div><select value={c.status} onChange={e=>void setCaseStatus(c.id,e.target.value)} className="rounded-lg border border-[#dfbf59]/25 px-3 py-2 text-sm">{[["review","İncelemede"],["awaiting_agreement","Sözleşme bekleniyor"],["open","İşlemde"],["completed","Tamamlandı"],["closed","Kapandı"]].map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></div>)}</div><form onSubmit={createAgreement} className="mt-6 space-y-3"><h3 className="font-semibold">Sözleşme oluştur</h3><select required value={chosen} onChange={e=>setChosen(e.target.value)} className="w-full rounded-xl border border-[#dfbf59]/25 p-3"><option value="">Dosya seçiniz</option>{cases.map(c=><option value={c.id} key={c.id}>{c.title} · {c.id.slice(0,8)}</option>)}</select><input aria-label="Sözleşme sürümü" value={version} onChange={e=>setVersion(e.target.value)} className="w-full rounded-xl border border-[#dfbf59]/25 p-3"/><textarea required minLength={50} maxLength={25000} rows={7} placeholder="Hukuk ve tüketici şartları uzmanı tarafından onaylanmış, kapsam, ücret, KDV ve cayma koşulları yazılmış sözleşme metnini buraya yerleştirin." value={agreementText} onChange={e=>setAgreementText(e.target.value)} className="w-full rounded-xl border border-[#dfbf59]/25 p-3 text-sm"/><button disabled={busy} className="rounded-xl avofis-cta avofis-btn text-sm font-semibold text-white disabled:opacity-50">Sözleşmeyi dosyaya ekle</button></form></section>
 <StaffDocumentRequests caseId={chosen}/>
 <StaffDeliverables caseId={chosen}/>
 <section className="rounded-[18px] avofis-card p-6"><h2 className="text-lg font-semibold">Müşteri belgeleri</h2><p className="mt-2 text-sm text-[#B9C5DF]">Belge görmek için yukarıdan dosya seçiniz. Dosyalar özel alandadır; bağlantılar kısa süreli oluşturulur.</p><div className="mt-4 space-y-2">{fileNames.map(name=><div key={name} className="flex items-center justify-between gap-3 rounded-xl bg-[#071738] p-3"><span className="truncate font-mono text-xs">{name}</span><button onClick={()=>void openStaffFile(name)} className="shrink-0 text-sm font-semibold text-[#dfbf59]">Görüntüle</button></div>)}</div></section>
 <section className="rounded-[18px] avofis-card p-6"><h2 className="flex items-center gap-2 text-lg font-semibold"><MessageSquareText className="h-5 w-5"/> Mesajlar</h2><div className="mt-4 max-h-80 space-y-2 overflow-auto">{messages.filter(m=>!chosen||m.case_id===chosen).map(m=><div key={m.id} className="rounded-xl bg-[#071738] p-3 text-sm"><p className="text-xs text-[#B9C5DF]">{m.case_id.slice(0,8)} · {m.sender_id.slice(0,8)} · {new Date(m.created_at).toLocaleString("tr-TR")}</p><p className="mt-2 whitespace-pre-wrap break-words">{m.body}</p></div>)}</div><form onSubmit={sendMessage} className="mt-4"><p className="mb-2 text-xs text-[#B9C5DF]">Mesaj göndermek için yukarıdan dosya seçiniz.</p><textarea rows={3} maxLength={1500} value={note} onChange={e=>setNote(e.target.value)} className="w-full rounded-xl border border-[#dfbf59]/25 p-3"/><button disabled={busy||!chosen||!note.trim()} className="mt-3 rounded-xl avofis-cta avofis-btn text-sm font-semibold text-white disabled:opacity-50">Müşteriye mesaj</button></form></section>
 </div>}
 </PageFrame>;
}
