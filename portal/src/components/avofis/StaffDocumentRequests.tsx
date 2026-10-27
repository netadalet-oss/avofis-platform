"use client";

import { useEffect,useState,type FormEvent } from "react";
import { supabase } from "@/lib/supabase";
import { useUser } from "@/hooks/useUser";

type Request={id:string;title:string;status:string};
export function StaffDocumentRequests({caseId}:{caseId:string}){
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
     if(error)setError("Belge talepleri alınamadı.");
     else setItems((data||[]) as Request[]);
   });
   return ()=>{active=false;};
 },[caseId]);
 async function reload(){
   const {data,error}=await supabase.from("avofis_document_requests").select("id,title,status").eq("case_id",caseId).order("created_at",{ascending:true});
   if(error)setError("Belge talepleri güncellenemedi.");else setItems((data||[]) as Request[]);
 }
 async function add(e:FormEvent<HTMLFormElement>){
   e.preventDefault();if(!user||!caseId||title.trim().length<3)return;
   setBusy(true);setError("");
   const {error}=await supabase.from("avofis_document_requests").insert({case_id:caseId,requested_by:user.id,title:title.trim()});
   if(error)setError("Belge talebi kaydedilemedi.");else{setTitle("");await reload();}
   setBusy(false);
 }
 async function update(id:string,status:string){
   setBusy(true);setError("");
   const {error}=await supabase.from("avofis_document_requests").update({status}).eq("id",id);
   if(error)setError("Belge durumu değiştirilemedi.");else await reload();
   setBusy(false);
 }
 return <section className="avofis-card rounded-[18px] border p-5 sm:p-6">
   <h2 className="text-[17px] font-semibold">Belge talepleri ve teslim kontrolü</h2>
   <p className="mt-2 text-[13px] leading-6 text-[#B9C5DF]">Yalnızca seçili dosya için belge isteyin. Yüklenen belgeyi inceledikten sonra teslim durumunu güncelleyin.</p>
   {!caseId?<p className="mt-4 text-[14px] text-[#B9C5DF]">Önce bir müşteri dosyası seçiniz.</p>:<>
     {error&&<p role="alert" className="mt-3 text-[13px] text-red-200">{error}</p>}
     <form onSubmit={add} className="mt-4 flex flex-col gap-3 sm:flex-row">
       <label className="flex-1 text-[13px] font-semibold">İstenen belge
         <input className="avofis-field" value={title} onChange={e=>setTitle(e.target.value)} minLength={3} maxLength={160} required placeholder="Belgenin açıklayıcı adı"/>
       </label>
       <button disabled={busy||title.trim().length<3} className="avofis-cta avofis-btn self-end disabled:opacity-50">Belge iste</button>
     </form>
     <ul className="mt-5 space-y-3">{items.map(item=><li key={item.id} className="flex flex-col justify-between gap-3 border-t border-[#dfbf59]/15 pt-3 sm:flex-row sm:items-center">
       <span className="min-w-0 break-words text-[14px]">{item.title}</span>
       <label className="text-[12px] text-[#B9C5DF]">Teslim durumu
         <select disabled={busy} value={item.status} onChange={e=>void update(item.id,e.target.value)} className="avofis-field min-w-[180px]">
           <option value="requested">Belge bekleniyor</option>
           <option value="received">Teslim alındı</option>
           <option value="waived">Gerekli değil</option>
         </select>
       </label>
     </li>)}</ul>
     {items.length===0&&<p className="mt-4 text-[13px] text-[#B9C5DF]">Henüz belge talebi yok.</p>}
   </>}
 </section>;
}
