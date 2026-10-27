"use client";
import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import { ArrowLeft, CreditCard, FileCheck2, FileUp, FolderLock, LockKeyhole, MessageSquare, RefreshCw, ShieldCheck } from "lucide-react";

type Matter={id:string;title:string;service_key:string;status:string;price_eur_cents:number;created_at:string;};
type Agreement={id:string;case_id:string;legal_text:string;agreement_version:string;signed_at:string|null;client_signature:string|null;};
type Payment={id:string;case_id:string;status:string;amount_eur_cents:number;checkout_url:string;};
type Message={id:string;case_id:string;sender_id:string;body:string;created_at:string;};
type Document={name:string;id:string|null;created_at:string;};
const live=process.env.NEXT_PUBLIC_AVOFIS_CLIENT_PORTAL_ENABLED==="true";
export default function ClientPage(){
 const {user,session,loading:authLoading}=useUser();
 const [cases,setCases]=useState<Matter[]>([]);
 const [agreements,setAgreements]=useState<Agreement[]>([]);
 const [payments,setPayments]=useState<Payment[]>([]);
 const [messages,setMessages]=useState<Message[]>([]);
 const [selected,setSelected]=useState("");
 const [documents,setDocuments]=useState<Document[]>([]);
 const [signedName,setSignedName]=useState("");
 const [accepted,setAccepted]=useState(false);
 const [note,setNote]=useState("");
 const [loading,setLoading]=useState(false);
 const [feedback,setFeedback]=useState("");
 const [busy,setBusy]=useState(false);
 const current=cases.find(c=>c.id===selected);
 const agreement=agreements.find(a=>a.case_id===selected);
 const payment=payments.filter(p=>p.case_id===selected).sort((a,b)=>a.id.localeCompare(b.id)).find(p=>p.status==="paid");
 async function refresh(){
  if(!user||!live)return;
  setLoading(true);
  const results=await Promise.all([
   supabase.from("avofis_cases").select("id,title,service_key,status,price_eur_cents,created_at").order("created_at",{ascending:false}),
   supabase.from("avofis_agreements").select("id,case_id,legal_text,agreement_version,signed_at,client_signature"),
   supabase.from("avofis_payments").select("id,case_id,status,amount_eur_cents,checkout_url"),
   supabase.from("avofis_messages").select("id,case_id,sender_id,body,created_at").order("created_at",{ascending:true})
  ]);
  if(results.some(r=>r.error))setFeedback("Dosya bilgileri alınamadı. Lütfen tekrar deneyin.");
  else {const list=(results[0].data||[]) as Matter[];setCases(list);setAgreements(results[1].data as Agreement[]||[]);setPayments(results[2].data as Payment[]||[]);setMessages(results[3].data as Message[]||[]);setSelected(old=>list.some(c=>c.id===old)?old:(list[0]?.id||""));}
  setLoading(false);
 }
 useEffect(()=>{if(user&&live)void refresh();},[user?.id]);
 useEffect(()=>{
  if(!selected||!user)return;
  void supabase.storage.from("avofis-private").list(selected+"/"+user.id,{limit:100}).then(({data,error})=>{if(!error)setDocuments((data||[]) as Document[]);});
 },[selected,user?.id]);
 async function acceptContract(){
   if(!current||!agreement||!accepted||signedName.trim().length<3)return;
   setBusy(true);setFeedback("");
   const {error}=await supabase.rpc("avofis_accept_agreement",{p_case:current.id,p_signature:signedName.trim()});
   setFeedback(error?"Sözleşme kaydedilemedi: "+error.message:"Sözleşme kabulü kaydedildi.");await refresh();setBusy(false);
 }
 async function uploadDocument(e:React.ChangeEvent<HTMLInputElement>){
  const file=e.target.files?.[0];if(!file||!user||!current||!agreement?.signed_at)return;
  e.target.value="";
  if(file.size>10*1024*1024||!["application/pdf","image/png","image/jpeg","image/webp"].includes(file.type)){setFeedback("Yalnızca 10 MB altındaki PDF/JPG/PNG/WEBP dosyaları kabul edilir.");return;}
  setBusy(true);setFeedback("");
  const ext=file.type==="application/pdf"?"pdf":file.type==="image/png"?"png":file.type==="image/webp"?"webp":"jpg";
  const path=current.id+"/"+user.id+"/"+crypto.randomUUID()+"."+ext;
  const {error}=await supabase.storage.from("avofis-private").upload(path,file,{contentType:file.type,upsert:false});
  setFeedback(error?"Dosya yüklenemedi: "+error.message:"Dosya güvenli alana yüklendi.");
  const {data}=await supabase.storage.from("avofis-private").list(current.id+"/"+user.id,{limit:100});
  setDocuments((data||[]) as Document[]);
  setBusy(false);
 }
 async function download(name:string){
   if(!user||!current)return;
   const {data,error}=await supabase.storage.from("avofis-private").createSignedUrl(current.id+"/"+user.id+"/"+name,60);
   if(error||!data?.signedUrl){setFeedback("Belge bağlantısı oluşturulamadı.");return;}
   window.open(data.signedUrl,"_blank","noopener,noreferrer");
 }
 async function sendMessage(e:FormEvent){
  e.preventDefault();if(!user||!current||!note.trim())return;
  setBusy(true);
  const {error}=await supabase.from("avofis_messages").insert({case_id:current.id,sender_id:user.id,body:note.trim().slice(0,1500)});
  setFeedback(error?"Mesaj gönderilemedi.":"Mesaj kaydedildi.");
  if(!error)setNote("");
  await refresh();setBusy(false);
 }
 async function pay(){
  if(!session||!current||!agreement?.signed_at)return;
  setBusy(true);setFeedback("");
  try{
   const response=await fetch("/api/payments/checkout",{method:"POST",headers:{"Content-Type":"application/json",Authorization:"Bearer "+session.access_token},body:JSON.stringify({caseId:current.id})});
   const result=await response.json();
   if(!response.ok||typeof result.checkoutUrl!=="string"||!result.checkoutUrl.startsWith("https://www.mollie.com/"))throw new Error(result.error||"Payment unavailable");
   window.location.assign(result.checkoutUrl);
  }catch(e){setFeedback(e instanceof Error?e.message:"Ödeme bağlantısı oluşturulamadı.");setBusy(false);}
 }
 return <main className="min-h-screen bg-[#F7F6F2] text-[#183B42]"><div className="mx-auto max-w-6xl px-5 py-12">
   <div className="flex flex-wrap items-center justify-between gap-4"><Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold"><ArrowLeft className="h-4 w-4"/>AVOfis</Link><Link href="/bilgi" className="text-sm text-[#426B68]">Bilgi merkezi</Link></div>
   <div className="mt-12"><p className="text-xs font-semibold tracking-[.2em] text-[#A68357]">GÜVENLİ MÜŞTERİ ALANI</p><h1 className="mt-3 text-4xl font-semibold tracking-[-.06em]">Dosyalarım</h1><p className="mt-3 max-w-3xl text-sm leading-7 text-[#607A76]">Sözleşmeler, güvenli belgeler, durum bilgileri ve mesajlaşma. Bu alan yalnızca doğrulanmış müşteri hesaplarına açıktır.</p></div>
   {!live?<div className="mt-10 rounded-2xl bg-white p-8"><LockKeyhole className="h-7 w-7 text-[#36796A]"/><p className="mt-4 font-semibold">Müşteri dosya sistemi henüz etkinleştirilmedi.</p><p className="mt-2 text-sm text-[#617B76]">Kuruluş, sözleşme ve veri güvenliği koşulları tamamlandıktan sonra açılacaktır.</p></div>
   :authLoading?<p className="mt-10">Oturum kontrol ediliyor…</p>
   :!user?<div className="mt-10 rounded-2xl bg-white p-8"><p className="mb-4">Dosyalarınızı görmek için giriş yapın.</p><Link href="/auth/login" className="inline-flex rounded-full bg-[#173A43] px-5 py-3 text-sm font-semibold text-white">Giriş yap</Link></div>
   :<div className="mt-9 grid gap-6 lg:grid-cols-[280px_1fr]">
     <aside className="rounded-3xl border border-[#DEE8E0] bg-white p-5"><div className="flex items-center justify-between"><h2 className="font-semibold">Dosyalar</h2><button aria-label="Yenile" onClick={()=>void refresh()}><RefreshCw className="h-4 w-4"/></button></div><p className="mt-2 break-all text-xs text-[#66817A]">Hesap: {user.id}</p><div className="mt-5 space-y-2">{cases.map(c=><button key={c.id} onClick={()=>{setSelected(c.id);setFeedback("");}} className={"w-full rounded-xl px-3 py-4 text-left "+(selected===c.id?"bg-[#E5F0E9]":"bg-[#F7F9F6]")}><span className="block text-sm font-semibold">{c.title}</span><span className="mt-1 block text-xs text-[#63807A]">{c.status}</span></button>)}</div>{!cases.length&&!loading&&<p className="mt-5 text-sm text-[#617B76]">Henüz hesabınıza atanmış dosya bulunmuyor.</p>}</aside>
     <section className="space-y-5">
       {feedback&&<div role="status" className="rounded-xl border border-[#D4E2D7] bg-[#EAF2EA] p-4 text-sm">{feedback}</div>}
       {current&&<>
         <article className="rounded-3xl border border-[#DEE8E0] bg-white p-6"><div className="flex flex-wrap justify-between gap-3"><div><h2 className="text-xl font-semibold">{current.title}</h2><p className="mt-2 text-xs text-[#63807A]">Durum: {current.status} · Ref: {current.id.slice(0,8)}</p></div><span className="font-semibold">{(current.price_eur_cents/100).toFixed(2)} €</span></div></article>
         <article className="rounded-3xl border border-[#DEE8E0] bg-white p-6"><div className="flex items-center gap-2"><FileCheck2 className="h-5 w-5 text-[#2D7167]"/><h2 className="text-lg font-semibold">Hizmet sözleşmesi</h2></div>{agreement?<><p className="mt-3 text-xs text-[#759086]">Sürüm: {agreement.agreement_version}</p><div className="mt-4 max-h-60 overflow-y-auto whitespace-pre-wrap rounded-xl bg-[#F2F5F1] p-4 text-sm leading-7">{agreement.legal_text}</div>{agreement.signed_at?<p className="mt-4 text-sm font-medium text-[#296B5C]">Kabul edildi: {new Date(agreement.signed_at).toLocaleString("tr-TR")} · {agreement.client_signature}</p>:<div className="mt-5 space-y-3"><p className="text-xs text-[#6D817D]">Bu yöntem, ad-soyad yazılarak verilen basit elektronik sözleşme kabulüdür; nitelikli elektronik imza yerine geçmez.</p><label className="block text-sm">Adınız ve soyadınız<input value={signedName} onChange={e=>setSignedName(e.target.value)} className="mt-2 w-full rounded-lg border border-[#CDDCD4] p-3"/></label><label className="flex gap-2 text-sm"><input type="checkbox" checked={accepted} onChange={e=>setAccepted(e.target.checked)}/> Sözleşme metnini okudum ve bu sürümünü kabul ediyorum.</label><button onClick={()=>void acceptContract()} disabled={busy||!accepted||signedName.trim().length<3} className="rounded-full bg-[#173A43] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">Sözleşmeyi kabul et</button></div>}</>:<p className="mt-4 text-sm text-[#687F7A]">Henüz sözleşme hazırlanmadı.</p>}</article>
         <article className="rounded-3xl border border-[#DEE8E0] bg-white p-6"><div className="flex items-center gap-2"><FolderLock className="h-5 w-5 text-[#2D7167]"/><h2 className="text-lg font-semibold">Güvenli belge aktarımı</h2></div><p className="mt-3 text-sm leading-6 text-[#697F79]">Yalnızca gerekli belgeleri, sözleşme kabul edildikten sonra yükleyin. Dosyalar genel erişime açık değildir.</p>{agreement?.signed_at&&<label className="mt-5 inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#173A43] px-5 py-3 text-sm font-semibold text-white"><FileUp className="h-4 w-4"/>{busy?"İşleniyor...":"Belge seç ve yükle"}<input type="file" accept="application/pdf,image/png,image/jpeg,image/webp" className="sr-only" disabled={busy} onChange={uploadDocument}/></label>}{!agreement?.signed_at&&<p className="mt-3 text-sm text-[#936F47]">Belge yüklemek için önce sözleşme kabul edilmelidir.</p>}<ul className="mt-5 space-y-2">{documents.map(d=><li key={d.name} className="flex items-center justify-between gap-2 rounded-xl bg-[#F1F6F1] p-3 text-xs"><span className="truncate">{d.name}</span><button onClick={()=>void download(d.name)} className="font-semibold text-[#2D7065]">Aç</button></li>)}</ul></article>
         <article className="rounded-3xl border border-[#DEE8E0] bg-white p-6"><div className="flex items-center gap-2"><CreditCard className="h-5 w-5 text-[#2D7167]"/><h2 className="text-lg font-semibold">Ödeme</h2></div><p className="mt-3 text-sm">Hizmet bedeli: {(current.price_eur_cents/100).toFixed(2)} € · Resmî harç ve üçüncü taraf ücretleri kapsam dışı olabilir.</p>{payment?<p className="mt-4 text-sm font-semibold text-[#25725C]">Ödeme alındı (sağlayıcı teyidi).</p>:agreement?.signed_at&&current.price_eur_cents>0?<button onClick={()=>void pay()} disabled={busy} className="mt-5 rounded-full bg-[#173A43] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">Güvenli ödemeye geç</button>:<p className="mt-3 text-xs text-[#71847D]">Ödeme sözleşme kabulünden sonra açılır. Ödeme sağlayıcısı yapılandırılmalıdır.</p>}</article>
         <article className="rounded-3xl border border-[#DEE8E0] bg-white p-6"><div className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-[#2D7167]"/><h2 className="text-lg font-semibold">Dosya mesajları</h2></div><div className="mt-5 max-h-64 space-y-3 overflow-y-auto">{messages.filter(m=>m.case_id===selected).map(m=><div key={m.id} className="rounded-xl bg-[#F2F6F1] p-3 text-sm"><p className="text-xs font-medium text-[#62827A]">{m.sender_id===user.id?"Siz":"AVOfis"} · {new Date(m.created_at).toLocaleString("tr-TR")}</p><p className="mt-2 whitespace-pre-wrap break-words">{m.body}</p></div>)}</div><form onSubmit={sendMessage} className="mt-4"><textarea value={note} maxLength={1500} onChange={e=>setNote(e.target.value)} rows={3} placeholder="Mesajınızı yazın (hassas bilgi göndermeyin)" className="w-full rounded-xl border border-[#CDDCD4] p-3 text-sm"/><button disabled={busy||!note.trim()} className="mt-3 rounded-full bg-[#173A43] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">Mesaj gönder</button></form></article>
       </>}
     </section>
   </div>}
 </div></main>;
}
