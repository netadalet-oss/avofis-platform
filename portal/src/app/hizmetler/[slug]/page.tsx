"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft,ArrowUpRight,ClipboardList,FileCheck2,FolderOpen,ShieldCheck } from "lucide-react";
import { PageFrame } from "@/components/avofis/PageFrame";
import { useSiteLang } from "@/hooks/useSiteLang";
import { localized,services,ui,withLang } from "@/lib/avofis-site";
export default function ServiceDetailPage(){
 const params=useParams<{slug:string}>(),lang=useSiteLang(),t=ui[lang];
 const service=services.find(item=>item.slug===params.slug);
 if(!service)return <PageFrame lang={lang} eyebrow={t.services} title={t.services}><Link className="avofis-outline avofis-btn" href={withLang("/hizmetler",lang)}>{t.allServices}</Link></PageFrame>;
 const sections=[
  {title:t.documents,body:localized(service.firstDetails,lang),icon:FolderOpen},
  {title:t.workflow,body:localized(service.stages,lang),icon:ClipboardList},
  {title:t.professional,body:localized(service.boundaries,lang),icon:ShieldCheck}
 ];
 return <PageFrame wide lang={lang} eyebrow={t.services} title={localized(service.title,lang)} description={localized(service.lead,lang)}>
  <Link href={withLang("/hizmetler",lang)} className="mb-5 inline-flex min-h-9 items-center gap-2 text-[13px] font-semibold text-[#dfbf59]"><ArrowLeft className="h-4 w-4" aria-hidden="true"/>{t.allServices}</Link>
  <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1.35fr)_minmax(270px,.65fr)]">
   <section className="avofis-card rounded-[18px] border p-5 sm:p-7">
     <div className="flex items-center gap-3"><span className="avofis-icon-tile"><service.icon className="h-5 w-5"/></span><h2 className="text-[19px] font-semibold text-[#F2F5FF]">{t.subservices}</h2></div>
     <ul className="mt-5 grid gap-3">
       {service.items.map((item,i)=><li key={i} className="flex items-start gap-3 border-b border-[#dfbf59]/10 pb-3 text-[14px] leading-[1.75] text-[#D7E0F0] last:border-0 last:pb-0"><FileCheck2 className="mt-1 h-[17px] w-[17px] shrink-0 text-[#dfbf59]" aria-hidden="true"/>{localized(item,lang)}</li>)}
     </ul>
   </section>
   <aside className="grid gap-3">
     {sections.map(section=><section key={section.title} className="avofis-card rounded-[16px] border p-5">
       <span className="avofis-icon-tile"><section.icon className="h-5 w-5" aria-hidden="true"/></span>
       <h2 className="mt-3 text-[15px] font-semibold text-[#F2F5FF]">{section.title}</h2>
       <p className="mt-2 text-[13px] leading-[1.8] text-[#B9C5DF]">{section.body}</p>
     </section>)}
   </aside>
  </div>
  <div className="mt-6 flex flex-wrap gap-3">
   <Link href={withLang("/basvuru",lang)+"&service="+service.slug} className="avofis-cta avofis-btn">{t.intake}<ArrowUpRight className="h-4 w-4" aria-hidden="true"/></Link>
   <Link href={withLang("/nasil-calisir",lang)} className="avofis-outline avofis-btn">{t.process}</Link>
  </div>
 </PageFrame>;
}
