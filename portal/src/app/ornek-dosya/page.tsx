"use client";
import {useState} from "react";
import Link from "next/link";
const stages=[
 {name:"Ön inceleme",nl:"Eerste beoordeling",en:"Initial review",detail:"Kimlik, ülke/rol/süre ve gerçek veri sorumlusu onayı olmadan canlı kayıt açılmaz.",code:"review"},
 {name:"Sözleşme taslağı",nl:"Conceptovereenkomst",en:"Agreement draft",detail:"İmza, koşullar, gerçek ücretler ve tüketici hakları ancak hukukî onayla işler.",code:"awaiting_agreement"},
 {name:"G1–G4 ve iki-göz",nl:"G1–G4 en vier-ogen",en:"Independent clearance",detail:"İki farklı doğrulanmış yönetici, meslekî yetki, usul ve belge/veri erişim sınırlarını kontrol eder.",code:"clearance"},
 {name:"Belge ve mesaj",nl:"Document en bericht",en:"Document and message",detail:"Yalnızca dosya sahibi ve açıkça atanmış personel kendi dosyasını görebilir. Gerçek Storage JWT/signed URL E2E hâlâ bekliyor.",code:"open"},
 {name:"Ödeme kapısı",nl:"Betaalcontrole",en:"Payment gate",detail:"Ödeme yapılmaz. Testte, ödenmemiş dosyanın tamamlanması reddedilir; sağlayıcı ödemesi yalnızca sentetik PG durumu olarak taklit edilir.",code:"payment"},
 {name:"Kapanış ve kayıt",nl:"Afsluiting en audit",en:"Closing and audit",detail:"Kapanış statüsü ve olay geçmişi sentetik PG testinde sınanır; gerçek saklama/DSAR, geri ödeme ve tam denetim kabulü açık.",code:"closed"}
] as const;
export const runtime="edge";
export default function SyntheticCasePreview(){
 const [selected,setSelected]=useState(0);
 return <main className="avofis-theme min-h-screen px-5 py-9 sm:px-7">
  <div className="mx-auto max-w-5xl">
   <nav className="mb-8 flex justify-between gap-3 text-sm"><Link href="/" className="text-[#dfbf59] underline">AVOfis</Link><Link href="/triyaj" className="text-[#dfbf59] underline">Kişisel veri içermeyen triyaj</Link></nav>
   <p className="avofis-eyebrow">T10 · Synthetic case workflow preview</p>
   <h1 className="avofis-page-title mt-3">Örnek müşteri dosyası — sentetik izleme</h1>
   <p className="mt-4 max-w-3xl text-sm leading-7 text-[#b9c5df]">Bu ekran hiçbir gerçek müşteriye, ödemeye veya hukuken açılmış dosyaya bağlanmaz. Tamamen kurgusal aşamalar içerir. Statüler canlı sistemde gerçekleşmiş gibi gösterilmez.</p>
   <div className="mt-6 rounded-xl border border-[#dfbf59]/40 bg-[#071738] p-4 text-sm font-semibold text-[#e9d48c]" role="status">MÜŞTERİ KABULÜ: KAPALI · GERÇEK BELGE: YOK · ÖDEME: KAPALI · RESMÎ İŞLEM: YOK</div>
   <div className="mt-7 grid gap-5 md:grid-cols-[minmax(230px,1fr)_2fr]">
    <nav aria-label="Sentetik dosya aşamaları" className="space-y-2">
     {stages.map((step,i)=><button key={step.code} type="button" onClick={()=>setSelected(i)}
       aria-current={selected===i?"step":undefined}
       className={"w-full rounded-xl border px-4 py-3 text-left text-sm focus-visible:outline-2 focus-visible:outline-[#dfbf59] "+
       (selected===i?"border-[#dfbf59] bg-[#1d3050] text-[#f0d56d]":"border-[#dfbf59]/20 bg-[#071738] text-[#dce5f7]")}>
       <span className="font-mono text-xs opacity-70">{String(i+1).padStart(2,"0")} / 06 · {step.code}</span>
       <span className="mt-1 block font-semibold">{step.name}</span>
      </button>)}
    </nav>
    <section aria-live="polite" className="avofis-card min-h-64 rounded-2xl border p-5 sm:p-7">
     <p className="text-xs font-semibold uppercase tracking-wide text-[#dfbf59]">Sadece görsel senaryo / Not an active case</p>
     <h2 className="mt-4 text-xl font-semibold">{stages[selected].name}</h2>
     <p className="mt-2 text-xs text-[#c5d0e3]">{stages[selected].nl} · {stages[selected].en}</p>
     <p className="mt-5 text-sm leading-7 text-[#c6d2e7]">{stages[selected].detail}</p>
     <div className="mt-7 flex gap-2">
      <button type="button" disabled={selected===0} onClick={()=>setSelected(x=>Math.max(0,x-1))}
       className="avofis-outline avofis-btn disabled:opacity-40">Önceki</button>
      <button type="button" disabled={selected===stages.length-1} onClick={()=>setSelected(x=>Math.min(stages.length-1,x+1))}
       className="avofis-outline avofis-btn disabled:opacity-40">Sonraki adım</button>
     </div>
    </section>
   </div>
   <p className="mt-7 text-xs leading-6 text-[#b9c5df]">Sentetik PostgreSQL testleri, gerçek Supabase Auth, Storage signed URL, MFA, PSP sandbox/geri ödeme, denetlenebilir erişim kayıtları ve DPO/hukukî onayların yerini tutmaz.</p>
  </div>
 </main>;
}
