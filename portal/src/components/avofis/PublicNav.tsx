"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useState } from "react";
import type { Language } from "@/lib/avofis-content";

const labels = {
  tr: { home:"Ana Sayfa", services:"Hizmetler", process:"Nasıl Çalışır?", info:"Bilgi Merkezi", contact:"İletişim", login:"Müşteri Girişi", intake:"Ön Başvuru", menu:"Menüyü aç", close:"Menüyü kapat", language:"Dil seçimi" },
  nl: { home:"Home", services:"Diensten", process:"Hoe werkt het?", info:"Informatie", contact:"Contact", login:"Klantlogin", intake:"Aanvraag", menu:"Menu openen", close:"Menu sluiten", language:"Taalkeuze" },
  en: { home:"Home", services:"Services", process:"How it works", info:"Information", contact:"Contact", login:"Client login", intake:"Enquiry", menu:"Open menu", close:"Close menu", language:"Language" }
};
// Full six-language catalogue is navigable; only TR/NL/EN have these core
// route translations. DE/AR/RU link to the explicitly review-pending catalogue.
const languages = ["tr","nl","de","en","ar","ru"] as const;

export function PublicNav({lang}: {lang: Language}) {
  const [open,setOpen] = useState(false);
  const pathname = usePathname();
  const t = labels[lang];
  const link = (path:string) => path + "?lang=" + lang;
  const items = [
    {title:t.home,href:"/"},
    {title:t.services,href:"/hizmetler"},
    {title:lang==="tr"?"Güvenli triyaj":lang==="nl"?"Veilige oriëntatie":"Safe triage",href:"/triyaj"},
    {title:t.process,href:"/nasil-calisir"},
    {title:t.info,href:"/bilgi"},
    {title:"6 dil / 6 talen",href:"/diller"},
    {title:t.contact,href:"/iletisim"},
    {title:t.login,href:"/auth/login"}
  ];
  const languageHref=(code:(typeof languages)[number])=>
   code==="de"||code==="ar"||code==="ru"?"/katalog?lang="+code:pathname+"?lang="+code;
  const languageControl = <div className="flex flex-wrap items-center gap-1 rounded-lg border border-[#dfbf59]/25 p-1" aria-label={t.language}>
    {languages.map(code=><a key={code} href={languageHref(code)} lang={code} hrefLang={code} aria-current={lang===code?"true":undefined} className={"flex min-h-11 min-w-11 items-center justify-center rounded-md text-xs font-semibold "+(code===lang?"bg-[#dfbf59] text-[#030A22]":"text-[#E1E8F5] hover:bg-[#071738]")}>{code.toUpperCase()}</a>)}
  </div>;

  return <header className="sticky top-0 z-50 border-b border-[#dfbf59]/20 bg-[#030A22]/95 backdrop-blur-xl">
    <div className="avofis-container flex min-h-[72px] items-center justify-between gap-3">
      <Link href={link("/")} aria-label="AVOfis ana sayfa" className="flex shrink-0 items-center gap-2.5 text-[#F2F5FF]">
        <span className="avofis-logo-icon text-xl font-semibold" aria-hidden="true">A</span>
        <span className="text-[21px] font-semibold tracking-tight">AVOfis<span className="text-[#dfbf59]">.</span></span>
      </Link>
      <nav aria-label={t.menu} className="hidden items-center gap-4 xl:flex">
        {items.map(item=><Link key={item.href} href={link(item.href)} className="avofis-nav-link inline-flex min-h-11 items-center text-[13px]">{item.title}</Link>)}
      </nav>
      <div className="hidden items-center gap-2 xl:flex">
        {languageControl}
        <Link href={link("/basvuru")} className="avofis-cta avofis-btn">{t.intake}</Link>
      </div>
      <button type="button" aria-controls="avofis-main-menu" aria-expanded={open} aria-label={open?t.close:t.menu} onClick={()=>setOpen(!open)} className="avofis-icon-btn xl:hidden">{open?<X className="h-5 w-5" aria-hidden="true"/>:<Menu className="h-5 w-5" aria-hidden="true"/>}</button>
    </div>
    {open&&<nav id="avofis-main-menu" aria-label={t.menu} className="avofis-container grid gap-1 border-t border-[#dfbf59]/15 py-3 xl:hidden">
      {items.map(item=><Link key={item.href} href={link(item.href)} onClick={()=>setOpen(false)} className="avofis-mobile-link min-h-11">{item.title}</Link>)}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#dfbf59]/15 pt-3">
        {languageControl}
        <Link href={link("/basvuru")} onClick={()=>setOpen(false)} className="avofis-cta avofis-btn">{t.intake}</Link>
      </div>
    </nav>}
  </header>;
}
