"use client";
import type { ReactNode } from "react";
import { SiteFooter,SiteHeader } from "@/components/avofis/SiteChrome";
import { useSiteLang } from "@/hooks/useSiteLang";
import { type SiteLang,ui } from "@/lib/avofis-site";
type Props={eyebrow:string;title:string;description?:string;children:ReactNode;wide?:boolean;lang?:SiteLang};
export function PageFrame({eyebrow,title,description,children,wide=false,lang:langProp}:Props){
 const detected=useSiteLang(),lang=langProp||detected,t=ui[lang];
 return <main className="avofis-theme min-h-screen">
   <SiteHeader lang={lang}/>
   <div className={"mx-auto w-full px-5 pb-16 pt-10 sm:px-7 sm:pt-12 "+(wide?"max-w-[1184px]":"max-w-4xl")}>
    <div className="max-w-3xl">
     <p className="avofis-eyebrow">{eyebrow}</p>
     <h1 className="mt-3 max-w-[760px] text-[clamp(1.9rem,3.5vw,2.8rem)] font-semibold leading-[1.18] tracking-[-.04em] text-[#F2F5FF]">{title}</h1>
     {description&&<p className="mt-4 max-w-[700px] text-[15px] leading-[1.8] text-[#B9C5DF]">{description}</p>}
    </div>
    <div className="mt-8">{children}</div>
   </div>
   <SiteFooter lang={lang}/>
 </main>;
}
