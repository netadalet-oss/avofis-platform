import Link from "next/link";
import {notFound} from "next/navigation";
import {guideEditorialPreviewAllowed,legalGuides,guideSourceVersion} from "@/lib/avofis-guide-registry";
import {GuideSearch} from "@/components/avofis/GuideSearch";
export const dynamic="force-dynamic";
export const metadata={title:"Hukuk rehberleri — editoryal önizleme | AVOfis",
 robots:{index:false,follow:false}};
export default function EditorialGuidesPage(){
 if(!guideEditorialPreviewAllowed(process.env))notFound();
 return <main className="avofis-theme min-h-screen px-5 py-10 text-white" lang="nl">
  <div className="mx-auto max-w-5xl">
   <nav className="flex gap-6 border-b border-[#dfbf59]/30 pb-4 text-sm">
    <Link href="/bilgi" className="text-[#dfbf59] underline">Informatiecentrum</Link>
    <Link href="/katalog?lang=nl" className="text-[#dfbf59] underline">17 diensten</Link>
   </nav>
   <header className="mt-9">
    <p className="text-xs font-bold uppercase tracking-[.14em] text-[#dfbf59]">Interne redactionele weergave · niet gepubliceerd</p>
    <h1 className="mt-3 text-3xl font-semibold">16 juridische gidsen</h1>
    <p className="mt-4 max-w-3xl leading-7 text-[#c8d4e6]">
     Deze teksten zijn nog niet juridisch of door een moedertaalredacteur goedgekeurd.
     Ze zijn niet bedoeld voor individueel juridisch advies, procesvertegenwoordiging,
     officiële indiening of het berekenen van bezwaar- en beroepstermijnen.
    </p>
    <p className="mt-3 text-xs text-[#a9bada]">Bronarchief: {guideSourceVersion}.
     Laatst in het bronbestand gecontroleerd: 29-10-2026; actuele geldigheid niet opnieuw bevestigd.
    </p>
   </header>
   <GuideSearch guides={legalGuides.map(g=>({...g}))}/>
   <footer className="mt-10 border-t border-[#dfbf59]/30 pt-6 text-sm text-[#c8d4e6]">
    Voor publicatie zijn per gids controle van het actuele recht, oorspronkelijke officiële
    bronnen, bevoegde juridische reviewer, Nederlandse taalcontrole en vrijgave nodig.
   </footer>
  </div>
 </main>;
}
