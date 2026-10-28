"use client";
import Link from "next/link";
import Script from "next/script";
import { useEffect,useRef,useState,type FormEvent } from "react";
import { ArrowRight,CheckCircle2,LockKeyhole,ShieldCheck } from "lucide-react";
import { PageFrame } from "@/components/avofis/PageFrame";
import { useSiteLang } from "@/hooks/useSiteLang";
import { services,localized,ui,countryOptions,roleOptions,withLang } from "@/lib/avofis-site";

declare global {
 interface Window {turnstile?:{render:(element:HTMLElement,opts:{sitekey:string;callback:(token:string)=>void;"expired-callback":()=>void})=>string;reset:(id?:string)=>void};}
}
const enabled=process.env.NEXT_PUBLIC_AVOFIS_INTAKE_ENABLED==="true";
const sitekey=process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY||"";
const text={
 tr:{otherCountry:"Ülkeyi belirtin",secondaryCountry:"Diğer ilgili ülke (varsa)",authorityName:"İlgili mahkeme veya kurum (varsa)",title:"Hizmet başvurusu",intro:"İlgili hizmeti ve ülkeyi seçin. Başvuru açıldığında yalnızca ön değerlendirme için gerekli iletişim bilgilerini alacağız; kimlik, sağlık, iltica veya dava belgelerini bu alana yüklemeyin.",step1:"1. İşleminizi belirleyin",step2:"2. Temel bilgilerinizi girin",service:"İlgili hizmet",country:"İlgili ülke",role:"Kimin adına?",stage:"İşlemin durumu",date:"Resmî kararın tebliğ tarihi (varsa)",dateHelp:"İtiraz ve hak arama başvurularında süreyi uzman doğrulamalıdır. Bu form süreyi durdurmaz.",name:"Ad soyad",email:"E-posta",message:"Talebinizin kısa açıklaması (en fazla 500 karakter)",consent:"Gizlilik bilgilendirmesini okudum. Talebimin değerlendirilmesi ve bana yanıt verilmesi amacıyla bilgilerin işlenmesini kabul ediyorum.",closed:"Yeni başvuru kabulü şu anda kapalı",closedText:"Bu ekrandan kişisel bilgi veya belge gönderilemez. İlgili hizmetleri inceleyebilirsiniz.",privacy:"Gizlilik",choose:"Seçiniz",submit:"Başvuruyu gönder",sending:"Gönderiliyor…",received:"Başvurunuz kaydedildi",reference:"Referans",receivedDesc:"Başvuru kaydı, dosya kabulü veya hizmet sözleşmesi anlamına gelmez.",error:"Başvurunuz kaydedilemedi. Formu kontrol ederek tekrar deneyin.",captcha:"Güvenlik doğrulamasını ve onay kutusunu tamamlayın.",noFiles:"Bu formda belge yükleme yapılmaz.",stages:["Yeni işlem başlatacağım","Devam eden başvurum var","Eksik belge istendi","Karar veya ret tebliğ edildi","Uyuşmazlık/itirazım var"]},
 nl:{otherCountry:"Vermeld het land",secondaryCountry:"Ander betrokken land (optioneel)",authorityName:"Rechtbank of instantie (indien bekend)",title:"Een dienst aanvragen",intro:"Kies een dienst en land. Bij de eerste aanvraag vragen we geen identiteits-, medische, asiel- of procesdocumenten.",step1:"1. Beschrijf uw verzoek",step2:"2. Vul contactgegevens in",service:"Dienst",country:"Land",role:"Namens wie?",stage:"Huidige situatie",date:"Datum van ontvangst van een besluit (indien van toepassing)",dateHelp:"Een deskundige moet toepasselijke bezwaar- en beroepstermijnen controleren. Dit formulier onderbreekt geen termijnen.",name:"Naam",email:"E-mail",message:"Korte toelichting (max. 500 tekens)",consent:"Ik heb de privacyinformatie gelezen en stem in met verwerking voor het beoordelen en beantwoorden van mijn verzoek.",closed:"Nieuwe aanvragen zijn momenteel gesloten",closedText:"Via dit formulier worden nog geen persoonsgegevens of documenten aanvaard.",privacy:"Privacy",choose:"Selecteren",submit:"Aanvraag versturen",sending:"Verzenden…",received:"Aanvraag geregistreerd",reference:"Referentie",receivedDesc:"Dit is nog geen opdracht of dienstverleningsovereenkomst.",error:"De aanvraag kon niet worden verwerkt. Controleer de gegevens.",captcha:"Voltooi de beveiligingscontrole en toestemming.",noFiles:"Geen documenten uploaden via dit formulier.",stages:["Nieuwe aanvraag","Lopende aanvraag","Ontbrekende documenten","Besluit of afwijzing ontvangen","Geschil of bezwaar"]},
 de:{otherCountry:"Land benennen",secondaryCountry:"Weiteres betroffenes Land (optional)",authorityName:"Gericht oder Behörde (sofern bekannt)",title:"Leistungsanfrage",intro:"Wählen Sie Anliegen und Land. Über dieses Formular keine Ausweise, Gesundheits-, Asyl- oder Gerichtsakten senden.",step1:"1. Anliegen auswählen",step2:"2. Kontaktdaten eingeben",service:"Leistung",country:"Land",role:"Für wen?",stage:"Verfahrensstand",date:"Zustellungsdatum eines Bescheids (falls vorhanden)",dateHelp:"Ein Fachkundiger muss die geltenden Fristen prüfen. Die Anfrage unterbricht keine Fristen.",name:"Vor- und Nachname",email:"E-Mail",message:"Kurze Beschreibung (max. 500 Zeichen)",consent:"Ich habe die Datenschutzhinweise gelesen und willige in die Verarbeitung zur Prüfung und Beantwortung meiner Anfrage ein.",closed:"Neue Anfragen sind derzeit geschlossen",closedText:"Personenbezogene Daten oder Dokumente können hier derzeit nicht eingereicht werden.",privacy:"Datenschutz",choose:"Auswählen",submit:"Anfrage senden",sending:"Wird gesendet…",received:"Anfrage erfasst",reference:"Referenz",receivedDesc:"Noch kein Auftrag oder Dienstleistungsvertrag.",error:"Die Anfrage konnte nicht gespeichert werden. Bitte Angaben prüfen.",captcha:"Sicherheitsprüfung und Einwilligung abschließen.",noFiles:"Keine Dateiuploads in diesem Formular.",stages:["Neues Verfahren","Laufendes Verfahren","Fehlende Unterlagen","Bescheid/Ablehnung erhalten","Streit oder Widerspruch"]},
 en:{otherCountry:"Specify the country",secondaryCountry:"Other country involved (optional)",authorityName:"Court or public authority (if known)",title:"Service enquiry",intro:"Select your issue and country. Do not upload identity, medical, asylum or court records in an initial enquiry.",step1:"1. Identify your request",step2:"2. Provide contact details",service:"Service",country:"Relevant country",role:"On whose behalf?",stage:"Current status",date:"Official decision notification date (if any)",dateHelp:"A qualified specialist must verify applicable deadlines. This enquiry does not suspend any legal deadline.",name:"Full name",email:"Email address",message:"Brief description (max. 500 characters)",consent:"I have read the privacy notice and consent to processing my details to review and respond to this enquiry.",closed:"New enquiries are currently closed",closedText:"Personal information and documents are not being accepted through this form.",privacy:"Privacy",choose:"Select",submit:"Send enquiry",sending:"Sending…",received:"Enquiry recorded",reference:"Reference",receivedDesc:"This is not an accepted case or service agreement.",error:"Enquiry could not be recorded. Please review your entries.",captcha:"Complete verification and consent.",noFiles:"No document uploads in this form.",stages:["New matter","Application in progress","Missing documents","Decision/refusal received","Dispute or appeal"]}
};
export default function IntakePage(){
 const lang=useSiteLang(),t=text[lang],u=ui[lang];
 const [service,setService]=useState(services[0].slug),[country,setCountry]=useState("Netherlands"),[applicantRole,setApplicantRole]=useState("self"),[stage,setStage]=useState("new");
 const [otherCountry,setOtherCountry]=useState(""),[secondaryCountry,setSecondaryCountry]=useState(""),[authorityName,setAuthorityName]=useState("");
 const [decisionDate,setDecisionDate]=useState(""),[name,setName]=useState(""),[email,setEmail]=useState(""),[message,setMessage]=useState(""),[accepted,setAccepted]=useState(false);
 const [token,setToken]=useState(""),[sending,setSending]=useState(false),[error,setError]=useState(""),[reference,setReference]=useState("");
 const [step,setStep]=useState(1),[captchaReady,setCaptchaReady]=useState(false),captchaRef=useRef<HTMLDivElement>(null),rendered=useRef(false);
 useEffect(()=>{const s=new URLSearchParams(window.location.search).get("service");if(services.some(item=>item.slug===s))setService(s!);},[]);
 useEffect(()=>{
  if(step!==2||!captchaReady||rendered.current||!window.turnstile||!captchaRef.current)return;
  rendered.current=true;
  window.turnstile.render(captchaRef.current,{sitekey,callback:setToken,"expired-callback":()=>setToken("")});
 },[step,captchaReady]);
 function initCaptcha(){
  if(!enabled||!sitekey||!captchaRef.current||!window.turnstile||rendered.current)return;
  rendered.current=true;window.turnstile.render(captchaRef.current,{sitekey,callback:setToken,"expired-callback":()=>setToken("")});
 }
 async function submit(e:FormEvent<HTMLFormElement>){
  e.preventDefault();if(!enabled||!sitekey||!accepted||!token){setError(t.captcha);return;}
  setSending(true);setError("");
  try{
   const res=await fetch("/api/intake",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email,country,otherCountry,secondaryCountry,authorityName,service,applicantRole,stage,decisionDate,message,lang,privacyAccepted:true,turnstileToken:token})});
   const payload=await res.json();
   if(!res.ok||typeof payload.reference!=="string")throw new Error("server");
   setReference(payload.reference);
  }catch{setError(t.error);setToken("");window.turnstile?.reset();}
  finally{setSending(false);}
 }
 const deadlineSensitive=stage==="decision"||stage==="dispute"||["resmi-basvuru-itiraz","uluslararasi-insan-haklari","mahkeme-temsil","alacak-takibi","sosyal-guvenlik-vergi","ceza-sikayet-trafik"].includes(service);
 return <PageFrame lang={lang} eyebrow={u.intake} title={t.title} description={t.intro} wide>
   {enabled&&sitekey&&<Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={()=>{setCaptchaReady(true);initCaptcha();}}/>}
   <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
    <div className="avofis-card rounded-[18px] border p-5 sm:p-7">
      {reference?<div role="status" className="flex items-start gap-3"><span className="avofis-icon-tile"><CheckCircle2 className="h-5 w-5"/></span><div><h2 className="text-[17px] font-semibold">{t.received}</h2><p className="mt-2 text-[13px] leading-7 text-[#B9C5DF]">{t.receivedDesc}</p><p className="mt-3 font-mono text-[13px] text-[#dfbf59]">{t.reference}: {reference}</p></div></div>:<>
       <div className="mb-6 flex items-center gap-3 border-b border-[#dfbf59]/15 pb-5"><span className="avofis-icon-tile text-[13px] font-semibold">{step}</span><h2 className="text-[17px] font-semibold text-[#F2F5FF]">{step===1?t.step1:t.step2}</h2></div>
       {step===1?<div className="grid gap-4">
        <label className="avofis-form-label block">{t.service}<select className="avofis-field" value={service} onChange={e=>setService(e.target.value)}>{services.map(s=><option value={s.slug} key={s.slug}>{localized(s.title,lang)}</option>)}</select></label>
        <div className="grid gap-4 sm:grid-cols-2">
         <label className="avofis-form-label block">{t.country}<select className="avofis-field" value={country} onChange={e=>setCountry(e.target.value)}>{countryOptions.map(c=><option value={c.value} key={c.value}>{localized(c.label,lang)}</option>)}</select></label>
         <label className="avofis-form-label block">{t.role}<select className="avofis-field" value={applicantRole} onChange={e=>setApplicantRole(e.target.value)}>{roleOptions.map(r=><option value={r.value} key={r.value}>{localized(r.label,lang)}</option>)}</select></label>
        </div>
        {country==="Other"&&<label className="avofis-form-label block">{t.otherCountry}<input required maxLength={80} className="avofis-field" value={otherCountry} onChange={e=>setOtherCountry(e.target.value)}/></label>}
        <div className="grid gap-4 sm:grid-cols-2">
         <label className="avofis-form-label block">{t.secondaryCountry}<input className="avofis-field" maxLength={80} value={secondaryCountry} onChange={e=>setSecondaryCountry(e.target.value)}/></label>
         <label className="avofis-form-label block">{t.authorityName}<input className="avofis-field" maxLength={120} value={authorityName} onChange={e=>setAuthorityName(e.target.value)}/></label>
        </div>
        <label className="avofis-form-label block">{t.stage}<select className="avofis-field" value={stage} onChange={e=>setStage(e.target.value)}>{t.stages.map((label,i)=><option value={["new","ongoing","missing","decision","dispute"][i]} key={i}>{label}</option>)}</select></label>
        {deadlineSensitive&&<><label className="avofis-form-label block">{t.date}<input className="avofis-field" type="date" value={decisionDate} onChange={e=>setDecisionDate(e.target.value)}/></label><p className="flex items-start gap-2 text-[12px] leading-[1.7] text-[#f0d56d]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0"/>{t.dateHelp}</p></>}
        {enabled&&sitekey?<button type="button" className="avofis-cta avofis-btn justify-self-start" disabled={country==="Other"&&otherCountry.trim().length<2} onClick={()=>setStep(2)}>{u.continue}<ArrowRight className="h-4 w-4"/></button>:<div role="status" className="rounded-xl border border-[#dfbf59]/30 bg-[#071738] p-4"><div className="flex items-start gap-3"><LockKeyhole className="mt-0.5 h-5 w-5 shrink-0 text-[#dfbf59]"/><div><p className="text-[14px] font-semibold text-[#F2F5FF]">{t.closed}</p><p className="mt-1 text-[13px] leading-[1.8] text-[#B9C5DF]">{t.closedText}</p></div></div></div>}
       </div>:<form className="grid gap-4" onSubmit={submit}>
         <div className="grid gap-4 sm:grid-cols-2"><label className="avofis-form-label block">{t.name}<input required maxLength={100} autoComplete="name" className="avofis-field" value={name} onChange={e=>setName(e.target.value)}/></label><label className="avofis-form-label block">{t.email}<input required type="email" maxLength={254} autoComplete="email" className="avofis-field" value={email} onChange={e=>setEmail(e.target.value)}/></label></div>
         <label className="avofis-form-label block">{t.message}<textarea rows={4} maxLength={500} className="avofis-field" value={message} onChange={e=>setMessage(e.target.value)}/></label>
         <p className="text-[12px] leading-[1.7] text-[#B9C5DF]">{t.noFiles}</p>
         <label className="flex items-start gap-3 text-[13px] leading-[1.8] text-[#DDE5F3]"><input className="mt-1 h-4 w-4 shrink-0" type="checkbox" required checked={accepted} onChange={e=>setAccepted(e.target.checked)}/><span>{t.consent} <Link className="font-semibold text-[#dfbf59] underline" href={withLang("/gizlilik",lang)}>{t.privacy}</Link></span></label>
         <div ref={captchaRef} aria-label="Security verification"/>
         {error&&<p role="alert" className="rounded-lg border border-red-400/30 bg-red-950/40 p-3 text-[13px] text-red-200">{error}</p>}
         <div className="flex flex-wrap gap-2"><button type="button" className="avofis-outline avofis-btn" onClick={()=>setStep(1)}>{u.goBack}</button><button disabled={sending||!accepted||!token} className="avofis-cta avofis-btn disabled:cursor-not-allowed disabled:opacity-50">{sending?t.sending:t.submit}</button></div>
       </form>}
      </>}
    </div>
    <aside className="avofis-card rounded-[18px] border p-5"><span className="avofis-eyebrow">{u.scope}</span><h2 className="mt-3 text-[16px] font-semibold text-[#F2F5FF]">{localized(services.find(s=>s.slug===service)?.title||services[0].title,lang)}</h2><p className="mt-2 text-[13px] leading-[1.8] text-[#B9C5DF]">{localized(services.find(s=>s.slug===service)?.lead||services[0].lead,lang)}</p><div className="mt-4 border-t border-[#dfbf59]/15 pt-4"><p className="text-[12px] leading-[1.8] text-[#B9C5DF]">{localized(countryOptions.find(c=>c.value===country)?.label||countryOptions[0].label,lang)} · {localized(roleOptions.find(r=>r.value===applicantRole)?.label||roleOptions[0].label,lang)}</p></div><Link href={withLang("/hizmetler/"+service,lang)} className="mt-4 inline-flex min-h-9 items-center gap-2 text-[13px] font-semibold text-[#dfbf59]">{u.learn}<ArrowRight className="h-4 w-4"/></Link></aside>
   </div>
 </PageFrame>;
}
