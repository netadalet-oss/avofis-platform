"use client";

import { useEffect,useState } from "react";
import { supabase } from "@/lib/supabase";

type Deliverable={id:string;original_file_name:string;storage_path:string;created_at:string};
export function ClientDeliverables({caseId}:{caseId:string}){
 const [items,setItems]=useState<Deliverable[]>([]);
 const [busy,setBusy]=useState("");
 const [error,setError]=useState("");
 const [loading,setLoading]=useState(true);
 useEffect(()=>{
   let active=true;setItems([]);setError("");setLoading(true);
   void supabase.from("avofis_deliverables")
     .select("id,original_file_name,storage_path,created_at")
     .eq("case_id",caseId).order("created_at",{ascending:false})
     .then(({data,error})=>{
       if(!active)return;
       if(error)setError("Teslim edilen belgeler şu anda görüntülenemiyor.");
       else setItems((data||[]) as Deliverable[]);
     }).catch(()=>{if(active)setError("Belgeler getirilemedi.");}).finally(()=>{if(active)setLoading(false);});
   return ()=>{active=false;};
 },[caseId]);
 async function download(item:Deliverable){
   setBusy(item.id);setError("");
   const {data,error}=await supabase.storage.from("avofis-private").createSignedUrl(item.storage_path,60);
   if(error||!data?.signedUrl)setError("Belge bağlantısı oluşturulamadı.");
   else window.open(data.signedUrl,"_blank","noopener,noreferrer");
   setBusy("");
 }
 return <section className="avofis-card rounded-[18px] border p-5 sm:p-6">
   <h2 className="text-[17px] font-semibold">AVOfis tarafından iletilen belgeler</h2>
   <p className="mt-2 text-[13px] leading-6 text-[#B9C5DF]">Dosyanız için kayıtlı sonuç ve teslim belgeleri burada listelenir. İndirme bağlantıları kısa süreyle geçerlidir.</p>
   {error&&<p role="alert" className="mt-3 text-[13px] text-red-200">{error}</p>}
   {loading?<p className="mt-4 text-[13px] text-[#B9C5DF]">Belgeler getiriliyor…</p>:
    items.length===0?<p className="mt-4 text-[13px] text-[#B9C5DF]">Henüz iletilmiş belge bulunmuyor.</p>:
    <ul className="mt-4 space-y-3">{items.map(item=><li key={item.id} className="flex min-w-0 flex-col gap-3 border-t border-[#dfbf59]/15 pt-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="min-w-0 break-words text-[14px]">{item.original_file_name}</span>
      <button type="button" disabled={!!busy} onClick={()=>void download(item)} className="avofis-outline avofis-btn shrink-0 disabled:opacity-50">{busy===item.id?"Bağlantı hazırlanıyor…":"Belgeyi indir"}</button>
    </li>)}</ul>}
 </section>;
}
