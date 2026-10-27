"use client";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, ChevronDown, Menu, Scale, X, type LucideIcon } from "lucide-react";
import { audiences,localized,services,siteLangs,type SiteLang,ui,withLang } from "@/lib/avofis-site";

const nav=[
 {key:"process",href:"/nasil-calisir"},
 {key:"info",href:"/bilgi"},
 {key:"contact",href:"/iletisim"}
] as const;
export function SiteHeader({lang,onLanguageChange}:{lang:SiteLang;onLanguageChange?:(l:SiteLang)=>void}){
 const [expanded,setExpanded]=useState(false),t=ui[lang];
 const changeLanguage=(value:SiteLang)=>{
  if(onLanguageChange){onLanguageChange(value);return;}
  if(typeof window!=="undefined"){const u=new URL(window.location.href);u.searchParams.set("lang",value);window.location.assign(u.pathname+u.search+u.hash);}
 };
 return <>
  <header className="sticky top-0 z-50 border-b border-[#dfbf59]/20 bg-[#030A22]/95 backdrop-blur-xl">
   <div className="avofis-container flex h-[70px] items-center justify-between gap-3">
    <Link href={withLang("/",lang)} className="inline-flex shrink-0 items-center gap-2.5" aria-label="AVOfis home">
      <span className="avofis-logo-icon"><Scale className="h-5 w-5" aria-hidden="true"/></span>
      <span className="text-[21px] font-semibold tracking-[-.055em] text-[#F2F5FF]">AVOfis<span className="text-[#dfbf59]">.</span></span>
    </Link>
    <nav className="hidden items-center gap-4 xl:flex" aria-label="Main navigation">
      <HeaderDropdown label={t.services} lang={lang} type="services"/>
      <HeaderDropdown label={t.audiences} lang={lang} type="audiences"/>
      {nav.map(item=><Link key={item.key} href={withLang(item.href,lang)} className="avofis-nav-link">{t[item.key]}</Link>)}
    </nav>
    <div className="hidden shrink-0 items-center gap-2 xl:flex">
      <div className="flex items-center rounded-lg border border-[#dfbf59]/20 p-1" aria-label="Language">
        {siteLangs.map(l=><button type="button" key={l} onClick={()=>changeLanguage(l)} aria-pressed={lang===l} className={"avofis-lang "+(lang===l?"avofis-lang-active":"")}>{l.toUpperCase()}</button>)}
      </div>
      <Link className="avofis-nav-link px-1" href="/auth/login">{t.login}</Link>
      <Link className="avofis-cta avofis-btn" href={withLang("/basvuru",lang)}>{t.intake}<ArrowUpRight className="h-4 w-4" aria-hidden="true"/></Link>
    </div>
    <button type="button" className="avofis-icon-btn xl:hidden" aria-expanded={expanded} aria-controls="avofis-mobile-menu" aria-label={expanded?"Close menu":"Open menu"} onClick={()=>setExpanded(v=>!v)}>{expanded?<X className="h-5 w-5"/>:<Menu className="h-5 w-5"/>}</button>
   </div>
   {expanded&&<nav id="avofis-mobile-menu" aria-label="Mobile navigation" className="max-h-[75vh] overflow-y-auto border-t border-[#dfbf59]/15 bg-[#030A22] xl:hidden">
    <div className="avofis-container grid gap-1 py-3">
      <Link onClick={()=>setExpanded(false)} className="avofis-mobile-link" href={withLang("/",lang)}>{t.home}</Link>
      <details className="avofis-mobile-group"><summary className="avofis-mobile-link cursor-pointer">{t.services}<ChevronDown className="ml-auto h-4 w-4"/></summary><div className="grid gap-1 pb-2 pl-3">{services.map(s=><Link onClick={()=>setExpanded(false)} key={s.slug} className="avofis-mobile-link text-[13px]" href={withLang("/hizmetler/"+s.slug,lang)}>{localized(s.title,lang)}</Link>)}<Link onClick={()=>setExpanded(false)} className="avofis-mobile-link text-[#dfbf59]" href={withLang("/hizmetler",lang)}>{t.allServices}</Link></div></details>
      <details className="avofis-mobile-group"><summary className="avofis-mobile-link cursor-pointer">{t.audiences}<ChevronDown className="ml-auto h-4 w-4"/></summary><div className="grid gap-1 pb-2 pl-3">{audiences.map(a=><Link onClick={()=>setExpanded(false)} key={a.slug} className="avofis-mobile-link text-[13px]" href={withLang("/kimler-icin/"+a.slug,lang)}>{localized(a.title,lang)}</Link>)}<Link onClick={()=>setExpanded(false)} className="avofis-mobile-link text-[#dfbf59]" href={withLang("/kimler-icin",lang)}>{t.allAudiences}</Link></div></details>
      {nav.map(item=><Link onClick={()=>setExpanded(false)} key={item.key} className="avofis-mobile-link" href={withLang(item.href,lang)}>{t[item.key]}</Link>)}
      <Link onClick={()=>setExpanded(false)} className="avofis-mobile-link" href="/auth/login">{t.login}</Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#dfbf59]/15 pt-3">
        <div className="flex rounded-lg border border-[#dfbf59]/25 p-1">{siteLangs.map(l=><button key={l} type="button" onClick={()=>changeLanguage(l)} className={"avofis-lang "+(lang===l?"avofis-lang-active":"")} aria-pressed={lang===l}>{l.toUpperCase()}</button>)}</div>
        <Link href={withLang("/basvuru",lang)} onClick={()=>setExpanded(false)} className="avofis-cta avofis-btn">{t.intake}<ArrowUpRight className="h-4 w-4" aria-hidden="true"/></Link>
      </div>
    </div>
   </nav>}
  </header>
 </>;
}
function HeaderDropdown({label,lang,type}:{label:string;lang:SiteLang;type:"services"|"audiences"}){
 const entries:typeListItem[]=type==="services"?services.map(s=>({slug:s.slug,title:localized(s.title,lang),icon:s.icon})):audiences.map(a=>({slug:a.slug,title:localized(a.title,lang),icon:a.icon}));
 const root=type==="services"?"/hizmetler":"/kimler-icin";
 return <details className="group relative">
   <summary className="avofis-nav-link flex cursor-pointer list-none items-center gap-1 py-5 [&::-webkit-details-marker]:hidden">{label}<ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180"/></summary>
   <div className="absolute left-[-170px] top-full w-[660px] rounded-b-[18px] border border-[#dfbf59]/25 bg-[#04102C] p-4 shadow-2xl">
     <div className="grid grid-cols-3 gap-1.5">
       {entries.map(item=><Link key={item.slug} href={withLang(root+"/"+item.slug,lang)} className="flex min-h-[70px] items-center gap-2.5 rounded-xl px-3 py-2 text-[12px] leading-[1.5] text-[#E4EAF5] hover:bg-[#071738]">
         <item.icon className="h-5 w-5 shrink-0 text-[#dfbf59]" strokeWidth={1.7} aria-hidden="true"/><span>{item.title}</span>
       </Link>)}
     </div>
     <Link href={withLang(root,lang)} className="mt-3 flex items-center gap-2 border-t border-[#dfbf59]/15 px-3 pt-3 text-[13px] font-semibold text-[#dfbf59]">{type==="services"?ui[lang].allServices:ui[lang].allAudiences}<ArrowUpRight className="h-4 w-4"/></Link>
   </div>
 </details>;
}
type typeListItem={slug:string;title:string;icon:LucideIcon};
export function SiteFooter({lang}:{lang:SiteLang}){
 const t=ui[lang];
 return <footer className="border-t border-[#dfbf59]/20 bg-[#04102C]">
  <div className="avofis-container grid gap-5 py-7 sm:grid-cols-[180px_minmax(0,1fr)]">
   <div><p className="text-xl font-semibold tracking-[-.04em] text-[#F2F5FF]">AVOfis<span className="text-[#dfbf59]">.</span></p><p className="mt-1 text-[12px] leading-5 text-[#B9C5DF]">{t.footer}</p></div>
   <div className="sm:text-right"><p className="text-[12px] leading-[1.8] text-[#B9C5DF]">{t.legal}</p>
    <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-[12px] font-semibold text-[#dfbf59] sm:justify-end">
     <Link href={withLang("/hizmetler",lang)}>{t.services}</Link><Link href={withLang("/nasil-calisir",lang)}>{t.process}</Link>
     <Link href={withLang("/gizlilik",lang)}>{t.privacy}</Link><Link href={withLang("/iletisim",lang)}>{t.contact}</Link>
     <span className="font-normal text-[#B9C5DF]">© {new Date().getFullYear()} AVOfis</span>
    </div>
   </div>
  </div>
 </footer>;
}
