"use client";

import Link from "next/link";
import { ArrowLeft, Scale, ShieldCheck } from "lucide-react";
import type { ReactNode } from "react";
import type { Language } from "@/lib/avofis-content";

type Props={eyebrow:string;title:string;description?:string;children:ReactNode;wide?:boolean;lang?:Language};
const ui={
  tr:{home:"Ana sayfa",status:"Faaliyet ve müşteri kabulü henüz açılmadı.",foot:"Hollanda–Türkiye belge ve idarî işlem hazırlığı"},
  nl:{home:"Home",status:"Nog niet geopend voor klanten.",foot:"Documenten en administratieve voorbereiding"},
  en:{home:"Home",status:"Client services are not open yet.",foot:"Document and administrative preparation"}
};
export function PageFrame({eyebrow,title,description,children,wide=false,lang="tr"}:Props){
  const t=ui[lang];
  return <main className="avofis-theme min-h-screen">
    <header className="border-b border-[#dfbf59]/15 bg-[#04102C]">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-7">
        <Link href={"/?lang="+lang} className="inline-flex items-center gap-2.5" aria-label="AVOfis">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-[10px] border border-[#dfbf59]/30 bg-[#071738] text-[#dfbf59]"><Scale className="h-[18px] w-[18px]" strokeWidth={1.7} aria-hidden="true"/></span>
          <span className="text-xl font-semibold tracking-[-.05em] text-[#F2F5FF]">AVOfis<span className="text-[#dfbf59]">.</span></span>
        </Link>
        <Link href={"/?lang="+lang} className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-[13px] font-medium text-[#C4CEE2] hover:text-[#f0d56d]"><ArrowLeft className="h-4 w-4" aria-hidden="true"/>{t.home}</Link>
      </div>
    </header>
    <div className={"mx-auto w-full px-5 pb-14 pt-9 sm:px-7 sm:pt-12 "+(wide?"max-w-6xl":"max-w-4xl")}>
      <div className="max-w-3xl">
        <p className="text-[11px] font-semibold uppercase tracking-[.13em] text-[#dfbf59]">{eyebrow}</p>
        <h1 className="mt-2 text-[clamp(1.85rem,3vw,2.4rem)] font-semibold leading-[1.2] tracking-[-.04em] text-[#F2F5FF]">{title}</h1>
        {description&&<p className="mt-3 max-w-[690px] text-[14px] leading-[1.8] text-[#B9C5DF]">{description}</p>}
      </div>
      <div className="mt-8">{children}</div>
    </div>
    <footer className="border-t border-[#dfbf59]/15 bg-[#04102C]">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-5 py-5 text-xs leading-5 text-[#ACB9D3] sm:flex-row sm:items-center sm:justify-between sm:px-7">
        <span>AVOfis · {t.foot}</span>
        <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-[#dfbf59]" aria-hidden="true"/>{t.status}</span>
      </div>
    </footer>
  </main>;
}
