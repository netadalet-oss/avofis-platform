"use client";

import Link from "next/link";
import {AccountDraftControls} from "@/components/avofis/AccountDraftControls";
import {useEffect,useState} from "react";
import {services} from "@/lib/avofis-site";
import {draftLocales,isDraftLocale,isServiceSlug,newPreparation,preparationDocx,preparationText,validatePreparation,type DraftLocale,type PreparationDraft} from "@/lib/document-preparation";
import {fieldsByService,localizedFieldLabels,serviceFieldTypes,type ServiceField} from "@/lib/service-document-forms";

type Field = "country"|"institution"|"purpose"|"chronology"|"documentList";
const words:Record<DraftLocale,{title:string;intro:string;service:string;language:string;country:string;institution:string;purpose:string;chronology:string;documentList:string;save:string;import:string;docx:string;text:string;print:string;reset:string;privacy:string;warning:string;invalid:string;reference:string;source:string}>={
 tr:{title:"Belge hazırlayın",intro:"Seçtiğiniz hizmet için özel, kişisel hazırlık notlarınızı oluşturun. Bu bir resmî dilekçe değil, dosya hazırlık taslağıdır.",service:"İlgili hizmet",language:"Dil",country:"İlgili ülke",institution:"Başvurulacak kurum (biliniyorsa)",purpose:"Belgeyi neden hazırlıyorsunuz?",chronology:"Olayları kendi sözlerinizle açıklayın",documentList:"Elinizdeki belgeler ve eksikler",save:"Taslağı cihazıma kaydet (.json)",import:"Daha önce kaydettiğim taslağı aç",docx:"Word belgesi indir (.docx)",text:"Metin indir (.txt)",print:"Yazdır / PDF olarak kaydet",reset:"Formu temizle",privacy:"Yerel indirme ve kaydetme düğmeleri verilerinizi AVOfis sunucusuna göndermez. Hesabınıza kaydetmeyi seçerseniz taslak güvenli hesap alanında saklanır ve yalnızca izin verdiğiniz dosya personeliyle paylaşılır. İndirdiğiniz dosyaları koruyun.",warning:"Resmî başvuru değildir. Kurum, süre, zorunlu alanlar ve temsil yetkisi ayrıca doğrulanmalıdır. AVOfis bu belgeyi hiçbir kuruma göndermez.",invalid:"Dosya geçerli bir AVOfis taslağı değil veya çok büyük.",reference:"Bu dildeki hizmet ayrıntıları henüz hukukî/dilsel insan onayından geçmedi; hizmet adı İngilizce gösterilir.",source:"İlgili hizmetin açıklaması ve sınırları"},
 nl:{title:"Document voorbereiden",intro:"Maak persoonlijke voorbereidende notities per dienst. Dit is geen officieel formulier.",service:"Dienst",language:"Taal",country:"Land",institution:"Instantie (indien bekend)",purpose:"Doel van het document",chronology:"Feiten en tijdlijn",documentList:"Documenten en ontbrekende stukken",save:"Concept lokaal bewaren (.json)",import:"Opgeslagen concept openen",docx:"Word downloaden (.docx)",text:"Tekst downloaden (.txt)",print:"Afdrukken / PDF opslaan",reset:"Wissen",privacy:"Lokale downloads verzenden geen gegevens naar AVOfis. Als u opslag in uw account kiest, wordt het concept in uw account bewaard en pas met toestemming gedeeld.",warning:"Geen officiële indiening. Bevoegdheid, termijnen en vereisten moeten afzonderlijk worden gecontroleerd. AVOfis verzendt niets.",invalid:"Ongeldig of te groot conceptbestand.",reference:"De juridische detailtekst is niet goedgekeurd; de dienstnaam verschijnt in het Engels.",source:"Beschrijving en beperkingen van de dienst"},
 de:{title:"Dokument vorbereiten",intro:"Persönliche Vorbereitungsnotizen je Thema, kein amtlicher Antrag.",service:"Thema",language:"Sprache",country:"Land",institution:"Behörde (sofern bekannt)",purpose:"Zweck",chronology:"Sachverhalt und Chronologie",documentList:"Vorhandene und fehlende Unterlagen",save:"Entwurf lokal speichern (.json)",import:"Entwurf öffnen",docx:"Word herunterladen (.docx)",text:"Text herunterladen (.txt)",print:"Drucken / als PDF sichern",reset:"Zurücksetzen",privacy:"Lokale Downloads übermitteln nichts an AVOfis. Wenn Sie den Entwurf in Ihrem Konto speichern, bleibt er dort bis zu Ihrer ausdrücklichen Freigabe geschützt.",warning:"Kein amtlicher Antrag. Behörde, Fristen und rechtliche Befugnisse bedürfen einer gesonderten Prüfung.",invalid:"Ungültige oder zu große Entwurfsdatei.",reference:"Rechtliche Übersetzung noch nicht freigegeben; englischer Dienstname.",source:"Beschreibung und Grenzen"},
 en:{title:"Prepare your document",intro:"Create service-specific preparation notes on your device. This is not an official application form.",service:"Service",language:"Language",country:"Country",institution:"Authority (if known)",purpose:"Purpose",chronology:"Facts and chronology",documentList:"Available and missing documents",save:"Save draft locally (.json)",import:"Open saved draft",docx:"Download Word (.docx)",text:"Download text (.txt)",print:"Print / Save as PDF",reset:"Clear form",privacy:"Local downloads do not send information to AVOfis. If you save to your account, the draft is stored there and is shared with assigned staff only after your explicit consent. Protect downloaded files.",warning:"Not an official filing. The correct authority, deadlines, required fields and professional authority must be independently verified.",invalid:"Invalid or oversized draft file.",reference:"Full legal translations have not been reviewed; English reference title shown.",source:"Service information and limitations"},
 ar:{title:"إعداد مستند",intro:"إعداد ملاحظات تحضيرية خاصة بالمجال على جهازك، وليست طلباً رسمياً.",service:"المجال",language:"اللغة",country:"البلد",institution:"الجهة (إن كانت معروفة)",purpose:"الغرض",chronology:"الوقائع والتواريخ",documentList:"المستندات المتاحة والناقصة",save:"حفظ المسودة على جهازي (.json)",import:"فتح مسودة محفوظة",docx:"تنزيل Word (.docx)",text:"تنزيل النص (.txt)",print:"طباعة / حفظ PDF",reset:"مسح الحقول",privacy:"التنزيل المحلي لا يرسل بيانات إلى AVOfis. إذا اخترت حفظ المسودة في حسابك، تُحفظ هناك ولا تُشارك مع الموظف المعين إلا بموافقتك الصريحة. احمِ ملفاتك.",warning:"هذه ليست معاملة رسمية. يجب التحقق من الجهة والمواعيد والصلاحيات بواسطة مختص. لا يتم إرسال شيء.",invalid:"ملف مسودة غير صالح أو كبير جداً.",reference:"التفاصيل القانونية لم تُعتمد بعد. يظهر اسم المجال بالإنجليزية.",source:"معلومات المجال وحدود الصلاحيات"},
 ru:{title:"Подготовить документ",intro:"Создайте заметки для подготовки документов по выбранной услуге на своём устройстве. Это не официальное заявление.",service:"Услуга",language:"Язык",country:"Страна",institution:"Орган (если известен)",purpose:"Цель",chronology:"Факты и хронология",documentList:"Имеющиеся и недостающие документы",save:"Сохранить черновик (.json)",import:"Открыть черновик",docx:"Скачать Word (.docx)",text:"Скачать текст (.txt)",print:"Печать / PDF",reset:"Очистить",privacy:"Локальное сохранение не передаёт данные AVOfis. При сохранении в вашем аккаунте черновик хранится там и передаётся уполномоченному сотруднику только с вашего согласия.",warning:"Это не официальная подача. Компетенция, сроки и полномочия подлежат отдельной проверке.",invalid:"Недопустимый или слишком большой файл черновика.",reference:"Правовой перевод ещё не утверждён; название услуги показано по-английски.",source:"Информация об услуге и ограничениях"}
};
function localDownload(content:Blob,filename:string){
 const url=URL.createObjectURL(content);const a=document.createElement("a");a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}
export default function PreparationPage(){
 const [draft,setDraft]=useState<PreparationDraft>(()=>newPreparation("hukuki-danismanlik","tr"));
 const [error,setError]=useState("");
 useEffect(()=>{
  const p=new URLSearchParams(window.location.search);
  const slug=p.get("hizmet"),language=p.get("lang");
  setDraft(newPreparation(isServiceSlug(slug)?slug:"hukuki-danismanlik",isDraftLocale(language)?language:"tr"));
 },[]);
 const t=words[draft.locale];const rtl=draft.locale==="ar";
 const current=services.find(s=>s.slug===draft.service)!;
 const sourceLang=draft.locale==="ar"||draft.locale==="ru"?"en":draft.locale;
 const name=current.title[sourceLang];
 const set=(field:Field,value:string)=>setDraft(d=>({...d,[field]:value}));
 const setAnswer=(field:ServiceField,value:string)=>setDraft(d=>d.version===2?
  {...d,answers:{...d.answers,[field]:value}}:d);
 const changeService=(service:string)=>{if(isServiceSlug(service))setDraft(d=>{
   const fresh=newPreparation(service,d.locale);
   return {...fresh,country:d.country,institution:d.institution};
  });};
 const changeLocale=(locale:string)=>{if(isDraftLocale(locale))setDraft(d=>({...d,locale}));};
 const save=()=>localDownload(new Blob([JSON.stringify(draft,null,2)],{type:"application/json;charset=utf-8"}),`avofis-hazirlik-${draft.service}.json`);
 const downloadText=()=>localDownload(new Blob([preparationText(draft,name)],{type:"text/plain;charset=utf-8"}),`avofis-hazirlik-${draft.service}.txt`);
 const downloadDocx=()=>{
  const bytes=preparationDocx(draft,name);
  localDownload(new Blob([Uint8Array.from(bytes).buffer as ArrayBuffer],{type:"application/vnd.openxmlformats-officedocument.wordprocessingml.document"}),`avofis-hazirlik-${draft.service}.docx`);
 };
 const importSaved=async (file?:File)=>{
  if(!file)return;
  if(file.size>120000){setError(t.invalid);return;}
  try{const parsed=validatePreparation(JSON.parse(await file.text()));if(!parsed)throw Error("INVALID_DRAFT");setDraft(parsed);setError("");}
  catch{setError(t.invalid);}
 };
 const fields:Field[]=["country","institution","purpose","chronology","documentList"];
 const additional=draft.version===2?fieldsByService[draft.service]:[];
 const labels=localizedFieldLabels[draft.locale];
 const contextualTitle=({tr:"Bu hizmete ilişkin ayrıntılar",nl:"Gegevens voor deze dienst",
  de:"Angaben zu dieser Dienstleistung",en:"Details for this service",
  ar:"تفاصيل هذا المجال",ru:"Сведения по услуге"})[draft.locale];
 const contextualNote=({tr:"Tarihler beyanınıza dayanır; kesin süre ve yetkili makam otomatik hesaplanmaz.",
  nl:"Datums zijn uw eigen opgave. Wettelijke termijnen en bevoegdheden worden niet automatisch vastgesteld.",
  de:"Datums sind Ihre Angaben. Fristen und Zuständigkeit werden nicht automatisch bestätigt.",
  en:"Dates are self-reported. Deadlines and legal jurisdiction are not calculated or confirmed.",
  ar:"التواريخ حسب إفادتك؛ لا تُحسب المواعيد أو الصلاحية القضائية تلقائياً.",
  ru:"Даты указаны с ваших слов. Сроки и компетенция органов автоматически не определяются."})[draft.locale];
 return <main dir={rtl?"rtl":"ltr"} lang={draft.locale} className="avofis-theme min-h-screen px-4 py-10 text-white sm:px-8">
  <div className="mx-auto max-w-4xl">
   <nav className="print:hidden"><Link href={`/katalog?lang=${draft.locale}`} className="text-sm text-[#dfbf59] underline underline-offset-4">AVOfis · {t.source}</Link></nav>
   <header className="mt-7"><h1 className="text-3xl font-bold">{t.title}</h1><p className="mt-3 leading-7 text-[#c1cbdf]">{t.intro}</p></header>
   <aside role="note" className="mt-6 rounded-xl border border-[#dfbf59]/40 p-4 text-sm leading-7 text-[#e5e9f1]">{t.warning}</aside>
   <div className="mt-6 grid gap-5 sm:grid-cols-2 print:hidden">
    <label className="text-sm font-semibold">{t.service}<select className="mt-2 w-full rounded-lg border border-[#dfbf59]/40 bg-[#102142] p-3 text-white" value={draft.service} onChange={e=>changeService(e.target.value)}>{services.map(s=><option value={s.slug} key={s.slug}>{s.title[sourceLang]}</option>)}</select></label>
    <label className="text-sm font-semibold">{t.language}<select className="mt-2 w-full rounded-lg border border-[#dfbf59]/40 bg-[#102142] p-3 text-white" value={draft.locale} onChange={e=>changeLocale(e.target.value)}>{draftLocales.map(l=><option key={l} value={l} lang={l}>{({tr:"Türkçe",nl:"Nederlands",de:"Deutsch",en:"English",ar:"العربية",ru:"Русский"})[l]}</option>)}</select></label>
   </div>
   {(draft.locale==="ar"||draft.locale==="ru")&&<p className="mt-4 text-sm text-[#dfbf59]">{t.reference}</p>}
   <section className="mt-6 rounded-xl border border-[#dfbf59]/25 bg-[#101e3b] p-5"><h2 lang={sourceLang} className="text-lg font-semibold">{name}</h2><p lang={sourceLang} className="mt-2 text-sm leading-7 text-[#c1cbdf]">{current.firstDetails[sourceLang]}</p><p lang={sourceLang} className="mt-2 text-sm leading-7 text-[#c1cbdf]">{current.boundaries[sourceLang]}</p></section>
   <form onSubmit={e=>e.preventDefault()} className="mt-7 space-y-5">
    {fields.map(field=><label key={field} className="block text-sm font-semibold">{t[field]}{field==="chronology"||field==="documentList"?<textarea maxLength={4000} rows={5} value={draft[field]} onChange={e=>set(field,e.target.value)} className="mt-2 block w-full rounded-xl border border-[#dfbf59]/30 bg-[#102142] p-3 leading-6 text-white"/>:<input type="text" maxLength={4000} value={draft[field]} onChange={e=>set(field,e.target.value)} className="mt-2 block min-h-12 w-full rounded-xl border border-[#dfbf59]/30 bg-[#102142] p-3 text-white"/>}</label>)}
    {draft.version===2&&<fieldset className="rounded-xl border border-[#dfbf59]/25 bg-[#101e3b] p-5">
     <legend className="px-2 text-base font-semibold">{contextualTitle}</legend>
     <p className="mb-4 text-sm leading-6 text-[#c1cbdf]">{contextualNote}</p>
     <div className="space-y-4">{additional.map(field=>{
      const kind=serviceFieldTypes[field],value=draft.answers?.[field]||"";
      const base="mt-2 block w-full rounded-lg border border-[#dfbf59]/30 bg-[#102142] p-3 text-white";
      return <label key={field} className="block text-sm font-semibold">{labels[field]}
       {kind==="textarea"?<textarea value={value} maxLength={1200} rows={4}
        onChange={e=>setAnswer(field,e.target.value)} className={base}/>:
        <input value={value} maxLength={1200} type={kind==="date"?"date":"text"}
         inputMode={kind==="amount"?"decimal":undefined}
         onChange={e=>setAnswer(field,e.target.value)} className={base}/>}
      </label>;
     })}</div>
    </fieldset>}
    {draft.version===1&&<button type="button" className="avofis-btn avofis-outline print:hidden"
      onClick={()=>setDraft(d=>({...d,version:2,schemaRevision:1,answers:{}}))}>
      {({tr:"Bu taslağa hizmete özel alanlar ekle",nl:"Dienstspecifieke vragen toevoegen",
       de:"Zusätzliche dienstbezogene Fragen",en:"Add service-specific fields",
       ar:"إضافة حقول مخصصة للمجال",ru:"Добавить поля для этой услуги"})[draft.locale]}
     </button>}
    <div className="flex flex-wrap gap-3 print:hidden">
     <button type="button" onClick={save} className="avofis-btn avofis-cta">{t.save}</button>
     <label className="avofis-btn avofis-outline cursor-pointer">{t.import}<input className="sr-only" type="file" accept=".json,application/json" onChange={e=>{void importSaved(e.target.files?.[0]);e.currentTarget.value="";}}/></label>
     <button type="button" onClick={downloadDocx} className="avofis-btn avofis-outline">{t.docx}</button>
     <button type="button" onClick={downloadText} className="avofis-btn avofis-outline">{t.text}</button>
     <button type="button" onClick={()=>window.print()} className="avofis-btn avofis-outline">{t.print}</button>
     <button type="button" onClick={()=>setDraft(newPreparation(draft.service,draft.locale))} className="avofis-btn avofis-outline">{t.reset}</button>
    </div>
    {error&&<p role="alert" className="text-sm text-red-300">{error}</p>}
   </form>
   <AccountDraftControls draft={draft} onLoad={loaded=>{setDraft(loaded);setError("");}}/>
   <p className="mt-7 border-t border-[#dfbf59]/20 pt-4 text-sm leading-7 text-[#c1cbdf] print:hidden">{t.privacy}</p>
   <style jsx global>{`@media print{html,body,main{background:white!important;color:black!important}main{padding:8mm!important}textarea,input{background:white!important;color:black!important;border:1px solid #bbb!important}aside,section{background:white!important;color:black!important}button,nav,select{display:none!important}}`}</style>
  </div>
 </main>;
}