"use client";
import {useState} from "react";
import Link from "next/link";
import {PageFrame} from "@/components/avofis/PageFrame";
import {usePortalLanguage} from "@/hooks/usePortalLanguage";
import {documentCategories,evaluateDocumentPreparation,preUploadWarning,
 type DocumentCategory} from "@/lib/document-preparation-gate";
const names={
 tr:{event:"Olay",decision:"Karar",contract:"Sözleşme",correspondence:"Yazışma",identity:"Kimlik",other:"Diğer",unknown:"Bilmiyorum"},
 nl:{event:"Gebeurtenis",decision:"Besluit",contract:"Contract",correspondence:"Correspondentie",identity:"Identiteitsdocument",other:"Overig",unknown:"Weet ik niet"},
 en:{event:"Event",decision:"Decision",contract:"Contract",correspondence:"Correspondence",identity:"Identity document",other:"Other",unknown:"Not sure"}
} as const;
const labels={
 tr:{heading:"Belge paylaşmadan önce",sub:"Sadece hazırlık ve veri minimizasyonu. Belge yükleme, özel hesap, dosya erişimi ve paylaşımı bu aşamada kapalıdır.",category:"Belge türünüz",ack:"BSN, kimlik ve sağlık bilgileri uyarısını okudum.",request:"Gelecekte özel kanalın değerlendirilmesine ihtiyacım var (talep gönderilmez).",status:"Durum: belge gönderimi ve özel Storage henüz açılmadı.",privacy:"Gizlilik bilgilendirmesi",eyebrow:"L4 · BELGE GÜVENLİĞİ",risk:"R-398: DOCX biçimi ve güvenli dosya türü kararı açık. Zararlı yazılım taraması, gerçek kullanıcı kimliği ve dosya sahibi izolasyonu uçtan uca doğrulanmadı."},
 nl:{heading:"Voorbereiding van documenten",sub:"Alleen voorbereiding: geen upload, privédossier of delen. Een beveiligd kanaal moet afzonderlijk worden goedgekeurd.",category:"Documentcategorie",ack:"Ik heb de waarschuwing over BSN, identiteit en gezondheid gelezen.",request:"Ik heb mogelijk later een privékanaal nodig (geen verzoek verzonden).",status:"Upload en privéopslag zijn gesloten.",privacy:"Privacyverklaring",eyebrow:"L4 · DOCUMENTVEILIGHEID",risk:"R-398: De beslissing over DOCX en toegestane bestandstypen staat open. Malwarecontrole, echte gebruikersidentiteit en scheiding tussen dossierhouders zijn niet end-to-end geverifieerd."},
 en:{heading:"Prepare documents safely",sub:"Preparation only; file uploads, private storage and sharing are closed until separately verified.",category:"Document category",ack:"I have read the warning about identification and health data.",request:"I might need a private channel later (nothing is submitted).",status:"File upload and private storage remain closed.",privacy:"Privacy notice",eyebrow:"L4 · DOCUMENT SAFETY",risk:"R-398: The DOCX and allowed-file-type decision remains open. Malware scanning, real user identity and case-owner isolation have not been independently verified end to end."}
} as const;
export default function PublicDocumentPreparationPage(){
 const lang=usePortalLanguage();
 const t=labels[lang];
 const [category,setCategory]=useState<DocumentCategory>("unknown");
 const [warningRead,setWarningRead]=useState(false);
 const [futureNeed,setFutureNeed]=useState(false);
 const result=evaluateDocumentPreparation({
  category,redactionWarningRead:warningRead,privateChannelRequested:futureNeed
 });
 return <PageFrame lang={lang} eyebrow={t.eyebrow} title={t.heading} description={t.sub}>
  <aside className="rounded-xl border border-[#dfbf59]/50 p-5 text-sm leading-7" role="note">
   <h2 className="font-semibold">R-399 · Privacy first</h2>
   <p className="mt-2">{preUploadWarning[lang]}</p>
   <Link href={"/gizlilik?lang="+lang} className="mt-2 inline-block text-[#dfbf59] underline">{t.privacy}</Link>
  </aside>
  <section className="avofis-card mt-5 rounded-xl border p-5">
   <label htmlFor="public-document-category" className="block font-semibold">{t.category}</label>
   <select id="public-document-category" className="avofis-field mt-2 w-full"
    value={category} onChange={e=>setCategory(e.target.value as DocumentCategory)}>
    {documentCategories.map(value=><option key={value} value={value}>{names[lang][value]}</option>)}
   </select>
   <label className="mt-5 flex gap-3 text-sm leading-6">
    <input type="checkbox" checked={warningRead} onChange={e=>setWarningRead(e.target.checked)}/>
    {t.ack}
   </label>
   <label className="mt-3 flex gap-3 text-sm leading-6">
    <input type="checkbox" checked={futureNeed} onChange={e=>setFutureNeed(e.target.checked)}/>
    {t.request}
   </label>
   <p role="status" className="mt-5 border-t pt-4 text-sm font-semibold">{t.status}</p>
   <p className="mt-2 text-xs leading-6">
    R-397 · R-399 · R-400 · {result.reasons.join(" · ")}
   </p>
   <p className="mt-2 text-xs leading-6">{t.risk}</p>
  </section>
  <Link href={"/triyaj?lang="+lang} className="avofis-outline avofis-btn mt-5 inline-flex">
   {lang==="tr"?"Güvenli yönlendirmeye dön":lang==="nl"?"Terug naar oriëntatie":"Return to orientation"}
  </Link>
 </PageFrame>;
}
