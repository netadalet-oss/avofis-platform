"use client";
import Link from "next/link";
import { useState } from "react";
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
 const [search,setSearch]=useState("");
 const [activeGroup,setActiveGroup]=useState("all");
 const locale=lang==="tr"?"tr-TR":lang==="nl"?"nl-NL":lang==="de"?"de-DE":"en-US";
 const term=search.trim().toLocaleLowerCase(locale);
 const visibleGroups=serviceGroups.filter(group=>activeGroup==="all"||group.id===activeGroup).map(group=>({
  group,
  matches:group.slugs.map(slug=>services.find(s=>s.slug===slug)).filter((s):s is typeof services[number]=>Boolean(s)).filter(s=>{
   if(!term)return true;
   return [localized(s.title,lang),localized(s.lead,lang),...s.items.map(item=>localized(item,lang))].join(" ").toLocaleLowerCase(locale).includes(term);
  })
 })).filter(item=>item.matches.length>0);
 return <PageFrame lang={lang} wide eyebrow={t.services} title={t.serviceHead} description={introductions[lang]}>
  <section className="avofis-card mb-8 rounded-[18px] border p-5 sm:p-6" aria-label={t.services}>
    <label htmlFor="service-search" className="mb-2 block text-[13px] font-semibold text-[#F2F5FF]">{lang==="tr"?"İşleminizi arayın":lang==="nl"?"Zoek uw dienst":lang==="de"?"Leistung suchen":"Find a service"}</label>
    <input id="service-search" className="avofis-field" type="search" autoComplete="off" value={search} onChange={e=>setSearch(e.target.value)} placeholder={lang==="tr"?"Örneğin: kira, alacak, oturum, itiraz":lang==="nl"?"Bijv. huur, incasso, verblijf, bezwaar":lang==="de"?"Z. B. Miete, Forderung, Aufenthalt":"E.g. rent, debts, residence, appeals"}/>
    <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label={lang==="tr"?"Hizmet grupları":"Service categories"}>
      <button type="button" aria-pressed={activeGroup==="all"} onClick={()=>setActiveGroup("all")} className={"min-h-10 rounded-lg border px-3 py-2 text-[12px] font-semibold "+(activeGroup==="all"?"border-[#dfbf59] bg-[#dfbf59] text-[#030A22]":"border-[#dfbf59]/25 text-[#DDE5F3] hover:border-[#dfbf59]/55")}>{t.allServices}</button>
      {serviceGroups.map(group=><button type="button" key={group.id} aria-pressed={activeGroup===group.id} onClick={()=>setActiveGroup(group.id)} className={"min-h-10 rounded-lg border px-3 py-2 text-[12px] font-semibold "+(activeGroup===group.id?"border-[#dfbf59] bg-[#dfbf59] text-[#030A22]":"border-[#dfbf59]/25 text-[#DDE5F3] hover:border-[#dfbf59]/55")}>{localized(group.title,lang)}</button>)}
    </div>
  </section>
  {visibleGroups.length===0&&<p role="status" className="avofis-card rounded-[14px] border p-5 text-[14px] leading-7 text-[#B9C5DF]">{lang==="tr"?"Bu aramaya uygun hizmet bulunamadı. Farklı bir kelime deneyin.":lang==="nl"?"Geen diensten gevonden. Probeer een andere zoekterm.":lang==="de"?"Keine passenden Leistungen gefunden. Versuchen Sie einen anderen Begriff.":"No matching services. Try another search term."}</p>}
  <div className="grid gap-12">
   {visibleGroups.map(({group,matches})=><section key={group.id} aria-labelledby={"group-"+group.id}>
    <div className="max-w-3xl"><h2 id={"group-"+group.id} className="avofis-h2">{localized(group.title,lang)}</h2><p className="mt-2 text-[14px] leading-[1.8] text-[#B9C5DF]">{localized(group.description,lang)}</p></div>
    <div className="mt-5 grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {matches.map(service=>{
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
