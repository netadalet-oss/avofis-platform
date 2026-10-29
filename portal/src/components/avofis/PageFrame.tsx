"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Language } from "@/lib/avofis-content";
import { PublicNav } from "@/components/avofis/PublicNav";

type Props = {eyebrow:string;title:string;description?:string;children:ReactNode;wide?:boolean;lang?:Language};
const footer = {
  tr:{description:"Hollanda ve Türkiye bağlantılı belge ve idarî işlemler",privacy:"Gizlilik",contact:"İletişim"},
  nl:{description:"Documenten en administratieve procedures in Nederland en Turkije",privacy:"Privacy",contact:"Contact"},
  en:{description:"Document and administrative procedures involving the Netherlands and Türkiye",privacy:"Privacy",contact:"Contact"}
};
export function PageFrame({eyebrow,title,description,children,wide=false,lang="tr"}:Props){
  const t=footer[lang];
  return <main className="avofis-theme min-h-screen">
    <PublicNav lang={lang}/>
    <div className={"mx-auto w-full px-5 pb-16 pt-10 sm:px-7 sm:pt-12 "+(wide?"max-w-6xl":"max-w-4xl")}>
      <div className="max-w-3xl">
        <p className="avofis-eyebrow">{eyebrow}</p>
        <h1 className="avofis-page-title mt-3">{title}</h1>
        {description&&<p className="mt-4 max-w-[690px] text-[15px] leading-[1.8] text-[#B9C5DF]">{description}</p>}
      </div>
      <div className="mt-8">{children}</div>
    </div>
    <footer className="border-t border-[#dfbf59]/15 bg-[#04102C]">
      <div className="avofis-container flex flex-col gap-3 py-7 text-[13px] leading-6 text-[#B9C5DF] sm:flex-row sm:items-center sm:justify-between">
        <span>AVOfis · {t.description}</span>
        <div className="flex gap-5"><Link href={"/gizlilik?lang="+lang} className="min-h-11 content-center hover:text-[#f0d56d]">{t.privacy}</Link><Link href={"/iletisim?lang="+lang} className="min-h-11 content-center hover:text-[#f0d56d]">{t.contact}</Link><Link href={"/cerezler?lang="+lang} className="min-h-11 content-center hover:text-[#f0d56d]">{lang==="tr"?"Çerezler":lang==="nl"?"Cookies":"Cookies"}</Link><Link href="/uyum" className="min-h-11 content-center hover:text-[#f0d56d]">{lang==="tr"?"Yayın durumu":lang==="nl"?"Vrijgave":"Release status"}</Link></div>
      </div>
    </footer>
  </main>;
}
