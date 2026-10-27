"use client";
import Link from "next/link";
import { ArrowUpRight,ShieldCheck } from "lucide-react";
import { PageFrame } from "@/components/avofis/PageFrame";
import { useSiteLang } from "@/hooks/useSiteLang";
import {localized,services,ui,withLang} from "@/lib/avofis-site";
import {serviceGroups} from "@/lib/avofis-groups";
const introductions={
 tr:"Hollanda, Almanya ve Avrupa genelinde hukukî danışmanlık, idare ve mahkeme işlemleri, alacaklar, iş uyuşmazlıkları, göçmenlik, sözleşmeler ve ticari sorunlar. Türkiye bağlantısı şart değildir.",
 nl:"Juridische vragen, kanton- en bestuursrecht, schuldvorderingen, uitkeringen, contracten, migratie en grensoverschrijdende zaken binnen Europa — zonder verplichte Turkije-band.",
 de:"Rechtliche Hilfe, Behörden, zulässige Vertretung, Forderungen, Miete, Sozialleistungen, Arbeit und europäische grenzüberschreitende Angelegenheiten unter nationalen Berufsregeln.",
 en:"Legal advice, eligible court and agency representation, claims, benefits, housing, immigration, employment and business matters within and across Europe, subject to local rules."
};
export default function ServicesPage(){
 const lang=useSiteLang(),t=ui[lang];
 return <PageFrame lang={lang} wide eyebrow={t.services} title={t.serviceHead} description={introductions[lang]}>
  <div className="grid gap-12">
   {serviceGroups.map(group=><section key={group.id} aria-labelledby={"group-"+group.id}>
    <div className="max-w-3xl"><h2 id={"group-"+group.id} className="avofis-h2">{localized(group.title,lang)}</h2><p className="mt-2 text-[14px] leading-[1.8] text-[#B9C5DF]">{localized(group.description,lang)}</p></div>
    <div className="mt-5 grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {group.slugs.map(slug=>{const service=services.find(s=>s.slug===slug);if(!service)return null;
       return <article key={service.slug} className="avofis-card flex h-full flex-col rounded-[18px] border p-5 sm:p-6">
        <span className="avofis-icon-tile"><service.icon className="h-5 w-5" aria-hidden="true"/></span>
        <h3 className="mt-4 text-[17px] font-semibold text-[#F2F5FF]">{localized(service.title,lang)}</h3>
        <p className="mt-2 flex-1 text-[13px] leading-[1.8] text-[#B9C5DF]">{localized(service.lead,lang)}</p>
        <Link href={withLang("/hizmetler/"+service.slug,lang)} className="mt-4 inline-flex min-h-10 items-center gap-2 border-t border-[#dfbf59]/15 pt-3 text-[13px] font-semibold text-[#dfbf59]">{t.learn}<ArrowUpRight className="h-4 w-4" aria-hidden="true"/></Link>
       </article>;
      })}
    </div>
   </section>)}
  </div>
  <p className="mt-6 flex items-start gap-2 text-[12px] leading-[1.8] text-[#B9C5DF]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#dfbf59]" aria-hidden="true"/>{t.legal}</p>
 </PageFrame>;
}
