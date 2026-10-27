"use client";
import Link from "next/link";
import { ArrowRight,ArrowUpRight,CheckCircle2,FolderCheck,Globe2,MessageSquareText,ShieldCheck } from "lucide-react";
import { SiteFooter,SiteHeader } from "@/components/avofis/SiteChrome";
import { useSiteLang } from "@/hooks/useSiteLang";
import { services,audiences,processSteps,localized,ui,withLang } from "@/lib/avofis-site";

export default function HomePage(){
 const lang=useSiteLang(),t=ui[lang];
 return <main className="avofis-theme min-h-screen">
  <SiteHeader lang={lang}/>
  <section className="border-b border-[#dfbf59]/10">
   <div className="avofis-container grid items-center gap-8 py-14 sm:py-16 lg:grid-cols-[minmax(0,1.18fr)_minmax(320px,.82fr)] lg:gap-12 lg:py-[72px]">
    <div className="min-w-0">
      <p className="avofis-eyebrow"><Globe2 className="h-4 w-4" aria-hidden="true"/>{t.countries}</p>
      <h1 className="mt-5 max-w-[710px] text-[clamp(2.15rem,4.15vw,3.55rem)] font-semibold leading-[1.14] tracking-[-.046em] text-[#F2F5FF]">{t.introTitle}</h1>
      <p className="mt-5 max-w-[650px] text-[15px] leading-[1.85] text-[#B9C5DF]">{t.intro}</p>
      <div className="mt-7 flex flex-wrap gap-3">
       <Link href={withLang("/hizmetler",lang)} className="avofis-cta avofis-btn">{t.services}<ArrowRight className="h-4 w-4" aria-hidden="true"/></Link>
       <Link href={withLang("/basvuru",lang)} className="avofis-outline avofis-btn">{t.intake}<ArrowUpRight className="h-4 w-4" aria-hidden="true"/></Link>
      </div>
    </div>
    <aside className="avofis-card overflow-hidden rounded-[20px] border p-5 sm:p-6" aria-label={t.support}>
      <div className="flex items-start gap-3.5"><span className="avofis-icon-tile"><FolderCheck className="h-5 w-5" aria-hidden="true"/></span>
        <div><h2 className="text-[17px] font-semibold leading-snug text-[#F2F5FF]">{t.support}</h2><p className="mt-1 text-[13px] leading-[1.75] text-[#B9C5DF]">{t.searchHelp}</p></div>
      </div>
      <div className="mt-4 grid gap-1.5">
        {services.slice(0,6).map(s=><Link href={withLang("/hizmetler/"+s.slug,lang)} key={s.slug} className="flex min-h-[44px] items-center gap-3 rounded-lg border border-[#dfbf59]/10 bg-[#071738]/75 px-3 py-2 text-[13px] font-medium text-[#E4EAF5] hover:border-[#dfbf59]/45">
         <s.icon className="h-4 w-4 shrink-0 text-[#dfbf59]" strokeWidth={1.8} aria-hidden="true"/><span className="min-w-0 flex-1">{localized(s.title,lang)}</span><ArrowUpRight className="h-4 w-4 shrink-0 text-[#dfbf59]" aria-hidden="true"/>
        </Link>)}
      </div>
      <Link href={withLang("/hizmetler",lang)} className="mt-4 inline-flex min-h-9 items-center gap-2 text-[13px] font-semibold text-[#dfbf59]">{t.seeAll}<ArrowRight className="h-4 w-4" aria-hidden="true"/></Link>
    </aside>
   </div>
  </section>
  <section id="services" className="border-b border-[#dfbf59]/10 bg-[#04102C] py-14 sm:py-16">
    <div className="avofis-container">
      <div className="avofis-section-heading"><h2 className="avofis-h2">{t.serviceHead}</h2><p className="avofis-section-desc">{t.serviceDesc}</p></div>
      <div className="mt-7 grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3">
       {services.map(s=><article key={s.slug} className="avofis-card avofis-service-card flex h-full flex-col rounded-[18px] border p-5">
          <span className="avofis-icon-tile"><s.icon className="h-5 w-5" aria-hidden="true"/></span>
          <h3 className="mt-4 text-[16px] font-semibold leading-snug text-[#F2F5FF]">{localized(s.title,lang)}</h3>
          <p className="mt-2 flex-1 text-[13px] leading-[1.8] text-[#B9C5DF]">{localized(s.lead,lang)}</p>
          <Link className="mt-4 inline-flex min-h-10 items-center gap-2 border-t border-[#dfbf59]/15 pt-3 text-[13px] font-semibold text-[#dfbf59]" href={withLang("/hizmetler/"+s.slug,lang)}>{t.learn}<ArrowUpRight className="h-4 w-4" aria-hidden="true"/></Link>
       </article>)}
      </div>
    </div>
  </section>
  <section id="audiences" className="py-14 sm:py-16">
    <div className="avofis-container">
      <div className="flex flex-wrap items-end justify-between gap-4"><h2 className="avofis-h2">{t.audienceHead}</h2><Link href={withLang("/kimler-icin",lang)} className="inline-flex min-h-10 items-center gap-2 text-[13px] font-semibold text-[#dfbf59]">{t.allAudiences}<ArrowRight className="h-4 w-4"/></Link></div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
       {audiences.map(a=><Link href={withLang("/kimler-icin/"+a.slug,lang)} key={a.slug} className="avofis-card flex min-h-[98px] items-start gap-3 rounded-[16px] border p-4 transition hover:border-[#dfbf59]/50">
         <span className="avofis-icon-tile shrink-0"><a.icon className="h-5 w-5" aria-hidden="true"/></span>
         <span className="min-w-0"><span className="block text-[15px] font-semibold leading-snug text-[#F2F5FF]">{localized(a.title,lang)}</span><span className="mt-1 block text-[12px] leading-[1.6] text-[#B9C5DF]">{localized(a.lead,lang)}</span></span>
       </Link>)}
      </div>
    </div>
  </section>
  <section id="process" className="border-y border-[#dfbf59]/10 bg-[#071738] py-14 sm:py-16">
    <div className="avofis-container">
      <div className="flex flex-wrap items-end justify-between gap-4"><h2 className="avofis-h2">{t.steps}</h2><Link href={withLang("/nasil-calisir",lang)} className="inline-flex min-h-10 items-center gap-2 text-[13px] font-semibold text-[#dfbf59]">{t.learn}<ArrowUpRight className="h-4 w-4"/></Link></div>
      <div className="mt-7 grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-5">
       {processSteps.map((step,i)=><div key={i} className="avofis-card flex h-full min-w-0 items-start gap-3 rounded-[16px] border p-4 lg:flex-col">
        <span className="avofis-icon-tile shrink-0 text-[13px] font-semibold tabular-nums">{String(i+1).padStart(2,"0")}</span>
        <h3 className="text-[14px] font-semibold leading-[1.5] text-[#F2F5FF]">{localized(step,lang)}</h3>
       </div>)}
      </div>
    </div>
  </section>
  <section className="py-11 sm:py-12">
    <div className="avofis-container">
      <div className="avofis-card flex flex-col items-start gap-5 rounded-[18px] border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
        <div><h2 className="text-[22px] font-semibold leading-snug text-[#F2F5FF]">{t.support}</h2><p className="mt-2 max-w-[620px] text-[13px] leading-[1.8] text-[#B9C5DF]">{t.noPublicCase}</p></div>
        <div className="flex flex-wrap gap-2"><Link href={withLang("/basvuru",lang)} className="avofis-cta avofis-btn">{t.intake}<ArrowUpRight className="h-4 w-4" aria-hidden="true"/></Link><Link href="/musteri" className="avofis-outline avofis-btn">{t.account}</Link></div>
      </div>
    </div>
  </section>
  <SiteFooter lang={lang}/>
 </main>;
}
