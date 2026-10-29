"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { services, type SiteLang } from "@/lib/avofis-site";

type Locale = SiteLang | "ar" | "ru";
const locales:Locale[]=["tr","nl","de","en","ar","ru"];
const supported=(v:string|null|undefined):v is Locale=>!!v&&locales.includes(v as Locale);
const full=(lang:Locale):lang is SiteLang=>lang!=="ar"&&lang!=="ru";
const arabicRussianTitles:Record<string,{ar:string;ru:string}>={
 "hukuki-danismanlik":{ar:"الاستشارات القانونية وتحليل الملفات",ru:"Юридическое консультирование и анализ материалов дела"},
 "mahkeme-temsil":{ar:"التمثيل أمام المحاكم والجهات الإدارية وفقاً لشروط الإجراء",ru:"Представительство в судах и административных органах при наличии полномочий"},
 "avrupa-turkiye-hukuki-uzman-koordinasyonu":{ar:"التنسيق مع مختصين قانونيين مستقلين في أوروبا وتركيا",ru:"Координация с независимыми юристами в Европе и Турции"},
 "alacak-takibi":{ar:"المطالبات والديون وإجراءات التحصيل",ru:"Требования, долги и процедуры взыскания"},
 "sozlesmeler-uyusmazliklar":{ar:"العقود والنزاعات المدنية والتجارية",ru:"Договоры, гражданские и коммерческие споры"},
 "konut-kira-sigorta":{ar:"السكن والإيجار والتأمين",ru:"Жильё, аренда и страхование"},
 "ceza-sikayet-trafik":{ar:"الشكاوى الجنائية وحقوق المتضررين والمخالفات المرورية",ru:"Уголовные заявления, права потерпевших и дорожные штрафы"},
 "resmi-basvuru-itiraz":{ar:"الطلبات الإدارية والاعتراضات",ru:"Обращения в государственные органы и обжалование"},
 "sosyal-guvenlik-vergi":{ar:"الضمان الاجتماعي والضرائب والإعانات",ru:"Социальное обеспечение, налоги и пособия"},
 "vize-oturum-vatandaslik":{ar:"التأشيرات والإقامة والجنسية",ru:"Визы, проживание и гражданство"},
 "uluslararasi-insan-haklari":{ar:"آليات حقوق الإنسان الدولية",ru:"Международные механизмы защиты прав человека"},
 "avrupa-ici-islemler":{ar:"الإجراءات بين الدول الأوروبية",ru:"Процедуры между европейскими странами"},
 "calisma-hayati":{ar:"علاقات العمل والنزاعات العمالية",ru:"Трудовые отношения и трудовые споры"},
 "sirket-ticaret":{ar:"تأسيس الشركات والتجارة والمعاملات عبر الحدود",ru:"Учреждение компаний, торговля и трансграничные сделки"},
 "uluslararasi-istihdam":{ar:"التوظيف الدولي ونقل الموظفين",ru:"Международное трудоустройство и перевод персонала"},
 "belge-apostil-tercume":{ar:"الوثائق والأبوستيل والترجمة",ru:"Документы, апостиль и перевод"},
 "egitim-diploma":{ar:"التعليم وتقييم الشهادات",ru:"Образование и оценка дипломов"}
};
const wording:Record<Locale,{heading:string;intro:string;search:string;language:string;details:string;docs:string;steps:string;limits:string;pending:string;notice:string;back:string}>={
 tr:{heading:"Avrupa genelinde 17 hizmet alanı",intro:"Hizmet alanları hakkında bilgi edinin. Başvuru ve ödeme henüz açık değildir.",search:"Hizmet veya konu ara",language:"Dil",details:"Kapsam ve ilk bilgiler",docs:"İlk değerlendirmede gerekli bilgiler",steps:"İşlem adımları",limits:"Hukukî sınırlar",pending:"Bu dilde ayrıntılı hukukî metin henüz onaylanmadı. Onaylanmamış metni çevrilmiş gibi göstermiyoruz.",notice:"Bu sayfa genel bilgidir. AVOfis avukatlık bürosu değildir; meslekî yetki ve her başvuru süresi dosya bazında kontrol edilir. Bu sitede işlem yapılması hukukî süreleri durdurmaz.",back:"Ana sayfa"},
 nl:{heading:"17 juridische en administratieve onderwerpen",intro:"Bekijk de informatie. Aanvragen en betalingen zijn nog niet geopend.",search:"Zoek een onderwerp",language:"Taal",details:"Werkzaamheden",docs:"Gegevens voor de eerste beoordeling",steps:"Procedure",limits:"Juridische beperkingen",pending:"De volledige juridische vertaling is nog niet goedgekeurd.",notice:"Alleen algemene informatie. AVOfis is geen advocatenkantoor. Bevoegdheden, termijnen en procedures vereisen beoordeling per zaak. Een websitebezoek stopt geen wettelijke termijn.",back:"Home"},
 de:{heading:"17 Rechts- und Verwaltungsthemen",intro:"Informieren Sie sich über die Themen. Anfragen und Zahlungen sind noch nicht freigeschaltet.",search:"Thema suchen",language:"Sprache",details:"Leistungsumfang",docs:"Angaben zur Erstprüfung",steps:"Ablauf",limits:"Rechtliche Grenzen",pending:"Die vollständige juristische Übersetzung ist noch nicht freigegeben.",notice:"Nur allgemeine Informationen. AVOfis ist keine Rechtsanwaltskanzlei. Rechtsberatung und Vertretung sind an die jeweilige Befugnis und das Verfahren gebunden. Das Lesen dieser Seite hemmt keine Frist.",back:"Startseite"},
 en:{heading:"17 legal and administrative topics",intro:"Explore information about the scope. Enquiries and payments are not open.",search:"Search a topic",language:"Language",details:"Scope and information",docs:"Initial information",steps:"Procedure",limits:"Professional boundaries",pending:"The full legal translation is not yet approved.",notice:"General information only. AVOfis is not a Dutch law firm. Representation and deadlines must be checked for each procedure. Visiting this page does not suspend any deadline.",back:"Home"},
 ar:{heading:"17 مجالاً قانونياً وإدارياً في أوروبا",intro:"تعرّف على مجالات الخدمات. استقبال الطلبات والدفع غير متاحين حالياً.",search:"ابحث عن موضوع",language:"اللغة",details:"نطاق العمل",docs:"المعلومات الأولية",steps:"الإجراءات",limits:"حدود الصلاحيات",pending:"النص القانوني التفصيلي بهذه اللغة لم يحصل بعد على الموافقة. يمكن الاطلاع على النسخة الإنجليزية مع توضيح لغتها.",notice:"هذه معلومات عامة وليست استشارة قانونية أو قبولاً للتمثيل. لا تقدم AVOfis نفسها كمكتب محاماة هولندي. لا يؤدي استخدام الموقع إلى إيقاف المهل القانونية.",back:"الرئيسية"},
 ru:{heading:"17 юридических и административных направлений в Европе",intro:"Ознакомьтесь с направлениями. Приём заявок и платежей пока закрыт.",search:"Найти тему",language:"Язык",details:"Объём работы",docs:"Первоначальные сведения",steps:"Этапы",limits:"Ограничения полномочий",pending:"Подробный юридический текст на этом языке пока не утверждён. Доступна отдельно обозначенная английская версия.",notice:"Только общая информация. AVOfis не является адвокатской фирмой Нидерландов. Полномочия и сроки проверяются отдельно. Посещение сайта не приостанавливает установленные законом сроки.",back:"Главная"}
};

export default function CatalogPage(){
 const [lang,setLang]=useState<Locale>("tr");
 const [query,setQuery]=useState("");
 useEffect(()=>{
   const u=new URLSearchParams(window.location.search).get("lang");
   let stored: string|null=null;
   try{stored=window.localStorage.getItem("avofis-catalog-language");}catch{}
   const chosen=supported(u)?u:supported(stored)?stored:"tr";
   setLang(chosen);
 },[]);
 useEffect(()=>{
   document.documentElement.lang=lang;
   document.documentElement.dir=lang==="ar"?"rtl":"ltr";
   try{window.localStorage.setItem("avofis-catalog-language",lang);}catch{}
 },[lang]);
 const t=wording[lang];
 const titleFor=(s:(typeof services)[number]):string=>full(lang)?s.title[lang]:arabicRussianTitles[s.slug]?.[lang]??s.title.en;
 const list=useMemo(()=>services.filter(s=>{
   const title=full(lang)?s.title[lang]:arabicRussianTitles[s.slug]?.[lang]??"";
   return (title+" "+s.title.en+" "+s.slug).toLocaleLowerCase().includes(query.toLocaleLowerCase());
 }),[lang,query]);
 const change=(next:Locale)=>{
   setLang(next);
   const url=new URL(window.location.href);
   url.searchParams.set("lang",next);
   window.history.replaceState(null,"",url.pathname+url.search);
 };
 return <main className="avofis-theme min-h-screen" dir={lang==="ar"?"rtl":"ltr"} lang={lang}>
  <div className="mx-auto max-w-6xl px-5 pb-20 pt-10 sm:px-7">
   <nav className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dfbf59]/25 pb-5" aria-label="AVOfis">
    <Link href="/" className="text-lg font-semibold tracking-wide text-[#f0d56d]">AVOfis</Link>
    <Link href="/" className="text-sm text-[#cfdaec] underline underline-offset-4">{t.back}</Link>
   </nav>
   <header className="mt-10">
    <p className="text-xs font-semibold uppercase tracking-widest text-[#dfbf59]">AVOfis · {services.length}</p>
    <h1 className="mt-3 text-3xl font-bold leading-tight text-white sm:text-4xl">{t.heading}</h1>
    <p className="mt-4 max-w-3xl text-base leading-7 text-[#c1cbdf]">{t.intro}</p>
   </header>
   <div className="mt-8 grid gap-4 sm:grid-cols-[1fr_auto]">
    <label className="block text-sm font-semibold text-[#ecf0f8]">{t.search}
     <input value={query} onChange={e=>setQuery(e.target.value)} type="search" className="mt-2 block min-h-12 w-full rounded-xl border border-[#c7a34f]/45 bg-[#102142] px-4 text-white outline-offset-2" placeholder={t.search}/>
    </label>
    <label className="block text-sm font-semibold text-[#ecf0f8]">{t.language}
     <select value={lang} onChange={e=>change(e.target.value as Locale)} className="mt-2 block min-h-12 w-full rounded-xl border border-[#c7a34f]/45 bg-[#102142] px-4 text-white sm:w-52">
      <option value="tr">Türkçe</option><option value="nl">Nederlands</option>
      <option value="de">Deutsch</option><option value="en">English</option>
      <option value="ar">العربية</option><option value="ru">Русский</option>
     </select>
    </label>
   </div>
   <p role="status" className="mt-5 text-sm text-[#b9c5df]">{list.length} / {services.length}</p>
   <div className="mt-5 grid items-start gap-4 md:grid-cols-2">
    {list.map(s=><article key={s.slug} className="avofis-card min-w-0 rounded-2xl border p-5 sm:p-6">
      <div className="flex items-center gap-3"><s.icon className="h-5 w-5 shrink-0 text-[#dfbf59]" aria-hidden="true"/><h2 className="text-lg font-semibold leading-relaxed text-white">{titleFor(s)}</h2></div>
      {full(lang)?<><p className="mt-3 text-sm leading-7 text-[#c2cde1]">{s.lead[lang]}</p>
       <details className="mt-5 border-t border-[#dfbf59]/20 pt-4">
        <summary className="cursor-pointer text-sm font-semibold text-[#dfbf59]">{t.details}</summary>
        <h3 className="mt-4 font-semibold text-white">{t.docs}</h3><p className="mt-1 text-sm leading-7 text-[#c2cde1]">{s.firstDetails[lang]}</p>
        <h3 className="mt-4 font-semibold text-white">{t.steps}</h3><p className="mt-1 text-sm leading-7 text-[#c2cde1]">{s.stages[lang]}</p>
        <h3 className="mt-4 font-semibold text-white">{t.limits}</h3><p className="mt-1 text-sm leading-7 text-[#c2cde1]">{s.boundaries[lang]}</p>
       </details></>:
       <div className="mt-3">
        <p className="text-sm leading-7 text-[#c2cde1]">{t.pending}</p>
        <Link href={"/katalog?lang=en"} className="mt-3 inline-block text-sm font-semibold text-[#dfbf59] underline underline-offset-4">English (reference)</Link>
       </div>
      }
     </article>)}
   </div>
   <aside className="mt-9 rounded-xl border border-[#dfbf59]/40 bg-[#0b1937] p-5 text-sm leading-7 text-[#e0e8f7]">{t.notice}</aside>
  </div>
 </main>;
}
