"use client";

import { useEffect,useState,type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";
import type { Language } from "@/lib/avofis-content";
const labels={"tr":{"title":"Belge talepleri ve teslim kontrolü","intro":"Yalnızca seçili dosyadan belge isteyin. İncelemeden sonra teslim durumunu güncelleyin.","choose":"Önce bir müşteri dosyası seçin.","wanted":"İstenen belge","placeholder":"Belgenin açıklayıcı adı","add":"Belge iste","state":"Teslim durumu","requested":"Belge bekleniyor","received":"Teslim alındı","waived":"Gerekli değil","empty":"Henüz belge talebi yok.","fetchError":"Belge talepleri alınamadı.","refreshError":"Belge talepleri güncellenemedi.","saveError":"Belge talebi kaydedilemedi.","updateError":"Belge durumu değiştirilemedi."},"nl":{"title":"Documentverzoeken en ontvangstcontrole","intro":"Vraag alleen documenten op voor het geselecteerde dossier. Werk de ontvangststatus pas na controle bij.","choose":"Selecteer eerst een klantdossier.","wanted":"Gevraagd document","placeholder":"Duidelijke documentnaam","add":"Document opvragen","state":"Ontvangststatus","requested":"Document verwacht","received":"Ontvangen","waived":"Niet nodig","empty":"Nog geen documentverzoeken.","fetchError":"Documentverzoeken niet beschikbaar.","refreshError":"Documentverzoeken konden niet worden vernieuwd.","saveError":"Documentverzoek kon niet worden opgeslagen.","updateError":"Documentstatus kon niet worden gewijzigd."},"en":{"title":"Document requests and receipt review","intro":"Only request documents for the selected case. Update their receipt status after checking the files.","choose":"Select a client case first.","wanted":"Requested document","placeholder":"Descriptive document name","add":"Request document","state":"Receipt status","requested":"Awaiting document","received":"Received","waived":"Not required","empty":"No document requests yet.","fetchError":"Could not load document requests.","refreshError":"Could not refresh document requests.","saveError":"Could not save document request.","updateError":"Could not change document status."}};

type Request={id:string;title:string;status:string};
export function StaffDocumentRequests({caseId,lang}:{caseId:string;lang:Language}){
 const t=labels[lang];
 const {user}=useUser();
 const [items,setItems]=useState<Request[]>([]);
 const [title,setTitle]=useState("");
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 useEffect(()=>{
   let active=true;
   setItems([]);setError("");
   if(caseId)void supabase.from("avofis_document_requests").select("id,title,status").eq("case_id",caseId).order("created_at",{ascending:true}).then(({data,error})=>{
     if(!active)return;
     if(error)setError(t.fetchError);
     else setItems((data||[]) as Request[]);
   });
   return ()=>{active=false;};
 },[caseId]);
 async function reload(){
   const {data,error}=await supabase.from("avofis_document_requests").select("id,title,status").eq("case_id",caseId).order("created_at",{ascending:true});
   if(error)setError(t.refreshError);else setItems((data||[]) as Request[]);
 }
 async function add(e:FormEvent<HTMLFormElement>){
   e.preventDefault();if(!user||!caseId||title.trim().length<3)return;
   setBusy(true);setError("");
   const {error}=await supabase.from("avofis_document_requests").insert({case_id:caseId,requested_by:user.id,title:title.trim()});
   if(error)setError(t.saveError);else{setTitle("");await reload();}
   setBusy(false);
 }
 async function update(id:string,status:string){
   setBusy(true);setError("");
   const {error}=await supabase.from("avofis_document_requests").update({status}).eq("id",id);
   if(error)setError(t.updateError);else await reload();
   setBusy(false);
 }
 return <section className="avofis-card rounded-[18px] border p-5 sm:p-6">
   <h2 className="text-[17px] font-semibold">{t.title}</h2>
   <p className="mt-2 text-[13px] leading-6 text-[#B9C5DF]">{t.intro}</p>
   {!caseId?<p className="mt-4 text-[14px] text-[#B9C5DF]">{t.choose}</p>:<>
     {error&&<p role="alert" className="mt-3 text-[13px] text-red-200">{error}</p>}
     <form onSubmit={add} className="mt-4 flex flex-col gap-3 sm:flex-row">
       <label className="flex-1 text-[13px] font-semibold">{t.wanted}
         <input className="avofis-field" value={title} onChange={e=>setTitle(e.target.value)} minLength={3} maxLength={160} required placeholder={t.placeholder}/>
       </label>
       <button disabled={busy||title.trim().length<3} className="avofis-cta avofis-btn self-end disabled:opacity-50">{t.add}</button>
     </form>
     <ul className="mt-5 space-y-3">{items.map(item=><li key={item.id} className="flex flex-col justify-between gap-3 border-t border-[#dfbf59]/15 pt-3 sm:flex-row sm:items-center">
       <span className="min-w-0 break-words text-[14px]">{item.title}</span>
       <label className="text-[12px] text-[#B9C5DF]">{t.state}
         <select disabled={busy} value={item.status} onChange={e=>void update(item.id,e.target.value)} className="avofis-field min-w-[180px]">
           <option value="requested">{t.requested}</option>
           <option value="received">{t.received}</option>
           <option value="waived">{t.waived}</option>
         </select>
       </label>
     </li>)}</ul>
     {items.length===0&&<p className="mt-4 text-[13px] text-[#B9C5DF]">{t.empty}</p>}
   </>}
 </section>;
}
