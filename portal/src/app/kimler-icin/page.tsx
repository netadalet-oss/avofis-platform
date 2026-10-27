"use client";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PageFrame } from "@/components/avofis/PageFrame";
import { useSiteLang } from "@/hooks/useSiteLang";
import { audiences,localized,ui,withLang } from "@/lib/avofis-site";
const intro={
 tr:"Türkiye bağlantısı olsun veya olmasın, Avrupa ülkelerinin içinde ve arasında hukukî, idarî, ticari veya kişisel işlem ihtiyacı bulunan bireyler, aileler ve işletmeler için hizmet yolları.",
 nl:"Ondersteuning voor personen, gezinnen en ondernemingen binnen en tussen Europese landen, met of zonder band met Turkije.",
 de:"Unterstützung für Privatpersonen, Familien und Unternehmen innerhalb und zwischen europäischen Staaten — auch ohne Bezug zur Türkei.",
 en:"Support for individuals, families and businesses dealing with legal, public or commercial matters within and between European countries, with or without Türkiye links."
};
export default function AudiencesPage(){
 const lang=useSiteLang(),t=ui[lang];
 return <PageFrame lang={lang} wide eyebrow={t.audiences} title={t.audienceHead} description={intro[lang]}>
   <div className="grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3">
    {audiences.map(a=><article key={a.slug} className="avofis-card flex h-full flex-col rounded-[18px] border p-5 sm:p-6">
      <span className="avofis-icon-tile"><a.icon className="h-5 w-5" aria-hidden="true"/></span>
      <h2 className="mt-4 text-[16px] font-semibold text-[#F2F5FF]">{localized(a.title,lang)}</h2>
      <p className="mt-2 flex-1 text-[13px] leading-[1.8] text-[#B9C5DF]">{localized(a.lead,lang)}</p>
      <Link href={withLang("/kimler-icin/"+a.slug,lang)} className="mt-4 inline-flex min-h-10 items-center gap-2 border-t border-[#dfbf59]/15 pt-3 text-[13px] font-semibold text-[#dfbf59]">{t.learn}<ArrowUpRight className="h-4 w-4"/></Link>
    </article>)}
   </div>
 </PageFrame>;
}
