"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { PageFrame } from "@/components/avofis/PageFrame";
import { usePortalLanguage } from "@/hooks/usePortalLanguage";
import { copy,serviceCodes,type ServiceCode } from "@/lib/avofis-content";
import { serviceDetails } from "@/lib/avofis-service-details";

const headings={
 tr:{eyebrow:"HİZMET AYRINTILARI",what:"Hizmet nedir?",scope:"İşlem kapsamı",docs:"Hangi belgeler gerekebilir?",who:"İşlemi kim yürütür?",how:"Nasıl başvurulur?",fees:"Ücret nasıl belirlenir?",back:"Tüm hizmetlere dön",apply:"Ön başvuru",notice:"Ön başvuru yalnızca hizmet kabulü etkinleştirildiğinde gönderilebilir."},
 nl:{eyebrow:"DIENSTINFORMATIE",what:"Wat houdt de dienst in?",scope:"Omvang van de werkzaamheden",docs:"Welke documenten kunnen nodig zijn?",who:"Wie voert het werk uit?",how:"Hoe aanvragen?",fees:"Hoe worden kosten bepaald?",back:"Terug naar diensten",apply:"Aanvraag",notice:"Aanvragen kunnen pas worden verstuurd zodra de klantacceptatie is geactiveerd."},
 en:{eyebrow:"SERVICE DETAILS",what:"What is the service?",scope:"Scope of work",docs:"Which documents may be required?",who:"Who performs the work?",how:"How to apply?",fees:"How are fees determined?",back:"Back to all services",apply:"Enquiry",notice:"Enquiries can only be submitted once client intake has been activated."}
};
export default function ServiceDetailPage({params}:{params:{service:string}}){
 const lang=usePortalLanguage(),code=params.service as ServiceCode;
 if(!serviceCodes.includes(code))notFound();
 const item=copy[lang].serviceList.find(s=>s.id===code);
 if(!item)notFound();
 const d=serviceDetails[lang][code],t=headings[lang];
 const blocks=[[t.what,item.description],[t.scope,item.detail],[t.docs,d.documents],[t.who,d.operator],[t.how,d.application],[t.fees,d.fees]];
 return <PageFrame lang={lang} eyebrow={t.eyebrow} title={item.title} description={item.description}>
   <div className="grid gap-4 sm:grid-cols-2">
     {blocks.map(([title,body])=><section className="avofis-card min-w-0 rounded-[18px] border p-5 sm:p-6" key={title}><h2 className="text-[17px] font-semibold text-[#F2F5FF]">{title}</h2><p className="mt-3 text-[14px] leading-7 text-[#B9C5DF]">{body}</p></section>)}
   </div>
   <p className="mt-6 text-[13px] leading-7 text-[#B9C5DF]">{t.notice}</p>
   <div className="mt-4 flex flex-wrap gap-3">
     <Link className="avofis-cta avofis-btn" href={"/basvuru?lang="+lang}>{t.apply}</Link>
     <Link className="avofis-outline avofis-btn" href={"/hizmetler?lang="+lang}>{t.back}</Link>
   </div>
 </PageFrame>;
}
