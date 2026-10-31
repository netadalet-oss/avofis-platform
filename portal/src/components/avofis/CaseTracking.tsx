"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Language } from "@/lib/avofis-content";
import { nextCaseAction } from "@/lib/case-next-action";

type Event={id:string;new_status:string;created_at:string};
type Request={id:string;title:string;status:string};
const localized={
 tr:{next:"Sıradaki işlem",checking:"Dosya kaydı denetleniyor…",nextUnavailable:"Sonraki işlem belirlenemedi; lütfen personelle doğrulayın.",history:"Dosya işlem geçmişi",loading:"Kayıtlar getiriliyor…",error:"İşlem geçmişi şu anda görüntülenemiyor.",empty:"Bu dosyada kayıtlı durum değişikliği bulunmuyor; önceki aşamalar tamamlanmış sayılmaz.",unknown:"Dosya durumu güncellendi",requests:"İstenen belgeler",loadingDocs:"Belge talepleri getiriliyor…",docsError:"Belge talepleri görüntülenemiyor.",noDocs:"Bu dosyada kayıtlı belge talebi bulunmuyor.",requestStates:{requested:"Belge bekleniyor",received:"Personel tarafından teslim alındı",waived:"Gerekli değil"},states:{review:"Ön inceleme",awaiting_agreement:"Sözleşme ve onay",open:"İşlem yürütülüyor",completed:"İşlem tamamlandı",closed:"Dosya kapatıldı"}},
 nl:{next:"Volgende stap",checking:"Dossier controleren…",nextUnavailable:"Volgende stap onbekend; bevestig dit bij de medewerker.",history:"Dossiergeschiedenis",loading:"Gebeurtenissen ophalen…",error:"De geschiedenis kan niet worden weergegeven.",empty:"Geen statuswijzigingen geregistreerd; eerdere stappen zijn niet automatisch afgerond.",unknown:"Dossierstatus gewijzigd",requests:"Gevraagde documenten",loadingDocs:"Documentverzoeken ophalen…",docsError:"Documentverzoeken zijn niet beschikbaar.",noDocs:"Geen documentverzoeken geregistreerd.",requestStates:{requested:"Document verwacht",received:"Door medewerker ontvangen",waived:"Niet nodig"},states:{review:"Eerste beoordeling",awaiting_agreement:"Overeenkomst en goedkeuring",open:"In behandeling",completed:"Afgerond",closed:"Gesloten"}},
 en:{next:"Next action",checking:"Checking case records…",nextUnavailable:"Next action is unavailable; confirm with the case operator.",history:"Case history",loading:"Loading records…",error:"Case history cannot be displayed.",empty:"No status changes recorded. Earlier steps are not assumed complete.",unknown:"Case status updated",requests:"Requested documents",loadingDocs:"Loading document requests…",docsError:"Document requests cannot be displayed.",noDocs:"No document requests recorded.",requestStates:{requested:"Awaiting document",received:"Accepted by staff",waived:"Not required"},states:{review:"Initial review",awaiting_agreement:"Agreement and acceptance",open:"In progress",completed:"Completed",closed:"Closed"}}
};

export function CaseTracking({caseId,status,hasAgreement,agreementSigned,priceEurCents,paid,lang}:{caseId:string;status:string;hasAgreement:boolean;agreementSigned:boolean;priceEurCents:number;paid:boolean;lang:Language}){
 const t=localized[lang],dateLocale=lang==="nl"?"nl-NL":lang==="en"?"en-GB":"tr-TR";
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
 const pending=requests.some(r=>r.status==="requested");
 const next=!loading&&!error?nextCaseAction({status,hasAgreement,agreementSigned,priceEurCents,paid,hasPendingDocuments:pending},lang):"";
 return <div className="space-y-4"><section className="avofis-card rounded-[18px] border p-5 sm:p-6"><h2 className="text-[17px] font-semibold">{t.next}</h2><p className="mt-2 text-[14px] leading-7 text-[#B9C5DF]">{loading?t.checking:error?t.nextUnavailable:next}</p></section><div className="grid gap-4 md:grid-cols-2">
   <section className="avofis-card rounded-[18px] border p-5 sm:p-6">
     <h2 className="text-[17px] font-semibold">{t.history}</h2>
     {loading?<p className="mt-3 text-[14px] text-[#B9C5DF]">{t.loading}</p>
     :error?<p role="alert" className="mt-3 text-[14px] text-[#B9C5DF]">{t.error}</p>
     :events.length===0?<p className="mt-3 text-[14px] leading-7 text-[#B9C5DF]">{t.empty}</p>
     :<ol className="mt-4 space-y-3">{events.map(e=><li key={e.id} className="border-l-2 border-[#dfbf59]/50 pl-3">
       <p className="text-[14px] font-semibold">{t.states[e.new_status as keyof typeof t.states]||t.unknown}</p>
       <time className="text-[12px] text-[#B9C5DF]" dateTime={e.created_at}>{new Date(e.created_at).toLocaleString(dateLocale)}</time>
     </li>)}</ol>}
   </section>
   <section className="avofis-card rounded-[18px] border p-5 sm:p-6">
     <h2 className="text-[17px] font-semibold">{t.requests}</h2>
     {loading?<p className="mt-3 text-[14px] text-[#B9C5DF]">{t.loadingDocs}</p>
     :error?<p role="alert" className="mt-3 text-[14px] text-[#B9C5DF]">{t.docsError}</p>
     :requests.length===0?<p className="mt-3 text-[14px] leading-7 text-[#B9C5DF]">{t.noDocs}</p>
     :<ul className="mt-4 space-y-3">{requests.map(item=><li key={item.id} className="border-b border-[#dfbf59]/15 pb-3">
       <p className="text-[14px] font-semibold">{item.title}</p>
       <p className="mt-1 text-[12px] text-[#B9C5DF]">{t.requestStates[item.status as keyof typeof t.requestStates]||t.unknown}</p>
     </li>)}</ul>}
   </section>
 </div></div>;
}
