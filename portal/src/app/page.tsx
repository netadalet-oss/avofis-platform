"use client";

import Link from "next/link";
import { useEffect,useState } from "react";
import {
  ArrowRight, ArrowUpRight, Building2, Check,
  ClipboardCheck, FileText, GraduationCap, Languages,
  Landmark, Menu, Scale, ShieldCheck, UserRoundCheck, X,
  type LucideIcon,
} from "lucide-react";
import { copy, serviceCodes, type Language, type ServiceCode } from "@/lib/avofis-content";

const icons: Record<ServiceCode, LucideIcon> = {
  documents: FileText,
  translation: Languages,
  administration: Landmark,
  diplomas: GraduationCap,
  business: Building2,
  referral: UserRoundCheck,
};
const langs: Language[] = ["tr","nl","en"];
const isIntakeOpen = process.env.NEXT_PUBLIC_AVOFIS_INTAKE_ENABLED === "true";

export default function HomePage() {
  const [lang,setLang] = useState<Language>("tr");
  useEffect(()=>{
    const requested=new URLSearchParams(window.location.search).get("lang");
    if(requested==="tr"||requested==="nl"||requested==="en") setLang(requested);
  },[]);
  const [mobileOpen,setMobileOpen] = useState(false);
  const c = copy[lang];
  const to = (pathname:string) => pathname + "?lang=" + lang;

  const navItems = [
    { href:"#services",label:c.servicesNav },
    { href:"#process",label:c.processNav },
    { href:to("/bilgi"),label:c.infoNav },
  ];

  return (
    <main className="avofis-theme min-h-screen">
      <div className="border-b border-[#dfbf59]/10 bg-[#04102C]">
        <div className="avofis-container flex min-h-9 items-center gap-2 py-1.5 text-[11px] leading-5 text-[#B9C5DF]">
          <span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#dfbf59]"/>
          <span>{c.status}</span>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-[#dfbf59]/15 bg-[#030A22]/95 backdrop-blur-xl">
        <div className="avofis-container flex h-[68px] items-center justify-between gap-4">
          <Link href="/" className="inline-flex shrink-0 items-center gap-2.5" aria-label="AVOfis">
            <span className="avofis-logo-icon"><Scale aria-hidden="true" className="h-[20px] w-[20px]" strokeWidth={1.7}/></span>
            <span className="text-[21px] font-semibold tracking-[-.055em] text-[#F2F5FF]">AVOfis<span className="text-[#dfbf59]">.</span></span>
          </Link>
          <nav aria-label="Main navigation" className="hidden items-center gap-6 lg:flex">
            {navItems.map(item => item.href.startsWith("#")
              ? <a className="avofis-nav-link" href={item.href} key={item.href}>{item.label}</a>
              : <Link className="avofis-nav-link" href={item.href} key={item.href}>{item.label}</Link>)}
            <Link className="avofis-nav-link" href="/musteri">{c.accountNav}</Link>
          </nav>
          <div className="hidden shrink-0 items-center gap-2.5 lg:flex">
            <div className="inline-flex rounded-lg border border-[#dfbf59]/25 p-1" aria-label="Language">
              {langs.map(l=><button key={l} type="button" aria-pressed={lang===l} onClick={()=>setLang(l)} className={"avofis-lang "+(lang===l?"avofis-lang-active":"")}>{l.toUpperCase()}</button>)}
            </div>
            <Link href={to("/basvuru")} className="avofis-cta avofis-btn">{c.requestNav}<ArrowUpRight className="h-4 w-4" aria-hidden="true"/></Link>
          </div>
          <button type="button" className="avofis-icon-btn lg:hidden" aria-label={mobileOpen?"Close menu":"Open menu"} aria-controls="avofis-mobile-navigation" aria-expanded={mobileOpen} onClick={()=>setMobileOpen(!mobileOpen)}>{mobileOpen?<X className="h-5 w-5"/>:<Menu className="h-5 w-5"/>}</button>
        </div>
        {mobileOpen&&<nav id="avofis-mobile-navigation" aria-label="Mobile navigation" className="avofis-container grid gap-1 border-t border-[#dfbf59]/15 py-3 lg:hidden">
          {navItems.map(item=>item.href.startsWith("#")
            ? <a key={item.href} href={item.href} onClick={()=>setMobileOpen(false)} className="avofis-mobile-link">{item.label}</a>
            : <Link key={item.href} href={item.href} onClick={()=>setMobileOpen(false)} className="avofis-mobile-link">{item.label}</Link>)}
          <Link className="avofis-mobile-link" href="/musteri" onClick={()=>setMobileOpen(false)}>{c.accountNav}</Link>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#dfbf59]/10 pt-3">
            <div className="flex items-center rounded-lg border border-[#dfbf59]/25 p-1">{langs.map(l=><button type="button" key={l} onClick={()=>setLang(l)} aria-pressed={lang===l} className={"avofis-lang "+(lang===l?"avofis-lang-active":"")}>{l.toUpperCase()}</button>)}</div>
            <Link href={to("/basvuru")} onClick={()=>setMobileOpen(false)} className="avofis-cta avofis-btn">{c.requestNav}<ArrowUpRight aria-hidden="true" className="h-4 w-4"/></Link>
          </div>
        </nav>}
      </header>

      <section className="border-b border-[#dfbf59]/10">
        <div className="avofis-container grid items-center gap-9 py-14 sm:py-16 lg:grid-cols-[minmax(0,1.25fr)_minmax(310px,.75fr)] lg:gap-12 lg:py-[76px]">
          <div className="min-w-0">
            <p className="avofis-eyebrow">{c.eyebrow}</p>
            <h1 className="mt-4 max-w-[685px] text-[clamp(2rem,3.6vw,2.9rem)] font-semibold leading-[1.17] tracking-[-.047em] text-[#F2F5FF]">{c.headline}</h1>
            <p className="mt-5 max-w-[620px] text-[15px] leading-[1.85] text-[#B9C5DF]">{c.intro}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="#services" className="avofis-cta avofis-btn">{c.browse}<ArrowRight className="h-4 w-4" aria-hidden="true"/></a>
              <Link href={to("/basvuru")} className="avofis-outline avofis-btn">{c.enquiryStatus}<ArrowUpRight className="h-4 w-4" aria-hidden="true"/></Link>
            </div>
          </div>
          <aside className="avofis-card rounded-[20px] border p-5 sm:p-6">
            <div className="flex items-start gap-3.5 border-b border-[#dfbf59]/15 pb-4">
              <span className="avofis-icon-tile"><ClipboardCheck className="h-5 w-5" aria-hidden="true"/></span>
              <div className="min-w-0">
                <h2 className="text-[17px] font-semibold leading-snug text-[#F2F5FF]">{c.cardHeading}</h2>
                <p className="mt-1 text-[13px] leading-[1.7] text-[#B9C5DF]">{c.cardSubheading}</p>
              </div>
            </div>
            <div className="mt-3 grid gap-1">
              {[c.cardScope,c.cardDocuments,c.cardFee].map(item=>
                <div key={item} className="flex items-start gap-3 rounded-lg px-1 py-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#dfbf59]" aria-hidden="true"/>
                  <span className="text-[13px] leading-[1.65] text-[#D9E2F2]">{item}</span>
                </div>)}
            </div>
            <p className="mt-3 border-t border-[#dfbf59]/15 pt-3 text-[12px] leading-[1.7] text-[#AEBBD5]">{c.cardNote}</p>
          </aside>
        </div>
      </section>

      <section id="services" className="bg-[#04102C] py-14 sm:py-16">
        <div className="avofis-container">
          <div className="avofis-section-heading">
            <h2 className="avofis-h2">{c.servicesHeading}</h2>
            <p className="avofis-section-desc">{c.servicesIntro}</p>
          </div>
          <div className="mt-7 grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {serviceCodes.map(key=>{
              const s=c.serviceList.find(item=>item.id===key);
              if(!s)return null;
              const Icon=icons[key];
              return <article key={key} className="avofis-card avofis-service-card flex h-full min-w-0 flex-col rounded-[18px] border p-5 sm:p-6">
                <div className="flex items-center justify-between gap-3">
                  <span className="avofis-icon-tile"><Icon className="h-5 w-5" aria-hidden="true" strokeWidth={1.7}/></span>
                  <span className="text-[11px] font-medium text-[#dfbf59]">{s.category}</span>
                </div>
                <h3 className="mt-4 text-[16px] font-semibold leading-snug text-[#F2F5FF]">{s.title}</h3>
                <p className="mt-2 flex-1 text-[13px] leading-[1.8] text-[#B9C5DF]">{s.description}</p>
                <Link href={to("/hizmetler")+"#"+key} className="mt-4 inline-flex min-h-10 items-center gap-1.5 border-t border-[#dfbf59]/15 pt-3 text-[13px] font-semibold text-[#dfbf59]">
                  {c.detailLink}<ArrowUpRight aria-hidden="true" className="h-4 w-4"/>
                </Link>
              </article>;
            })}
          </div>
        </div>
      </section>

      <section id="process" className="py-14 sm:py-16">
        <div className="avofis-container">
          <div className="avofis-section-heading">
            <h2 className="avofis-h2">{c.processHeading}</h2><p className="avofis-section-desc">{c.processIntro}</p>
          </div>
          <div className="mt-7 grid items-stretch gap-3 md:grid-cols-3">
            {c.steps.map((step,i)=><article key={step.title} className="avofis-card flex h-full min-w-0 items-start gap-3.5 rounded-[18px] border p-5">
              <span className="avofis-icon-tile shrink-0 text-[12px] font-semibold">{i+1}</span>
              <div className="min-w-0"><h3 className="text-[15px] font-semibold leading-snug text-[#F2F5FF]">{step.title}</h3><p className="mt-2 text-[13px] leading-[1.8] text-[#B9C5DF]">{step.description}</p></div>
            </article>)}
          </div>
        </div>
      </section>

      <section id="principles" className="border-y border-[#dfbf59]/10 bg-[#071738] py-14 sm:py-16">
        <div className="avofis-container">
          <h2 className="avofis-h2">{c.principlesHeading}</h2>
          <div className="mt-7 grid gap-3 md:grid-cols-3">
            {c.principles.map(item=><article key={item.title} className="avofis-card flex h-full min-w-0 items-start gap-3.5 rounded-[18px] border p-5">
              <span className="avofis-icon-tile shrink-0"><ShieldCheck className="h-5 w-5" aria-hidden="true"/></span>
              <div className="min-w-0"><h3 className="text-[15px] font-semibold leading-snug text-[#F2F5FF]">{item.title}</h3><p className="mt-2 text-[13px] leading-[1.8] text-[#B9C5DF]">{item.description}</p></div>
            </article>)}
          </div>
        </div>
      </section>

      <section className="py-11 sm:py-12">
        <div className="avofis-container">
          <div className="avofis-card flex flex-col gap-5 rounded-[18px] border p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
            <div><h2 className="text-[22px] font-semibold leading-snug tracking-[-.025em] text-[#F2F5FF]">{c.closeHeading}</h2><p className="mt-2 max-w-[680px] text-[13px] leading-[1.8] text-[#B9C5DF]">{c.closeText}</p></div>
            <Link href={to("/basvuru")} className="avofis-cta avofis-btn shrink-0">{isIntakeOpen?c.requestNav:c.closeAction}<ArrowUpRight className="h-4 w-4" aria-hidden="true"/></Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-[#dfbf59]/15 bg-[#04102C]">
        <div className="avofis-container grid gap-4 py-7 md:grid-cols-[180px_minmax(0,1fr)] md:gap-8">
          <div><span className="text-lg font-semibold tracking-[-.05em] text-[#F2F5FF]">AVOfis<span className="text-[#dfbf59]">.</span></span><p className="mt-1 text-xs text-[#B9C5DF]">{c.eyebrow}</p></div>
          <div className="md:text-right"><p className="text-[12px] leading-[1.75] text-[#B9C5DF]">{c.footerScope}</p>
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[12px] font-semibold text-[#dfbf59] md:justify-end">
              <Link href={to("/hizmetler")}>{c.serviceDetail}</Link><Link href={to("/bilgi")}>{c.info}</Link><Link href={to("/gizlilik")}>{c.privacy}</Link>
              <span className="font-normal text-[#B9C5DF]">© {new Date().getFullYear()} AVOfis</span>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
