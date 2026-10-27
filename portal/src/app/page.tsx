"use client";

import Link from "next/link";
import { ArrowUpRight, Building2, FileText, GraduationCap, Landmark, Languages, UserRoundCheck, type LucideIcon } from "lucide-react";
import { PublicNav } from "@/components/avofis/PublicNav";
import { copy,serviceCodes,type ServiceCode } from "@/lib/avofis-content";
import { usePortalLanguage } from "@/hooks/usePortalLanguage";

const icons:Record<ServiceCode,LucideIcon>={documents:FileText,translation:Languages,administration:Landmark,diplomas:GraduationCap,business:Building2,referral:UserRoundCheck};
const extras={
  tr:{scope:"İşlem başlamadan önce",scopeIntro:"Hizmet teklifi, aşağıdaki konuları ayrı ayrı açıklamalıdır.",scopeItems:["Yapılacak işlem ve kapsam dışı işler","İstenen belgeler ve işlemi yürütecek kişi","Hizmet ücreti, resmî harç, KDV ve üçüncü kişi giderleri"],browse:"Hizmet ayrıntıları",steps:"Bütün aşamalar her dosyada zorunlu değildir.",more:"Sürecin tamamını inceleyin",foot:"AVOfis, gerekli meslekî yetkileri olmayan işleri kendi adına yürütmez. Gerektiğinde bağımsız yetkili uzmanlara yönlendirme yapılır.",closed:"Çevrim içi ön başvuru henüz etkin değildir. Bu aşamada belge veya kişisel veri göndermeyin."},
  nl:{scope:"Vóór de opdracht",scopeIntro:"Het voorstel maakt de volgende punten afzonderlijk duidelijk.",scopeItems:["Wat wel en niet onder de opdracht valt","Benodigde stukken en de uitvoerende partij","Diensttarief, leges, btw en kosten van derden"],browse:"Bekijk de details",steps:"Niet elke stap is op ieder dossier van toepassing.",more:"Lees de volledige werkwijze",foot:"AVOfis verricht geen voorbehouden beroepswerkzaamheden zonder vereiste bevoegdheid. Waar nodig wordt verwezen naar onafhankelijke bevoegde specialisten.",closed:"Het online aanvraagformulier is nog niet actief. Stuur nog geen documenten of persoonsgegevens."},
  en:{scope:"Before work starts",scopeIntro:"The service proposal distinguishes these items.",scopeItems:["Included and excluded work","Required documents and responsible professionals","Service fee, official charges, VAT and third-party costs"],browse:"View service details",steps:"Not every stage applies to every case.",more:"Read the full process",foot:"AVOfis does not perform reserved professional services without the required authorisation. Where necessary, independent authorised specialists are engaged.",closed:"The online enquiry form is not yet active. Do not send documents or personal data."}
};
const enabled=process.env.NEXT_PUBLIC_AVOFIS_INTAKE_ENABLED==="true";
export default function HomePage(){
  const lang=usePortalLanguage(),c=copy[lang],t=extras[lang];
  const link=(path:string)=>path+"?lang="+lang;
  return <main className="avofis-theme min-h-screen">
    <PublicNav lang={lang}/>
    <section className="border-b border-[#dfbf59]/15">
      <div className="avofis-container grid gap-9 py-14 sm:py-16 lg:grid-cols-[minmax(0,1.18fr)_minmax(310px,.82fr)] lg:items-center lg:gap-12 lg:py-20">
        <div className="min-w-0">
          <p className="avofis-eyebrow">{c.eyebrow}</p>
          <h1 className="mt-4 max-w-[690px] text-[clamp(2rem,3.7vw,2.85rem)] font-semibold leading-[1.19] tracking-[-.04em] text-[#F2F5FF]">{c.headline}</h1>
          <p className="mt-5 max-w-[625px] text-[15px] leading-[1.85] text-[#B9C5DF]">{c.intro}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={link("/hizmetler")} className="avofis-cta avofis-btn">{c.browse}<ArrowUpRight className="h-4 w-4" aria-hidden="true"/></Link>
            <Link href={link("/nasil-calisir")} className="avofis-outline avofis-btn">{c.processNav}</Link>
          </div>
        </div>
        <aside className="avofis-card rounded-[18px] border p-5 sm:p-6">
          <h2 className="text-[18px] font-semibold text-[#F2F5FF]">{t.scope}</h2>
          <p className="mt-2 text-[14px] leading-7 text-[#B9C5DF]">{t.scopeIntro}</p>
          <ul className="mt-4 grid gap-3">{t.scopeItems.map((item,i)=><li key={item} className="flex gap-3 border-t border-[#dfbf59]/15 pt-3 text-[14px] leading-6 text-[#E1E8F5]"><span className="font-semibold text-[#dfbf59]">{i+1}.</span>{item}</li>)}</ul>
        </aside>
      </div>
    </section>
    <section className="bg-[#04102C] py-14 sm:py-16">
      <div className="avofis-container">
        <h2 className="avofis-h2">{c.servicesHeading}</h2>
        <p className="mt-3 max-w-3xl text-[14px] leading-7 text-[#B9C5DF]">{c.servicesIntro}</p>
        <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {serviceCodes.map(code=>{
            const s=c.serviceList.find(entry=>entry.id===code);if(!s)return null;
            const Icon=icons[code];
            return <article key={code} className="avofis-card flex min-w-0 flex-col rounded-[18px] border p-5 sm:p-6">
              <span className="avofis-icon-tile"><Icon className="h-5 w-5" strokeWidth={1.7} aria-hidden="true"/></span>
              <h3 className="mt-4 text-[17px] font-semibold leading-snug text-[#F2F5FF]">{s.title}</h3>
              <p className="mt-3 flex-1 text-[14px] leading-7 text-[#B9C5DF]">{s.description}</p>
              <Link className="mt-5 inline-flex min-h-11 items-center gap-2 border-t border-[#dfbf59]/15 pt-3 text-[14px] font-semibold text-[#dfbf59]" href={link("/hizmetler/"+code)}>{t.browse}<ArrowUpRight className="h-4 w-4" aria-hidden="true"/></Link>
            </article>;
          })}
        </div>
      </div>
    </section>
    <section className="py-14 sm:py-16">
      <div className="avofis-container">
        <h2 className="avofis-h2">{c.processHeading}</h2>
        <p className="mt-3 max-w-3xl text-[14px] leading-7 text-[#B9C5DF]">{c.processIntro}</p>
        <div className="mt-7 grid gap-4 md:grid-cols-3">
          {c.steps.map((step,i)=><article key={step.title} className="avofis-card rounded-[18px] border p-6"><div className="text-[14px] font-semibold text-[#dfbf59]">{String(i+1).padStart(2,"0")}</div><h3 className="mt-3 text-[17px] font-semibold">{step.title}</h3><p className="mt-3 text-[14px] leading-7 text-[#B9C5DF]">{step.description}</p></article>)}
        </div>
        <p className="mt-5 text-[13px] text-[#B9C5DF]">{t.steps}</p>
        <Link href={link("/nasil-calisir")} className="mt-4 inline-flex min-h-11 items-center gap-2 text-[14px] font-semibold text-[#dfbf59]">{t.more}<ArrowUpRight className="h-4 w-4" aria-hidden="true"/></Link>
      </div>
    </section>
    <section className="border-t border-[#dfbf59]/15 bg-[#04102C] py-12">
      <div className="avofis-container flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div><h2 className="text-[22px] font-semibold">{c.closeHeading}</h2><p className="mt-2 max-w-2xl text-[14px] leading-7 text-[#B9C5DF]">{enabled?c.closeText:t.closed}</p></div>
        <Link href={link("/basvuru")} className="avofis-outline avofis-btn shrink-0">{c.requestNav}<ArrowUpRight className="h-4 w-4" aria-hidden="true"/></Link>
      </div>
    </section>
    <footer className="border-t border-[#dfbf59]/15 bg-[#030A22]"><div className="avofis-container flex flex-col gap-3 py-8 text-[13px] leading-6 text-[#B9C5DF] sm:flex-row sm:justify-between"><p>AVOfis · {t.foot}</p><div className="flex gap-5"><Link href={link("/gizlilik")} className="min-h-11 content-center">{c.privacy}</Link><Link href={link("/iletisim")} className="min-h-11 content-center">{lang==="tr"?"İletişim":lang==="nl"?"Contact":"Contact"}</Link></div></div></footer>
  </main>;
}
