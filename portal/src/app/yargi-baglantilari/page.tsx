"use client";
import {useState} from "react";
import Link from "next/link";
import {officialCourtConnectionEnabled,providerAccepted,indConnected,
 evaluateOfficialExchange,type ExternalCaseFamily} from "@/lib/official-justice-gates";
const paths=[
 {id:"mijn",title:"Mijn Rechtspraak",url:"https://www.rechtspraak.nl/onderhoud-en-storingen/inloggen-en-machtigen",
  desc:"Beveiligd portaal · DigiD (burger), advocatenpas (advocaat), eHerkenning EH3 met machtiging (professionals / organisaties).",
  state:"ALLEEN OFFICIËLE HANDMATIGE TOEGANG",note:"No personal credential collection, no login automation, no automatic official case status."},
 {id:"aansluitpunt",title:"Aansluitpunt Rechtspraak",url:"https://www.rechtspraak.nl/voor-advocaten-en-juristen/aansluitpunt-rechtspraak",
  desc:"Aparte softwareleveranciers-aansluiting · berichtenboek, technische acceptatie, ketentest/compliance en autorisatie.",
  state:"NIET AANGESLOTEN",note:"Asiel, bewaring en toezicht vallen niet onder de algemene koppeling."},
 {id:"ind",title:"IND / Portaal Zakelijk / Mijn IND",url:"https://ind.nl/nl/portaal-zakelijk",
  desc:"Alleen bevoegde referenten en ketengemachtigden (Portaal Zakelijk); asiel/advocatenportalen zijn afzonderlijk.",
  state:"GEEN IND-VERBINDING",note:"Existing eight IND categories + G1–G4 remain separate, including 12 June 2026 transition."}
] as const;
const families:[ExternalCaseFamily,string][]= [
 ["civil","Civiel"],["general_administrative","Bestuursrecht"],["tax","Belasting"],
 ["commercial","Handel"],["family","Familie"],["asylum","Asiel"],["detention","Bewaring"],
 ["ind_objection","IND bezwaar"],["ind_residence","IND verblijf"],["unknown","Onbekend"]
];
export default function JusticeConnectionsPage(){
 const [family,setFamily]=useState<ExternalCaseFamily>("unknown");
 const [scope,setScope]=useState(false);
 const status=evaluateOfficialExchange({
  family,verifiedProfessional:scope,jurisdictionVerified:scope,writtenMandateVerified:scope,
  reviewerOne:false,reviewerTwo:false,independentReviewers:false,
  g1ToG4IfInd:false,providerAccreditation:false,verifiedProviderReceipt:false
 });
 return <main className="avofis-theme min-h-screen px-5 py-9 sm:px-7">
  <div className="mx-auto max-w-5xl">
   <nav className="flex flex-wrap items-center justify-between gap-3">
    <Link href="/" className="text-sm font-semibold text-[#dfbf59] underline">AVOfis</Link>
    <Link href="/ictihat" className="text-sm text-[#dfbf59] underline">ECLI / Jurisprudentie / İçtihat</Link>
   </nav>
   <header className="mt-8 max-w-3xl">
    <p className="avofis-eyebrow">OFFICIËLE DIGITALE RECHTSPRAAK · AVOfis INTERNAL DESIGN</p>
    <h1 className="avofis-page-title mt-3">Hollanda dijital yargı bağlantı durumu</h1>
    <p className="mt-4 text-sm leading-7 text-[#b9c5df]">AVOfis resmî yargı veya IND sistemi değildir. Aşağıdaki bağlantılar yalnızca resmî kaynağı yeni sekmede açar. Mahkeme kimlik bilgisi, kişisel dosya numarası, dava belgesi, imza ve ödeme alınmaz.</p>
   </header>
   <div className="mt-7 grid gap-4 md:grid-cols-3">{paths.map(p=><article key={p.id} className="avofis-card rounded-xl border p-5">
    <h2 className="text-lg font-semibold">{p.title}</h2>
    <p className="mt-2 text-xs font-semibold text-[#e9d48c]">{p.state}</p>
    <p className="mt-3 text-sm leading-7 text-[#b9c5df]">{p.desc}</p>
    <p className="mt-2 text-xs leading-6 text-[#b9c5df]">{p.note}</p>
    <a href={p.url} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex text-sm text-[#dfbf59] underline">Officiële instructies / Resmî kaynak</a>
   </article>)}</div>
   <section className="avofis-card mt-6 rounded-2xl border p-5 sm:p-7">
    <h2 className="text-xl font-semibold">Yetki ve resmî gönderim kapısı — sentetik kontrol</h2>
    <p className="mt-3 text-sm leading-7 text-[#b9c5df]">Hiçbir resmî sisteme bağlı değildir. Onay kutusu yalnızca kontrol mantığını gösterir; bir kişinin gerçek yetkisini veya vekâletini doğrulamaz.</p>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">
     <label className="block text-sm">Dosya türü / Zaaktype
      <select value={family} onChange={e=>setFamily(e.target.value as ExternalCaseFamily)} className="avofis-field mt-2 w-full">
       {families.map(([v,text])=><option key={v} value={v}>{text}</option>)}
      </select>
     </label>
     <label className="flex items-center gap-3 text-sm">
      <input type="checkbox" checked={scope} onChange={e=>setScope(e.target.checked)}/>
      <span>Yetki / yazılı kapsam doğrulandı varsayımı (yalnızca sentetik)</span>
     </label>
    </div>
    <div className="mt-5 grid gap-3 sm:grid-cols-3">
     <div className="rounded-lg border border-[#dfbf59]/30 bg-[#071738] p-4">
      <p className="text-xs text-[#b9c5df]">Aansluitpunt</p><p className="mt-1 font-semibold">{officialCourtConnectionEnabled?"CONFIGURED":"BAĞLI DEĞİL"}</p>
     </div>
     <div className="rounded-lg border border-[#dfbf59]/30 bg-[#071738] p-4">
      <p className="text-xs text-[#b9c5df]">Provider acceptatie</p><p className="mt-1 font-semibold">{providerAccepted?"CHECKED":"BEKLİYOR"}</p>
     </div>
     <div className="rounded-lg border border-[#dfbf59]/30 bg-[#071738] p-4">
      <p className="text-xs text-[#b9c5df]">IND G1–G4</p><p className="mt-1 font-semibold">{indConnected?"CHECKED":"AYRI / KAPALI"}</p>
     </div>
    </div>
    <div aria-live="polite" className="mt-5 rounded-lg border border-[#dfbf59]/30 bg-[#0b1937] p-5 text-sm leading-7">
     <p className="font-semibold text-[#e9d48c]">Resmî gönderim: {status.externalStatus}</p>
     <p>Gönderim yetkisi: {status.canTransmit?"EVET":"HAYIR"} · Doğrulanmış resmî makbuz: {status.canMarkSubmitted?"EVET":"YOK"}</p>
     <p className="text-xs text-[#b9c5df]">Kişisel yargı portalı oturumu ve IND temsil yetkisi otomatik paylaşılmaz. Resmî makbuz yoksa teslim edildi denmez.</p>
    </div>
   </section>
   <div className="mt-7 text-sm text-[#b9c5df]">
    <Link href="/uyum" className="text-[#dfbf59] underline">Mevcut B01/B02 RLS ve GDPR NO-GO durumu</Link> · <Link href="/ornek-yargi-dosyasi" className="text-[#dfbf59] underline">Sentetik dava dosyası</Link> · Gerçek dava açma, resmî gönderme, makbuz kaydetme, otomatik giriş ve veri aktarımı bu önizlemede bulunmaz.
   </div>
  </div>
 </main>;
}
