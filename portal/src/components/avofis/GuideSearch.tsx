"use client";
import {useMemo,useState} from "react";
import Link from "next/link";
import type {GuideRecord} from "@/lib/avofis-guide-registry";
export function GuideSearch({guides}:{guides:GuideRecord[]}){
 const [query,setQuery]=useState("");
 const [service,setService]=useState("all");
 const categories=useMemo(()=>[...new Set(guides.map(x=>x.relatedService))].sort(),[guides]);
 const visible=useMemo(()=>guides.filter(x=>(service==="all"||service===x.relatedService)&&
  (x.titleNl+" "+x.introNl+" "+x.slug).toLocaleLowerCase("nl-NL")
   .includes(query.trim().toLocaleLowerCase("nl-NL"))),[guides,query,service]);
 return <section aria-label="Redactionele gidsen" className="mt-8">
  <div className="grid gap-4 sm:grid-cols-[2fr_1fr]">
   <label className="block text-sm font-medium">Gidsen zoeken
    <input type="search" value={query} onChange={e=>setQuery(e.target.value)}
     placeholder="Zoek juridische informatie"
     className="mt-2 block min-h-12 w-full rounded-lg border border-[#dfbf59]/40 bg-[#102142] px-4 text-white"/>
   </label>
   <label className="block text-sm font-medium">Onderwerp
    <select value={service} onChange={e=>setService(e.target.value)}
     className="mt-2 block min-h-12 w-full rounded-lg border border-[#dfbf59]/40 bg-[#102142] px-4 text-white">
     <option value="all">Alle onderwerpen</option>
     {categories.map(c=><option key={c} value={c}>{c.replaceAll("-"," ")}</option>)}
    </select>
   </label>
  </div>
  <p aria-live="polite" className="mt-4 text-xs text-[#c8d4e6]">{visible.length} van {guides.length} gidsen · alleen redactionele concepten</p>
  <div className="mt-5 grid items-start gap-4 sm:grid-cols-2">
   {visible.map(g=><article key={g.slug} className="rounded-xl border border-[#dfbf59]/25 bg-[#102142] p-5">
    <p className="text-xs font-semibold text-[#dfbf59]">Gids {String(g.number).padStart(2,"0")} · Bronversie 29-10-2026</p>
    <h2 className="mt-2 text-lg font-semibold leading-7" lang="nl">{g.titleNl}</h2>
    <p className="mt-3 text-sm leading-7 text-[#d3ddec]" lang="nl">{g.introNl}</p>
    <div className="mt-4 flex flex-wrap gap-3 text-xs">
     <Link href={"/belge-hazirla?hizmet="+encodeURIComponent(g.relatedService)+"&lang=nl"}
      className="font-semibold text-[#dfbf59] underline">Voorbereidingsdocument</Link>
     <a href={g.officialSourceUrl} target="_blank" rel="noopener noreferrer"
      className="text-[#dfbf59] underline">Oorspronkelijke officiële bron</a>
    </div>
    <p className="mt-4 border-t border-[#dfbf59]/20 pt-3 text-xs leading-6 text-[#b7c6dc]">
     Juridische goedkeuring: ontbreekt · Taalcontrole: ontbreekt · Niet gepubliceerd
    </p>
   </article>)}
  </div>
  {visible.length===0&&<p className="mt-6 text-sm">Geen gidsen gevonden voor deze zoekopdracht.</p>}
 </section>;
}
