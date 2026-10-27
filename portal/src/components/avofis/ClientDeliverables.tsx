"use client";

import { useEffect,useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Language } from "@/lib/avofis-content";
const labels={"tr":{"title":"AVOfis tarafından iletilen belgeler","intro":"Dosyanız için kaydedilen sonuç belgeleri burada görünür. İndirme bağlantıları kısa süre geçerlidir.","load":"Belgeler getiriliyor…","empty":"Henüz teslim belgesi yok.","linking":"Bağlantı hazırlanıyor…","download":"Belgeyi indir","error":"Belge listesi görüntülenemedi.","linkError":t.linkError},"nl":{"title":"Opgeleverde documenten van AVOfis","intro":"De geregistreerde opleveringen voor uw dossier staan hier. Downloadlinks zijn kort geldig.","load":"Documenten ophalen…","empty":"Nog geen documenten opgeleverd.","linking":"Link voorbereiden…","download":"Document downloaden","error":"De documentenlijst kan niet worden getoond.","linkError":"Downloadlink kon niet worden gemaakt."},"en":{"title":"Documents delivered by AVOfis","intro":"Recorded results and deliveries for your case appear here. Download links are valid briefly.","load":"Loading documents…","empty":"No documents have been delivered yet.","linking":"Preparing link…","download":"Download document","error":"The document list is unavailable.","linkError":"Could not generate a download link."}};

type Deliverable={id:string;original_file_name:string;storage_path:string;created_at:string};
export function ClientDeliverables({caseId,lang}:{caseId:string;lang:Language}){
 const t=labels[lang];
 const [items,setItems]=useState<Deliverable[]>([]);
 const [busy,setBusy]=useState("");
 const [error,setError]=useState("");
 const [loading,setLoading]=useState(true);
 useEffect(()=>{
   let active=true;setItems([]);setError("");setLoading(true);
   void Promise.resolve(supabase.from("avofis_deliverables")
     .select("id,original_file_name,storage_path,created_at")
     .eq("case_id",caseId).order("created_at",{ascending:false}))
     .then(({data,error})=>{
       if(!active)return;
       if(error)setError(t.error);
       else setItems((data||[]) as Deliverable[]);
     }).catch(()=>{if(active)setError(t.error);}).finally(()=>{if(active)setLoading(false);});
   return ()=>{active=false;};
 },[caseId]);
 async function download(item:Deliverable){
   setBusy(item.id);setError("");
   const {data,error}=await supabase.storage.from("avofis-private").createSignedUrl(item.storage_path,60);
   if(error||!data?.signedUrl)setError(t.linkError);
   else window.open(data.signedUrl,"_blank","noopener,noreferrer");
   setBusy("");
 }
 return <section className="avofis-card rounded-[18px] border p-5 sm:p-6">
   <h2 className="text-[17px] font-semibold">{t.title}</h2>
   <p className="mt-2 text-[13px] leading-6 text-[#B9C5DF]">{t.intro}</p>
   {error&&<p role="alert" className="mt-3 text-[13px] text-red-200">{error}</p>}
   {loading?<p className="mt-4 text-[13px] text-[#B9C5DF]">{t.load}</p>:
    items.length===0?<p className="mt-4 text-[13px] text-[#B9C5DF]">{t.empty}</p>:
    <ul className="mt-4 space-y-3">{items.map(item=><li key={item.id} className="flex min-w-0 flex-col gap-3 border-t border-[#dfbf59]/15 pt-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="min-w-0 break-words text-[14px]">{item.original_file_name}</span>
      <button type="button" disabled={!!busy} onClick={()=>void download(item)} className="avofis-outline avofis-btn shrink-0 disabled:opacity-50">{busy===item.id?t.linking:t.download}</button>
    </li>)}</ul>}
 </section>;
}
