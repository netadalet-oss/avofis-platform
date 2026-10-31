"use client";
import {useState} from "react";
import Link from "next/link";
import {auditCourtEvent,safeDemoEvents,syntheticCase,type RecordedEventKind} from "@/lib/court-case-tracker";
const demoKinds:RecordedEventKind[]=["DRAFT_PREPARED","OFFICIAL_PORTAL_OPENED",
 "DOCUMENT_PREPARED","UNVERIFIED_RECEIPT_REPORTED","RECEIPT_VERIFIED_INDEPENDENTLY"];
const descriptions:Record<RecordedEventKind,string>={
 DRAFT_PREPARED:"Dosya taslağı yalnızca AVOfis içinde hazırlanmış olarak gösterilir.",
 OFFICIAL_PORTAL_OPENED:"Resmî portalın açılması, dava açıldığı veya belge teslim edildiği anlamına gelmez.",
 DOCUMENT_PREPARED:"Dosya belgesi hazırlanmıştır, resmî kuruma aktarılmamıştır.",
 UNVERIFIED_RECEIPT_REPORTED:"Resmî kabul makbuzu mevcut değilse kullanıcı beyanı doğrulanmış gönderime dönüşmez.",
 RECEIPT_VERIFIED_INDEPENDENTLY:"Gerçek kurum makbuzu ve bağımsız kontrol olmadan bu durum reddedilir.",
 COURT_DECISION_REFERENCED:"Kamuya açık ECLI yalnız resmî kaynağa bağlanabilir; özel dava verisi çıkarılamaz."
};
export default function ExampleCourtCase(){
 const [kind,setKind]=useState<RecordedEventKind>("DRAFT_PREPARED");
 const attempt=auditCourtEvent(syntheticCase,{
  kind,actorRole:"assigned_staff",when:"2026-10-29",reference:null,source:"local"
 },{verifiedProfessional:false,procedureAuthorityVerified:false,
    independentReviewer:false,officialReceiptAuthenticityVerified:false,indG1ToG4:false});
 return <main className="avofis-theme min-h-screen px-5 py-9 sm:px-7">
 <div className="mx-auto max-w-5xl">
  <nav className="flex flex-wrap justify-between gap-3">
   <Link href="/" className="text-sm font-semibold text-[#dfbf59] underline">AVOfis</Link>
   <Link href="/yargi-baglantilari" className="text-sm text-[#dfbf59] underline">Mijn Rechtspraak & Aansluitpunt</Link>
  </nav>
  <header className="mt-9 max-w-3xl">
   <p className="avofis-eyebrow">J07/J09/J10 · CASE WORKSPACE / OFFLINE MODEL</p>
   <h1 className="avofis-page-title mt-3">Örnek Hollanda dava dosyası</h1>
   <p className="mt-4 text-sm leading-7 text-[#b9c5df]">Tamamen kurgusal dosya: gerçek müvekkil adı, mahkeme dosya numarası, imza, ödeme, karar, e-posta veya resmî bağlantı içermez. Mevcut T10 müşteri dosya altyapısıyla tasarlanacak metaverinin önizlemesidir.</p>
  </header>
  <p className="mt-6 rounded-xl border border-[#dfbf59]/35 bg-[#071738] p-5 font-semibold text-[#f0d56d]" role="status">GÜVENLİK: GERÇEK DOSYA YOK · GÖNDERİM: NOT_SUBMITTED · RESMÎ MAKBUZ: YOK</p>
  <div className="mt-7 grid gap-5 md:grid-cols-2">
   <section className="avofis-card rounded-2xl border p-6">
    <h2 className="text-xl font-semibold">Dava metaverisi · Synthetic record</h2>
    <dl className="mt-5 grid grid-cols-[140px_1fr] gap-x-3 gap-y-3 text-sm">
     {[
      ["ID",syntheticCase.id],["Land",syntheticCase.country],["Instantie",syntheticCase.court],
      ["Procedure",syntheticCase.procedure],["Zaaknummer","YOK / NOT ENTERED"],
      ["ECLI","YOK / NOT ENTERED"],["Müvekkil","SYNTHETIC ONLY"],
      ["Vertegenwoordiging","YETKİ ONAYI BEKLİYOR"],["Tebliğ tarihi","KAYDEDİLMEDİ"],
      ["Süre incelemesi",syntheticCase.deadlineBasis]
     ].map(([k,v])=><div key={k} className="contents">
      <dt className="text-[#b9c5df]">{k}</dt><dd className="break-words font-semibold">{v}</dd>
     </div>)}</dl>
    <p className="mt-5 text-xs leading-6 text-[#b9c5df]">Gerekli alanlar şema taslağına aittir. Şimdilik gerçek Supabase tablosu oluşturulmadı.</p>
   </section>
   <section className="avofis-card rounded-2xl border p-6">
    <h2 className="text-xl font-semibold">Manuel işlem / makbuz kontrolü</h2>
    <label className="mt-4 block text-sm">Kurgusal işlem türü
     <select value={kind} onChange={e=>setKind(e.target.value as RecordedEventKind)}
      className="avofis-field mt-2 w-full">
      {demoKinds.map(k=><option key={k} value={k}>{k}</option>)}
     </select>
    </label>
    <p className="mt-4 text-sm leading-7 text-[#b9c5df]">{descriptions[kind]}</p>
    <div aria-live="polite" className="mt-4 rounded-xl border border-[#dfbf59]/30 bg-[#071738] p-4">
     <p className="font-semibold text-[#f0d56d]">Resmî işlem: {attempt.status}</p>
     <p className="mt-2 text-xs">İç model uyarısı: {attempt.issues.length?attempt.issues.join(", "):"Yerel etkinlik gösterimi; resmî kabul değil"}</p>
    </div>
    <h3 className="mt-6 font-semibold">Örnek iç olay geçmişi</h3>
    <ol className="mt-3 space-y-3">{safeDemoEvents.map((e,i)=><li key={i}
     className="border-t border-[#dfbf59]/20 pt-3 text-sm">
     <span className="text-[#dfbf59]">{e.when}</span> · {e.kind}
     <p className="mt-1 text-xs text-[#b9c5df]">local / synthetic — no external submission</p>
    </li>)}</ol>
   </section>
  </div>
  <div className="mt-7 flex flex-wrap gap-6 text-sm">
   <Link className="text-[#dfbf59] underline" href="/ictihat">ECLI açık içtihat araştırması</Link>
   <Link className="text-[#dfbf59] underline" href="/ornek-dosya">T10 genel müşteri dosyası örneği</Link>
   <Link className="text-[#dfbf59] underline" href="/uyum">B01/B02/AVG NO-GO kontrolü</Link>
  </div>
  <p className="mt-5 text-xs leading-6 text-[#b9c5df]">Geçiş hukuku, IND G1–G4, hukukî yetki ve dosya bazlı tebliğ/süre uzman incelemesi olmadan resmî eylem veya süre tayini yapılamaz.</p>
 </div></main>;
}
