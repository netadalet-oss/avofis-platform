"use client";
import {useMemo,useState} from "react";
import Link from "next/link";
import {PageFrame} from "@/components/avofis/PageFrame";
import {usePortalLanguage} from "@/hooks/usePortalLanguage";
import {countries,preferredLanguages,topics,personRoles,counterpartyTypes,requestTypes,noticeCategories,timeBands,
 evaluatePublicTriage,type TriageInput} from "@/lib/public-triage";
import {buildLocalTriageReview} from "@/lib/public-triage-review";

const wording={
 tr:{eyebrow:"T09 · GÜVENLİ ÖN YÖNLENDİRME",title:"Hangi bilgi yolu uygun?",
 intro:"Bu ekran yalnızca genel bilgi ve gerektiğinde yetkili uzmana yönlendirme gösterir. Ad, e-posta, telefon, kimlik, dosya numarası veya belge istemez. İsteğe bağlı tebliğ tarihi yalnız bu ekranda değerlendirilir; gönderilmez veya kaydedilmez.",
 country:"Sorunun yaşandığı ülke",residence:"Şu anda bulunduğunuz ülke",preferred:"Tercih ettiğiniz dil",languageNote:"Dil tercihi, ilgili dilde hukukî çeviri veya temsil hizmeti bulunduğu anlamına gelmez.",topic:"Konu",topicNote:"Konuyu kısa ve anonim biçimde açıklayın (isteğe bağlı)",topicNoteHelp:"En fazla 160 karakter. Ad, telefon, adres, kimlik, tam tarih, dosya numarası veya özel kişisel bilgi yazmayın. Metin yalnız bu ekranda tutulur; gönderilmez ve sınıflandırmayı değiştirmez.",reviewNote:"Kısa açıklamanız",role:"Kim adına bilgi aranıyor?",counterparty:"Karşı taraf türü (isim yazmayın)",request:"Ne tür bilgi veya destek arıyorsunuz?",serviceNote:"Bu seçim bilgi amaçlıdır; görüşme rezervasyonu, ücretli hizmet sözleşmesi veya dosya açılışı değildir.",notice:"Resmî karar/tebliğ var mı?",time:"Kendi bildirdiğiniz olası süre yakınlığı (hesaplanmaz)",harm:"Özgürlük, sınır dışı, barınma veya başka geri döndürülemez risk bildirimi",early:"Erken uyarı — süre ve hak kaybı riski",inlineAlert:"Acil veya bildirilmiş süre riski — ilgili uzman/kurumu hemen kontrol edin",earlyNote:"Yakın süreyi yalnız siz tahmin edebilirsiniz. Bu ekran hukuki süre hesaplamaz, başvuru yapmaz veya bir süreyi durdurmaz.",professional:"Bağımsız yetkili uzmana ihtiyaç olabileceğini düşünüyorum",result:"Güvenli bilgi yönü",
 urgent:"Acil insan/uzman değerlendirmesi gerekli olabilir. AVOfis üzerinden yanıt beklemeyin; ilgili yetkili kurum, acil yardım veya ehil profesyonele kendi güvenilir kanallarından başvurun.",
 specialist:"İşlem, süre, temsil yetkisi ve ilgili ülke insan tarafından doğrulanmalıdır. Bu siteden dosya açılamaz; gerekirse bağımsız yetkili uzmana doğrudan başvurun.",
 official:"Genel resmî kaynak bilgisi gösterilebilir. İşleme özgü şartları yetkili makamdan teyit edin.",
 general:"Ülke veya konu yeterince belli değil. Resmî kaynağı ve yetkili gerçek kişiyi önce doğrulayın.",
 source:"Resmî genel başlangıç kaynağı",closed:"Başvuru, dosya ve ödeme kanalları kapalıdır. Bu yönlendirme hiçbir süreyi durdurmaz ve hukukî tavsiye/temsil oluşturmaz.",back:"17 hizmet alanı",noticeDate:"Resmî bildirimi aldığınız tarih (varsa; isteğe bağlı)",noticeDateHelp:"Bildirimin tebliğ tarihi otomatik doğrulanmaz; bir süre hesaplanmaz. Bu alan yalnızca cihazınızda görüntülenir ve gönderilmez.",reviewTitle:"Seçimlerinizi gözden geçirin",reviewText:"Bu özet yalnızca seçtiğiniz kategorileri ve kendi girdiğiniz tarihi gösterir. Resmî başvuru veya müşteri kaydı değildir.",reviewConfirm:"Seçimlerimi kontrol ettim (gönderim değildir)",reviewChecked:"Yerel kontrol işaretlendi. Hiçbir başvuru gönderilmedi.",reviewUnconfirmed:"Gönderim yok; yalnızca kontrol için özet.",reviewInvalid:"Tarih geçerli bir takvim tarihi değil; uzman tarafından doğrulanmalıdır.",reviewUnknown:"Tarih belirtilmedi veya bilinmiyor.",reviewCategory:"Konu",reviewDate:"Beyan edilen tarih"},
 nl:{eyebrow:"T09 · VEILIGE ORIËNTATIE",title:"Welke informatieroute past?",
 intro:"Alleen algemene informatie en zo nodig een verwijzing naar een bevoegde deskundige. Geen namen, contactgegevens, dossiernummers, documenten. Een eventuele datum van ontvangst blijft alleen op dit scherm; gegevens worden niet opgeslagen of verzonden.",
 country:"Land waar het probleem speelt",residence:"Land waar u zich bevindt",preferred:"Voorkeurstaal",languageNote:"Een taalvoorkeur is geen toezegging van een juridische vertaling of vertegenwoordiging.",topic:"Onderwerp",topicNote:"Korte anonieme omschrijving (optioneel)",topicNoteHelp:"Maximaal 160 tekens. Geen namen, adressen, identificatie, specifieke data of zaaknummers. Tekst blijft lokaal en wijzigt de classificatie niet.",reviewNote:"Uw korte toelichting",role:"Voor wie zoekt u informatie?",counterparty:"Soort wederpartij (geen namen)",request:"Welk soort informatie of hulp zoekt u?",serviceNote:"Dit is alleen oriëntatie, geen afspraak, overeenkomst of opening van een dossier.",notice:"Is er een besluit of betekening?",time:"Zelf ingeschatte spoed (geen termijnberekening)",harm:"Mogelijk onomkeerbaar nadeel, bewaring of uitzetting",early:"Vroege waarschuwing — termijn en onomkeerbaar nadeel",inlineAlert:"Risico op termijnoverschrijding of ernstig nadeel — raadpleeg direct een bevoegde instantie",earlyNote:"Geef uitsluitend uw eigen inschatting aan. Dit scherm berekent geen juridische termijnen, dient niets in en stuit geen termijnen.",professional:"Mogelijk onafhankelijke bevoegde deskundige nodig",result:"Veilige oriëntatie",
 urgent:"Mogelijk dringend menselijk deskundig advies nodig. Wacht niet op AVOfis; neem zelf contact op met de bevoegde instantie of een bevoegde deskundige.",
 specialist:"Procedure, termijn, bevoegdheden en rechtsgebied vereisen menselijke controle. Hier kunt u geen dossier starten.",
 official:"Alleen algemene officiële informatie. Verifieer de actuele procedure rechtstreeks.",
 general:"Land of onderwerp is onvoldoende duidelijk. Verifieer de bevoegde instantie.",
 source:"Algemene officiële startbron",closed:"Aanvragen, dossiers en betalingen zijn gesloten. Dit stopt geen wettelijke termijn en is geen individueel advies.",back:"17 dienstgebieden",noticeDate:"Datum ontvangst besluit (optioneel)",noticeDateHelp:"Deze datum wordt niet gecontroleerd of gebruikt om wettelijke termijnen te berekenen. Hij wordt niet opgeslagen of verzonden.",reviewTitle:"Controleer uw keuzes",reviewText:"Dit overzicht is uitsluitend lokaal; het is geen aanvraag of dossier.",reviewConfirm:"Ik heb mijn keuzes gecontroleerd (geen verzending)",reviewChecked:"Alleen lokaal bevestigd; er is niets verzonden.",reviewUnconfirmed:"Er is niets verzonden.",reviewInvalid:"Ongeldige datum; controle door een deskundige nodig.",reviewUnknown:"Geen datum opgegeven.",reviewCategory:"Onderwerp",reviewDate:"Zelf opgegeven datum"},
 en:{eyebrow:"T09 · SAFE ORIENTATION",title:"Which information route fits?",
 intro:"This page gives general orientation and possible referral to a qualified professional. It collects no names, contact details, exact dates, case numbers or documents. An optional self-reported notice date stays on this screen and is not sent or saved.",
 country:"Country where the issue arose",residence:"Country where you are located",preferred:"Preferred language",languageNote:"Choosing a language does not guarantee legal translation or representation in that language.",topic:"Topic",topicNote:"Brief anonymous description (optional)",topicNoteHelp:"Maximum 160 characters. No names, contact details, ID numbers, exact dates or case numbers. Text stays on this screen and does not change routing.",reviewNote:"Your brief description",role:"Whose matter?",counterparty:"Type of other party (no names)",request:"What type of information or help?",serviceNote:"This selection is only orientation, not a booking, paid agreement or client intake.",notice:"Has a decision/notice been received?",time:"Your own urgency estimate (not a deadline calculation)",harm:"Possible irreparable harm, detention or removal",early:"Early warning — time limits and serious harm",inlineAlert:"Urgent or reported time-limit risk — contact a qualified professional or authority promptly",earlyNote:"Select only your own estimate of urgency. This screen does not calculate deadlines, submit a case or stop a legal time limit.",professional:"An independently authorised specialist may be needed",result:"Safe information outcome",
 urgent:"You may need urgent human expert help. Do not wait for an AVOfis response; use an official channel or contact an authorised professional directly.",
 specialist:"Procedure, time limits, jurisdiction and representation require human verification. No client matter can be opened here.",
 official:"Only general official starting information is available. Confirm the exact requirements with the competent authority.",
 general:"Country or subject is unclear. Verify the competent authority before taking action.",
 source:"Official general starting point",closed:"Intake, cases and payments are closed. This does not stop legal time limits or create representation.",back:"17 service areas",noticeDate:"Date notice was received (optional)",noticeDateHelp:"This self-reported date is not verified and no legal deadline is calculated. It is neither transmitted nor saved.",reviewTitle:"Review your choices",reviewText:"This is a local summary only, not a filing, accepted request or client record.",reviewConfirm:"I have reviewed my choices (does not submit)",reviewChecked:"Locally reviewed. Nothing was submitted.",reviewUnconfirmed:"Nothing was submitted; review your choices.",reviewInvalid:"Not a valid calendar date; human verification is required.",reviewUnknown:"No date provided.",reviewCategory:"Topic",reviewDate:"Self-reported date"}
} as const;
const privacyIntro={
 tr:{text:"Gizlilik bilgilendirmesi: bu sayfa kimlik veya belge istemez. Kişisel veri ve haklarınızla ilgili açıklamayı işlem öncesi okuyun.",label:"Gizlilik metnini aç",upload:"Bu oturumsuz ön yönlendirmeden belge yüklenemez. Özel belge kanalı ancak doğrulanmış hesap, izin ve ayrı güvenlik onayıyla açılabilir; şu anda kapalıdır.",contract:"Bu seçimi yapmak veya bilgi sonucunu görüntülemek hizmet sözleşmesi, başvuru kabulü veya ücret ödeme yükümlülüğü oluşturmaz.",unsure:"Konu veya ülke belirsizse ‘Emin değilim’ seçimi insan incelemesi gerektirir; sistem sizin adınıza işlem yapmaz."},
 nl:{text:"Privacyinformatie: deze pagina vraagt geen identiteit of documenten. Lees de privacyverklaring vóór gebruik.",label:"Privacyverklaring openen",upload:"Uploaden is hier niet mogelijk. Privédocumenten vereisen een geverifieerd account en afzonderlijke toestemming; die dienst is nog gesloten.",contract:"Een keuze of uitkomst is geen overeenkomst, geaccepteerde aanvraag of betalingsverplichting.",unsure:"Kies 'Niet zeker' bij onzekerheid; een bevoegde mens moet beoordelen."},
 en:{text:"Privacy notice: this page does not request identity or documents. Read the privacy information before using it.",label:"Open privacy notice",upload:"Anonymous orientation cannot upload documents. A private document channel would require verified authentication, explicit consent and separate security approval; it is currently closed.",contract:"A selection or result is not a service agreement, accepted application or payment obligation.",unsure:"Use 'Not sure' when the topic or country is uncertain; human review is required."}
} as const;
const languageOptions={tr:"Türkçe",nl:"Nederlands",de:"Deutsch",en:"English",ar:"العربية",ru:"Русский",unknown:"Not sure / Emin değilim"};
const countryOptions={nl:"Nederland",de:"Deutschland",tr:"Türkiye",other:"Other / Diğer",unknown:"Not sure / Emin değilim"};
const topicOptions={document:"Document / Belge",administrative_objection:"Administrative objection / İtiraz",court_procedure:"Court / Mahkeme",asylum:"Asylum / İltica",detention_or_removal:"Detention or removal / Gözetim veya sınır dışı",residence:"Residence / Oturum",family:"Family / Aile",work:"Work / Çalışma",housing:"Housing / Konut",debt:"Debt / Alacak",business:"Business / Şirket",unknown:"Not sure / Emin değilim"};
const roleOptions={self:"Self / Kendim",relative:"Relative / Yakınım",employer:"Employer / İşveren",organisation:"Organisation / Kurum",representative:"Representative / Temsilci",unknown:"Not sure / Emin değilim"};
const counterpartyOptions={person:"Person / Kişi",employer:"Employer / İşveren",authority:"Authority / Kamu kurumu",company:"Company / Şirket",other:"Other / Diğer",unknown:"Not sure / Emin değilim"};
const requestTypeOptions={general_information:"General information / Genel bilgi",brief_consultation:"Brief consultation / Kısa görüşme",document_review:"Document review / Belge inceleme",detailed_case_analysis:"Detailed case analysis / Ayrıntılı dosya analizi",unknown:"Not sure / Emin değilim"};
const noticeOptions={no_notice:"No / Hayır",notice_received:"Received / Tebliğ alındı",not_sure:"Not sure / Emin değilim"};
const timeOptions={unknown:"Unknown / Bilinmiyor",less_than_48h:"Within 48 hours? / 48 saat içinde olabilir",within_7d:"Within a week? / Bir hafta içinde olabilir",later:"Later / Daha sonra"};
const initial:TriageInput={country:"unknown",residenceCountry:"unknown",preferredLanguage:"unknown",topic:"unknown",personRole:"unknown",counterpartyType:"unknown",requestType:"unknown",
 noticeCategory:"not_sure",timeBand:"unknown",immediateHarm:false,professionalNeeded:false};
export default function SafeTriagePage(){
 const lang=usePortalLanguage(),t=wording[lang],privacy=privacyIntro[lang];
 const [input,setInput]=useState<TriageInput>({...initial});
 const [noticeDate,setNoticeDate]=useState("");
 const [topicNote,setTopicNote]=useState("");
 const [confirmationKey,setConfirmationKey]=useState<string|null>(null);
 const review=useMemo(()=>buildLocalTriageReview(input,noticeDate,topicNote),[input,noticeDate,topicNote]);
 const reviewSignature=JSON.stringify(input)+"|"+noticeDate+"|"+topicNote;
 const isReviewed=confirmationKey===reviewSignature;
 const result=useMemo(()=>evaluatePublicTriage(input),[input]);
 const select=(key:"country"|"residenceCountry"|"preferredLanguage"|"topic"|"personRole"|"counterpartyType"|"requestType"|"noticeCategory"|"timeBand",
 label:string,options:readonly string[],labels:Record<string,string>)=><label className="block text-sm">
  <span className="font-semibold">{label}</span>
  <select className="avofis-field mt-2 w-full" value={input[key]}
    onChange={e=>{if(key==="noticeCategory")setNoticeDate("");setInput(p=>({...p,[key]:e.target.value}));}}>
   {options.map(v=><option key={v} value={v}>{labels[v]??v}</option>)}
  </select>
 </label>;
 const message=result.disposition==="URGENT_SPECIALIST"?t.urgent:
  result.disposition==="SPECIALIST_REVIEW"?t.specialist:
  result.disposition==="OFFICIAL_INFORMATION"?t.official:t.general;
 return <PageFrame wide lang={lang} eyebrow={t.eyebrow} title={t.title} description={t.intro}>
  <aside className="mb-5 rounded-xl border border-[#dfbf59]/35 p-4 text-sm leading-7" aria-label="Privacy before orientation">
   <p>{privacy.text}</p>
   <Link href={"/gizlilik?lang="+lang} className="font-semibold text-[#dfbf59] underline underline-offset-4">{privacy.label}</Link>
  </aside>
  <section aria-label="Non-identifying, local-only selections" className="avofis-card rounded-2xl border p-5 sm:p-7">
   <div className="grid gap-5 sm:grid-cols-2">
    {select("preferredLanguage",t.preferred,preferredLanguages,languageOptions)}
    {select("residenceCountry",t.residence,countries,countryOptions)}
    {select("country",t.country,countries,countryOptions)}
    {select("topic",t.topic,topics,topicOptions)}
    {select("personRole",t.role,personRoles,roleOptions)}
    {select("counterpartyType",t.counterparty,counterpartyTypes,counterpartyOptions)}
    {select("requestType",t.request,requestTypes,requestTypeOptions)}
    {select("noticeCategory",t.notice,noticeCategories,noticeOptions)}
   </div>
   {input.noticeCategory==="notice_received"&&<label className="mt-5 block text-sm">
    <span className="font-semibold">{t.noticeDate}</span>
    <input type="date" className="avofis-field mt-2 block w-full" value={noticeDate}
     onChange={e=>setNoticeDate(e.target.value)} autoComplete="off" aria-describedby="notice-date-help"/>
    <span id="notice-date-help" className="mt-2 block text-xs leading-6 text-[#b9c5df]">{t.noticeDateHelp}</span>
   </label>}
   <label className="mt-5 block text-sm">
    <span className="font-semibold">{t.topicNote}</span>
    <textarea className="avofis-field mt-2 block w-full" rows={2} maxLength={160}
     value={topicNote} onChange={e=>setTopicNote(e.target.value)} autoComplete="off"
     aria-describedby="topic-note-help"/>
    <span id="topic-note-help" className="mt-2 block text-xs leading-6 text-[#b9c5df]">{t.topicNoteHelp}</span>
   </label>
   <p className="mt-4 text-xs leading-6 text-[#b9c5df]">{t.languageNote}</p>
   <p className="mt-2 text-xs leading-6 text-[#b9c5df]">{privacy.unsure}</p>
   <p className="mt-2 text-xs leading-6 text-[#b9c5df]">{t.serviceNote}</p>
   <p className="mt-2 text-xs leading-6 text-[#b9c5df]">{privacy.contract}</p>
   <fieldset className="mt-5 rounded-xl border border-[#dfbf59]/50 p-4">
    <legend className="px-2 text-sm font-semibold text-[#dfbf59]">{t.early}</legend>
    <p className="mb-4 text-xs leading-6 text-[#b9c5df]">{t.earlyNote}</p>
    {select("timeBand",t.time,timeBands,timeOptions)}
    <label className="mt-4 flex items-start gap-3 text-sm leading-6">
     <input type="checkbox" className="mt-1" checked={input.immediateHarm} onChange={e=>setInput(p=>({...p,immediateHarm:e.target.checked}))}/>
     <span>{t.harm}</span>
    </label>
    {(result.disposition==="URGENT_SPECIALIST"||input.timeBand==="within_7d"||
      input.noticeCategory==="notice_received")&&
      <div role="alert" className="mt-4 rounded-xl border border-[#dfbf59] p-4" aria-live="assertive">
       <strong className="text-[#dfbf59]">{t.inlineAlert}</strong>
       <p className="mt-2 text-sm leading-6">{result.disposition==="URGENT_SPECIALIST"?t.urgent:t.specialist}</p>
       <p className="mt-2 text-xs leading-6 text-[#b9c5df]">{t.earlyNote}</p>
      </div>}
   </fieldset>
   <div className="mt-5 grid gap-3">
    <label className="flex items-start gap-3 text-sm leading-6">
     <input type="checkbox" className="mt-1" checked={input.professionalNeeded} onChange={e=>setInput(p=>({...p,professionalNeeded:e.target.checked}))}/>
     <span>{t.professional}</span>
    </label>
   </div>
  </section>
  <section aria-live="polite" className="mt-5 rounded-xl border border-[#dfbf59]/40 bg-[#071738] p-5 sm:p-6">
   <h2 className="text-lg font-semibold text-[#dfbf59]">{t.result}</h2>
   <p className="mt-3 text-sm leading-7">{message}</p>
   {result.issues.length>0&&<p className="mt-3 text-xs text-[#b9c5df]">Kontrol / review: {result.issues.join(" · ")}</p>}
   {result.officialSource&&<a href={result.officialSource} target="_blank" rel="noopener noreferrer"
      className="mt-4 inline-block text-sm font-semibold text-[#dfbf59] underline underline-offset-4">{t.source}</a>}
   <p className="mt-4 border-t border-[#dfbf59]/20 pt-4 text-xs leading-6 text-[#b9c5df]">{t.closed}</p>
   <p className="mt-2 text-xs leading-6 text-[#b9c5df]">{privacy.upload}</p>
  </section>
  <section aria-label="Local selection review — no submission"
    className="mt-5 rounded-xl border border-[#dfbf59]/40 p-5 text-sm">
    <h2 className="font-semibold text-[#dfbf59]">{t.reviewTitle}</h2>
    <p className="mt-2 leading-6 text-[#b9c5df]">{t.reviewText}</p>
    <dl className="mt-3 grid gap-2 sm:grid-cols-2">
     <div><dt className="text-[#b9c5df]">{t.reviewCategory}</dt><dd className="font-semibold">{topicOptions[review.topic as keyof typeof topicOptions]??review.topic}</dd></div>
     {review.topicNote&&<div><dt className="text-[#b9c5df]">{t.reviewNote}</dt><dd className="font-semibold whitespace-pre-wrap break-words">{review.topicNote}</dd></div>}
     <div><dt className="text-[#b9c5df]">{t.reviewDate}</dt><dd className="font-semibold">
       {review.noticeDateStatus==="SELF_REPORTED_UNVERIFIED"?review.noticeDate:
        review.noticeDateStatus==="INVALID_FORMAT"?t.reviewInvalid:t.reviewUnknown}
     </dd></div>
    </dl>
    <label className="mt-4 flex items-start gap-3 leading-6">
     <input type="checkbox" className="mt-1" checked={isReviewed}
      onChange={e=>setConfirmationKey(e.target.checked?reviewSignature:null)}/>
     <span>{t.reviewConfirm}</span>
    </label>
    <p role="status" className="mt-2 text-xs text-[#b9c5df]">
      {isReviewed?t.reviewChecked:t.reviewUnconfirmed}
    </p>
  </section>
  <Link href={"/katalog?lang="+lang} className="avofis-outline avofis-btn mt-5 inline-flex">{t.back}</Link>
 </PageFrame>;
}
