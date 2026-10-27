"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft,ArrowUpRight,CheckCircle2 } from "lucide-react";
import { PageFrame } from "@/components/avofis/PageFrame";
import { useSiteLang } from "@/hooks/useSiteLang";
import { audiences,services,localized,ui,withLang } from "@/lib/avofis-site";
export default function AudienceDetailPage(){
 const {slug}=useParams<{slug:string}>(),lang=useSiteLang(),t=ui[lang];
 const person=audiences.find(item=>item.slug===slug);
 if(!person)return <PageFrame lang={lang} eyebrow={t.audiences} title={t.audiences}><Link href={withLang("/kimler-icin",lang)} className="avofis-outline avofis-btn">{t.allAudiences}</Link></PageFrame>;
 return <PageFrame wide lang={lang} eyebrow={t.audiences} title={localized(person.title,lang)} description={localized(person.lead,lang)}>
    <Link href={withLang("/kimler-icin",lang)} className="mb-5 inline-flex min-h-9 items-center gap-2 text-[13px] font-semibold text-[#dfbf59]"><ArrowLeft className="h-4 w-4" aria-hidden="true"/>{t.allAudiences}</Link>
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
     <section className="avofis-card rounded-[18px] border p-5 sm:p-7">
       <span className="avofis-icon-tile"><person.icon className="h-5 w-5"/></span>
       <h2 className="mt-4 text-[18px] font-semibold text-[#F2F5FF]">{t.support}</h2>
       <ul className="mt-4 grid gap-3">{person.needs.map((need,i)=><li key={i} className="flex items-start gap-3 text-[14px] leading-[1.8] text-[#D6E0F0]"><CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#dfbf59]"/>{localized(need,lang)}</li>)}</ul>
       <Link href={withLang("/basvuru",lang)} className="avofis-cta avofis-btn mt-6">{t.intake}<ArrowUpRight className="h-4 w-4"/></Link>
     </section>
     <section><h2 className="mb-3 text-[18px] font-semibold text-[#F2F5FF]">{t.services}</h2>
      <div className="grid gap-3">
        {person.serviceSlugs.map(serviceSlug=>{
          const service=services.find(item=>item.slug===serviceSlug);if(!service)return null;
          return <Link href={withLang("/hizmetler/"+service.slug,lang)} key={service.slug} className="avofis-card flex min-h-[68px] items-center gap-3 rounded-[14px] border p-4">
            <service.icon className="h-5 w-5 shrink-0 text-[#dfbf59]" aria-hidden="true"/><span className="flex-1 text-[14px] font-semibold text-[#F2F5FF]">{localized(service.title,lang)}</span><ArrowUpRight className="h-4 w-4 shrink-0 text-[#dfbf59]"/>
          </Link>;
        })}
      </div>
     </section>
    </div>
 </PageFrame>;
}
