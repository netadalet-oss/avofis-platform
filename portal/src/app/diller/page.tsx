import Link from "next/link";

export const metadata={
 title:"AVOfis | Altı dil ve hukukî editör durumu",
 description:"Altı dilde bilgilendirme kataloğu ve tamamlanmamış insan/hukukî editör incelemesi. Hizmet kabulü kapalı.",
 robots:{index:false,follow:false}
};

const versions=[
 {code:"tr",name:"Türkçe",dir:"ltr",title:"Türkçe bilgi kataloğu",notice:"Hukukî içerik ve meslekî yetki için insan onayı henüz belgelenmedi.",action:"Kataloğu incele",review:"TR çekirdek hukukî editör onayı: BEKLİYOR"},
 {code:"nl",name:"Nederlands",dir:"ltr",title:"Nederlandse informatiecatalogus",notice:"Juridische redactie en bevoegdheden zijn nog niet onafhankelijk goedgekeurd.",action:"Catalogus bekijken",review:"NL menselijke juridische redactie: IN AFWACHTING"},
 {code:"de",name:"Deutsch",dir:"ltr",title:"Deutscher Themenkatalog",notice:"Eine verifizierte landesspezifische Rechtsredaktion liegt noch nicht vor. Keine Mandatsannahme.",action:"Katalog ansehen",review:"DE juristische Sprachfreigabe: AUSSTEHEND"},
 {code:"en",name:"English",dir:"ltr",title:"English information catalogue",notice:"Legal translation and individual professional authority have not been signed off. No client intake.",action:"View catalogue",review:"EN legal-language review: PENDING"},
 {code:"ar",name:"العربية",dir:"rtl",title:"فهرس المعلومات بالعربية",notice:"الترجمة القانونية التفصيلية لم تعتمد بعد. المعلومات عامة ولا يجري قبول ملفات أو مدفوعات.",action:"عرض الفهرس",review:"مراجعة بشرية وقانونية للعربية: قيد الانتظار"},
 {code:"ru",name:"Русский",dir:"ltr",title:"Информационный каталог на русском",notice:"Юридическая редактура не утверждена. Здесь нет приёма клиентов или платежей.",action:"Открыть каталог",review:"Проверка юридического перевода RU: ОЖИДАЕТСЯ"}
] as const;

export default function LanguagesPage(){
 return <main className="avofis-theme min-h-screen px-5 py-10 sm:px-8">
  <div className="mx-auto max-w-6xl">
   <nav aria-label="AVOfis"><Link href="/" className="text-[#dfbf59] underline underline-offset-4">AVOfis · Ana sayfa / Home</Link></nav>
   <header className="mt-8 max-w-3xl">
    <p className="avofis-eyebrow">T07 · 6 dil / talen / languages</p>
    <h1 className="avofis-page-title mt-3">Hukukî içerikte dil ve insan onayı</h1>
    <p className="mt-4 text-sm leading-7 text-[#b9c5df]">Altı dilde katalog görünümü vardır. Bu, altı dilde hukuken onaylanmış hizmet veya tercüme bulunduğu anlamına gelmez. TR/NL çekirdek editör, DE/EN/AR/RU hukukî dil ve yerel yetki onayları henüz belgelenmemiştir.</p>
   </header>
   <section aria-labelledby="locale-catalog" className="mt-8">
    <h2 id="locale-catalog" className="text-xl font-semibold">Dil sürümleri · Language review status</h2>
    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
     {versions.map(v=><article key={v.code} dir={v.dir} lang={v.code} className="avofis-card rounded-2xl border p-5">
       <span className="text-xs font-semibold text-[#dfbf59]">{v.code.toUpperCase()} · {v.name}</span>
       <h3 className="mt-3 text-lg font-semibold">{v.title}</h3>
       <p className="mt-3 text-sm leading-7 text-[#b9c5df]">{v.notice}</p>
       <p className="mt-3 border-t border-[#dfbf59]/20 pt-3 text-xs text-[#e8d18e]">{v.review}</p>
       <Link href={"/katalog?lang="+v.code} hrefLang={v.code} className="avofis-outline avofis-btn mt-4 inline-flex" aria-label={v.name+" · "+v.action}>{v.action}</Link>
      </article>)}
    </div>
   </section>
   <aside className="mt-7 rounded-xl border border-[#dfbf59]/40 bg-[#071738] p-5 text-sm leading-7">
     <h2 className="font-semibold">Yayın ve kişisel veri kapıları</h2>
     <p className="mt-2 text-[#b9c5df]">Hukukî bilgilendirme kişiye özgü tavsiye değildir. Tercüme kontrolü, ülkeye göre yetki, veri sorumlusu bilgisi, GDPR Madde 13 bildirimi, sözleşme, fiyat, cayma/iade ve ayrı staging güvenlik onayı sağlanmadan kişisel veri başvuruları veya ödeme açılmaz. Arapça arayüz sağdan sola gösterilir; her dil için insan redaksiyonu hâlâ zorunludur.</p>
     <div className="mt-4 flex gap-3"><Link href="/gizlilik?lang=tr" className="text-[#dfbf59] underline">Gizlilik taslağı</Link><Link href="/basvuru?lang=tr" className="text-[#dfbf59] underline">Kapalı başvuru görünümü</Link></div>
   </aside>
  </div>
 </main>;
}
