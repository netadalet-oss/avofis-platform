"use client";
import {useMemo,useState} from "react";
import Link from "next/link";
import {COURTS,ECLI_RE,officialJudgmentUrl,searchDefaults,validatePublicSearch,
 type SearchInput,type Entry} from "@/lib/rechtspraak-open-data";

type Locale="tr"|"nl"|"de"|"en"|"ar"|"ru";
const langs:Locale[]=["tr","nl","de","en","ar","ru"];
const names:Record<Locale,string>={tr:"Türkçe",nl:"Nederlands",de:"Deutsch",en:"English",ar:"العربية",ru:"Русский"};
const copy={
 tr:{title:"Hollanda içtihat araştırma merkezi",subtitle:"Yayımlanmış kararları ECLI ile açın. Kamu verisiyle arama bağlantısı henüz teknik güvenlik kabulünü bekliyor.",search:"Arama seçenekleri",sample:"Resmî kaynakta doğrulanmış örnek kararlar",go:"Resmî kararı aç",query:"Kamu API aramasını dene",disabled:"Canlı API proxy kapalı — dağıtılmış hız sınırı ve erişim testleri bekleniyor.",partial:"Anahtar kelime, mahkeme, hukuk dalı ve işlem türü yalnızca getirilen 20 kayıtta yerel filtre olabilir; tüm karar arşivinde arama değildir.",safe:"Kişisel dosya veya hassas veri girmeyin. Bu merkez AVOfis'e mahkemede temsil/başvuru yetkisi vermez.",status:"Entegrasyon bekleniyor · yalnızca kamusal kayıtlar"},
 nl:{title:"Rechtspraak — jurisprudentieonderzoek",subtitle:"Open echte gepubliceerde uitspraken via ECLI. De live Open Data-verbinding is nog niet vrijgegeven.",search:"Zoekfilters",sample:"Officieel geverifieerde voorbeelduitspraken",go:"Open officiële uitspraak",query:"Zoek in publieke API",disabled:"Live API geblokkeerd — gedeelde snelheidsbeperking en acceptatie ontbreken.",partial:"Trefwoorden, rechtbank, rechtsgebied en procedure filteren alleen lokaal de eerste 20 opgehaalde resultaten, niet het volledige archief.",safe:"Voer geen persoonsgegevens of vertrouwelijke dossiers in. Dit geeft geen procesbevoegdheid.",status:"Integratie in afwachting · alleen openbare uitspraken"},
 de:{title:"Niederländische Rechtsprechungsrecherche",subtitle:"Öffnen Sie veröffentlichte Entscheidungen über ECLI. Die Live-API ist nicht freigeschaltet.",search:"Suchkriterien",sample:"Offiziell belegte Beispielsentscheidungen",go:"Amtliche Entscheidung öffnen",query:"Öffentliche API suchen",disabled:"API deaktiviert; zentrale Ratenbegrenzung und Freigabe fehlen.",partial:"Stichwörter und Klassifizierung filtern nur die ersten 20 abgerufenen Datensätze, nicht das Gesamtarchiv.",safe:"Keine personenbezogenen Falldaten eingeben. Keine Vertretungsbefugnis.",status:"Integration ausstehend · nur öffentliche Entscheidungen"},
 en:{title:"Dutch court decision research",subtitle:"Open real, published judgments by ECLI. Live API access is not approved yet.",search:"Search parameters",sample:"Officially verified example judgments",go:"Open official judgment",query:"Search public API",disabled:"Live API disabled — shared rate limiting and acceptance are outstanding.",partial:"Keyword, court, legal field and procedure only filter the first 20 fetched entries locally. This is not a full-text archive search.",safe:"Do not enter personal or confidential case details. This is not judicial representation.",status:"Integration pending · public judgments only"},
 ar:{title:"البحث في الأحكام القضائية الهولندية",subtitle:"افتح أحكاماً منشورة فعلياً عبر ECLI. الاتصال المباشر غير مفعل.",search:"خيارات البحث",sample:"أحكام نموذجية موثقة من المصدر الرسمي",go:"فتح الحكم الرسمي",query:"البحث في البيانات العامة",disabled:"الاتصال المباشر مغلق إلى حين الموافقة وضبط معدّل الطلبات.",partial:"تصفية الكلمات والمحكمة ونوع القضية تقتصر على النتائج المسترجعة وليست بحثاً شاملاً.",safe:"لا تُدخل بيانات أشخاص أو ملفات سرية. لا يمنح هذا حق التمثيل القضائي.",status:"الربط قيد الانتظار · أحكام عامة فقط"},
 ru:{title:"Поиск решений судов Нидерландов",subtitle:"Открывайте опубликованные решения по ECLI. Прямой API ещё не разрешён.",search:"Параметры поиска",sample:"Примеры, проверенные по официальному источнику",go:"Открыть официальное решение",query:"Поиск в открытом API",disabled:"API отключён: необходимы централизованное ограничение запросов и приёмка.",partial:"Ключевые слова и категории фильтруют только первые 20 полученных записей, не весь архив.",safe:"Не вводите персональные или конфиденциальные данные. Это не разрешение на судебное представительство.",status:"Интеграция ожидается · только публичные решения"}
} as const;
const officialCases=[
 {ecli:"ECLI:NL:HR:2026:1684",court:"Hoge Raad",date:"2026-10-16",subject:"Personen- en familierecht",subjectTr:"Aile ve kişiler hukuku"},
 {ecli:"ECLI:NL:HR:2026:1682",court:"Hoge Raad",date:"2026-10-16",subject:"Civiel recht",subjectTr:"Medeni hukuk / kira"},
 {ecli:"ECLI:NL:HR:2026:1587",court:"Hoge Raad",date:"2026-10-02",subject:"Belastingrecht",subjectTr:"Vergi hukuku"}
] as const;
export default function JurisprudencePage(){
 const [lang,setLang]=useState<Locale>("tr");
 const [input,setInput]=useState<SearchInput>({...searchDefaults});
 const [state,setState]=useState<"idle"|"loading"|"error"|"results">("idle");
 const [message,setMessage]=useState("");
 const [results,setResults]=useState<Entry[]>([]);
 const t=copy[lang],rtl=lang==="ar";
 const validation=useMemo(()=>validatePublicSearch(input),[input]);
 const set=(name:keyof SearchInput,value:string)=>setInput(v=>({...v,[name]:value}));
 async function run(){
  if(validation){setMessage(validation);setState("error");return;}
  setState("loading");setResults([]);setMessage("");
  try{
   const res=await fetch("/api/rechtspraak?"+new URLSearchParams(input),{cache:"no-store"});
   const json=await res.json();
   if(!res.ok){setMessage(json.error||"API_DISABLED");setState("error");return;}
   setResults(Array.isArray(json.results)?json.results:[]);
   setMessage(json.notice||"");
   setState("results");
  }catch{setMessage("NETWORK_UNAVAILABLE");setState("error");}
 }
 return <main lang={lang} dir={rtl?"rtl":"ltr"} className="avofis-theme min-h-screen px-5 py-9 sm:px-8">
  <div className="mx-auto max-w-6xl">
   <nav className="flex flex-wrap items-center justify-between gap-3 text-sm">
    <Link href="/" className="font-semibold text-[#dfbf59] underline">AVOfis</Link>
    <div className="flex flex-wrap items-center gap-4">
     <Link href="/diller" className="text-[#dfbf59] underline">6 dil / Languages</Link>
     <Link href="/yargi-baglantilari" className="text-[#dfbf59] underline">Mijn Rechtspraak / Aansluitpunt</Link>
    </div>
   </nav>
   <header className="mt-9 max-w-4xl">
    <p className="avofis-eyebrow">RECHTSPRAAK OPEN DATA · ECLI</p>
    <h1 className="avofis-page-title mt-3">{t.title}</h1>
    <p className="mt-3 text-sm leading-7 text-[#b9c5df]">{t.subtitle}</p>
    <p role="status" className="mt-4 rounded-lg border border-[#dfbf59]/35 bg-[#0b1937] px-4 py-3 text-sm font-semibold text-[#f0d56d]">{t.status}</p>
   </header>
   <div className="mt-6 flex flex-wrap gap-2" aria-label="Languages">{langs.map(l=><button key={l} type="button"
     onClick={()=>setLang(l)} aria-pressed={lang===l} lang={l}
     className={"rounded-lg border px-3 py-2 text-xs "+(l===lang?"border-[#dfbf59] bg-[#dfbf59] text-[#071738]":"border-[#dfbf59]/30 text-white")}>{names[l]}</button>)}</div>
   <div className="mt-7 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(300px,1fr)]">
    <section className="avofis-card rounded-2xl border p-5 sm:p-6">
     <h2 className="text-lg font-semibold">{t.search}</h2>
     <div className="mt-4 grid gap-4 sm:grid-cols-2">
      <label className="block text-sm sm:col-span-2">ECLI
       <input dir="ltr" className="avofis-field mt-2 w-full" value={input.ecli} placeholder="ECLI:NL:HR:2026:1684"
        onChange={e=>set("ecli",e.target.value.toUpperCase())}/></label>
      <label className="block text-sm">Instantie / Court
       <select className="avofis-field mt-2 w-full" value={input.court} onChange={e=>set("court",e.target.value)}>
        <option value="">—</option>{COURTS.filter(Boolean).map(v=><option key={v} value={v}>{v}</option>)}
       </select></label>
      <label className="block text-sm">Rechtsgebied / Legal field
       <input className="avofis-field mt-2 w-full" value={input.law} maxLength={90} onChange={e=>set("law",e.target.value)}/></label>
      <label className="block text-sm">Vanaf / From
       <input dir="ltr" className="avofis-field mt-2 w-full" type="date" value={input.dateFrom} onChange={e=>set("dateFrom",e.target.value)}/></label>
      <label className="block text-sm">Tot / To
       <input dir="ltr" className="avofis-field mt-2 w-full" type="date" value={input.dateTo} onChange={e=>set("dateTo",e.target.value)}/></label>
      <label className="block text-sm">Trefwoord / Keyword
       <input className="avofis-field mt-2 w-full" value={input.keyword} maxLength={90} onChange={e=>set("keyword",e.target.value)}/></label>
      <label className="block text-sm">Procedure / İşlem türü
       <input className="avofis-field mt-2 w-full" value={input.procedure} maxLength={90} onChange={e=>set("procedure",e.target.value)}/></label>
     </div>
     <p className="mt-4 text-xs leading-6 text-[#b9c5df]">{t.partial}</p>
     {validation&&<p role="status" className="mt-3 text-xs text-[#e9d48c]">Filter status: {validation}</p>}
     <button disabled={!!validation||state==="loading"} type="button" onClick={()=>void run()}
      className="avofis-outline avofis-btn mt-4 disabled:opacity-40">{t.query}</button>
     <div aria-live="polite" className="mt-4 text-sm text-[#e9d48c]">{state==="loading"?"Loading":message||t.disabled}</div>
     {state==="results"&&<ul className="mt-4 space-y-4">{results.map(row=><li className="border-t border-[#dfbf59]/20 pt-3" key={row.ecli}>
       <a className="font-semibold text-[#dfbf59] underline" href={row.url} target="_blank" rel="noopener noreferrer" dir="ltr">{row.ecli}</a>
       <p className="mt-1 text-xs leading-6">{row.title} — {row.updated}</p>
       <p className="mt-1 text-xs text-[#b9c5df]">{row.summary}</p></li>)}</ul>}
    </section>
    <section className="avofis-card rounded-2xl border p-5 sm:p-6">
     <h2 className="text-lg font-semibold">{t.sample}</h2>
     <p className="mt-3 text-xs leading-6 text-[#b9c5df]">3 verified official ECLI references · 2026-10-02 / 2026-10-16. Not fetched from live AVOfis API.</p>
     <ol className="mt-4 space-y-4">{officialCases.map(row=><li key={row.ecli} className="border-t border-[#dfbf59]/20 pt-4">
      <p dir="ltr" className="text-sm font-semibold text-white">{row.ecli}</p>
      <p className="mt-1 text-sm text-[#b9c5df]">{row.court} · {row.date} · {lang==="tr"?row.subjectTr:row.subject}</p>
      <a target="_blank" rel="noopener noreferrer" href={officialJudgmentUrl(row.ecli)}
       className="mt-2 inline-block text-sm font-semibold text-[#dfbf59] underline">{t.go}</a>
     </li>)}</ol>
    </section>
   </div>
   <aside className="mt-7 rounded-lg border border-[#dfbf59]/30 p-5 text-sm leading-7 text-[#b9c5df]">
    {t.safe} <a target="_blank" rel="noopener noreferrer" href="https://www.rechtspraak.nl/uitspraken/open-data" className="text-[#dfbf59] underline">Rechtspraak Open Data</a>
    <p className="mt-2 text-xs">AVOfis is neither Rechtspraak nor IND. No court filing, credential collection, personal case lookup or automatically verified legal opinion.</p>
   </aside>
  </div>
 </main>;
}
