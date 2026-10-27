"use client";
import Link from "next/link";
import { ArrowUpRight,ShieldCheck } from "lucide-react";
import { PageFrame } from "@/components/avofis/PageFrame";
import { useSiteLang } from "@/hooks/useSiteLang";
import {localized,services,ui,withLang} from "@/lib/avofis-site";
const introductions={
 tr:"Vize ve oturumdan resmî itirazlara, uluslararası ticaretten insan haklarına kadar ihtiyaç duyduğunuz işlemi seçin. Her hizmette ülke, işlem türü ve meslekî yetki sınırları ayrıca değerlendirilir.",
 nl:"Van visa en verblijfsprocedures tot bezwaar, zakelijke dienstverlening en mensenrechten. De route wordt afgestemd op het land en de geldende beroepsregels.",
 de:"Von Visa und Aufenthalt über Widerspruch, Handel und Menschenrechte: Jedes Anliegen wird nach Land, Verfahren und rechtlicher Zuständigkeit eingeordnet.",
 en:"From visas and residency to public appeals, commerce and international human rights, each request is assessed by jurisdiction, procedure and professional authorisation."
};
export default function ServicesPage(){
 const lang=useSiteLang(),t=ui[lang];
 return <PageFrame lang={lang} wide eyebrow={t.services} title={t.serviceHead} description={introductions[lang]}>
  <div className="grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3">
   {services.map(service=><article key={service.slug} className="avofis-card flex h-full flex-col rounded-[18px] border p-5 sm:p-6">
    <span className="avofis-icon-tile"><service.icon className="h-5 w-5" aria-hidden="true"/></span>
    <h2 className="mt-4 text-[17px] font-semibold text-[#F2F5FF]">{localized(service.title,lang)}</h2>
    <p className="mt-2 flex-1 text-[13px] leading-[1.8] text-[#B9C5DF]">{localized(service.lead,lang)}</p>
    <Link href={withLang("/hizmetler/"+service.slug,lang)} className="mt-4 inline-flex min-h-10 items-center gap-2 border-t border-[#dfbf59]/15 pt-3 text-[13px] font-semibold text-[#dfbf59]">{t.learn}<ArrowUpRight className="h-4 w-4" aria-hidden="true"/></Link>
   </article>)}
  </div>
  <p className="mt-6 flex items-start gap-2 text-[12px] leading-[1.8] text-[#B9C5DF]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#dfbf59]" aria-hidden="true"/>{t.legal}</p>
 </PageFrame>;
}
