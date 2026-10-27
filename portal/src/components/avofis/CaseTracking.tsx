"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Event={id:string;new_status:string;created_at:string};
type Request={id:string;title:string;status:string};
const states:Record<string,string>={review:"Ön inceleme",awaiting_agreement:"Sözleşme ve onay",open:"İşlem yürütülüyor",completed:"İşlem tamamlandı",closed:"Dosya kapatıldı"};
const requestStates:Record<string,string>={requested:"Belge bekleniyor",received:"Personel tarafından teslim alındı",waived:"Gerekli değil"};

export function CaseTracking({caseId}:{caseId:string}){
 const [events,setEvents]=useState<Event[]>([]);
 const [requests,setRequests]=useState<Request[]>([]);
 const [loading,setLoading]=useState(true);
 const [error,setError]=useState(false);
 useEffect(()=>{
   let active=true;
   setLoading(true);setError(false);setEvents([]);setRequests([]);
   void Promise.all([
     supabase.from("avofis_case_events").select("id,new_status,created_at").eq("case_id",caseId).order("created_at",{ascending:true}),
     supabase.from("avofis_document_requests").select("id,title,status").eq("case_id",caseId).order("created_at",{ascending:true})
   ]).then(([history,documents])=>{
     if(!active)return;
     setError(!!history.error||!!documents.error);
     if(!history.error)setEvents((history.data||[]) as Event[]);
     if(!documents.error)setRequests((documents.data||[]) as Request[]);
   }).catch(()=>{if(active)setError(true);}).finally(()=>{if(active)setLoading(false);});
   return ()=>{active=false;};
 },[caseId]);
 return <div className="grid gap-4 md:grid-cols-2">
   <section className="avofis-card rounded-[18px] border p-5 sm:p-6">
     <h2 className="text-[17px] font-semibold">Dosya işlem geçmişi</h2>
     {loading?<p className="mt-3 text-[14px] text-[#B9C5DF]">Kayıtlar getiriliyor…</p>
     :error?<p role="alert" className="mt-3 text-[14px] text-[#B9C5DF]">İşlem geçmişi şu anda görüntülenemiyor.</p>
     :events.length===0?<p className="mt-3 text-[14px] leading-7 text-[#B9C5DF]">Bu dosyada kayıtlı durum değişikliği bulunmuyor. Önceki aşamalar tamamlanmış sayılmaz.</p>
     :<ol className="mt-4 space-y-3">{events.map(e=><li key={e.id} className="border-l-2 border-[#dfbf59]/50 pl-3">
       <p className="text-[14px] font-semibold">{states[e.new_status]||"Dosya durumu güncellendi"}</p>
       <time className="text-[12px] text-[#B9C5DF]" dateTime={e.created_at}>{new Date(e.created_at).toLocaleString("tr-TR")}</time>
     </li>)}</ol>}
   </section>
   <section className="avofis-card rounded-[18px] border p-5 sm:p-6">
     <h2 className="text-[17px] font-semibold">İstenen belgeler</h2>
     {loading?<p className="mt-3 text-[14px] text-[#B9C5DF]">Belge talepleri getiriliyor…</p>
     :error?<p role="alert" className="mt-3 text-[14px] text-[#B9C5DF]">Belge talepleri şu anda görüntülenemiyor.</p>
     :requests.length===0?<p className="mt-3 text-[14px] leading-7 text-[#B9C5DF]">Bu dosyada kayıtlı belge talebi bulunmuyor.</p>
     :<ul className="mt-4 space-y-3">{requests.map(item=><li key={item.id} className="border-b border-[#dfbf59]/15 pb-3">
       <p className="text-[14px] font-semibold">{item.title}</p>
       <p className="mt-1 text-[12px] text-[#B9C5DF]">{requestStates[item.status]||"Durum bilgisi yok"}</p>
     </li>)}</ul>}
   </section>
 </div>;
}
