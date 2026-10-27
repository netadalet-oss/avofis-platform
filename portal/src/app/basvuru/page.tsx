"use client";
import { useRef,useState,type FormEvent } from "react";
import Link from "next/link";
import Script from "next/script";
import { CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";
import { PageFrame } from "@/components/avofis/PageFrame";
import { usePortalLanguage } from "@/hooks/usePortalLanguage";
import type { Language } from "@/lib/avofis-content";

declare global {
  interface Window {turnstile?:{render:(el:HTMLElement,options:{sitekey:string;callback:(token:string)=>void;"expired-callback":()=>void})=>string;reset:(id?:string)=>void};}
}
const enabled=process.env.NEXT_PUBLIC_AVOFIS_INTAKE_ENABLED==="true";
const sitekey=process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY||"";
const locales={
 tr:{eyebrow:"ÖN BAŞVURU",title:"Başvuru ve iletişim",intro:"Hizmetler açıldığında ihtiyaç duyduğunuz işlemi kısaca bildirebilirsiniz. Bu formdan kimlik, sağlık, iltica veya dava belgesi göndermeyin.",closed:"Başvurular henüz açık değil",closedDesc:"Kuruluş, sözleşme ve veri koruma hazırlıkları tamamlanana kadar bu form üzerinden kişisel bilgi alınmıyor.",fullName:"Ad soyad",email:"E-posta",country:"İlgili ülke",service:"Hizmet konusu",message:"Kısa açıklama (en fazla 500 karakter)",consent:"Gizlilik bilgilendirmesini okudum; talebimin incelenmesi ve bana yanıt verilmesi için bilgilerimin işlenmesine ilişkin açıklamayı anladım.",privacy:"Gizlilik",button:"Başvuruyu gönder",sending:"Gönderiliyor…",success:"Başvuru alındı",successDetail:"Referans numaranızı saklayın. Bu kayıt bir hizmet sözleşmesi oluşturmaz.",error:"Başvuru şu anda gönderilemedi. Daha sonra tekrar deneyin.",captcha:"Güvenlik doğrulamasını tamamlayın.",choose:"Seçiniz",ref:"Başvuru numarası",noFiles:"Bu aşamada belge yüklenmez."},
 nl:{eyebrow:"CONTACTAANVRAAG",title:"Aanvraag en contact",intro:"Zodra diensten openen, kunt u uw verzoek kort toelichten. Stuur geen identiteitsbewijzen, medische informatie, asieldossiers of processtukken.",closed:"Aanvragen zijn nog niet geopend",closedDesc:"Tot registratie, contracten en privacymaatregelen zijn afgerond, verzamelen wij geen persoonsgegevens via dit formulier.",fullName:"Naam",email:"E-mail",country:"Betrokken land",service:"Soort dienst",message:"Korte toelichting (max. 500 tekens)",consent:"Ik heb de privacyinformatie gelezen en begrijp de verwerking van mijn gegevens om mijn verzoek te beoordelen en te beantwoorden.",privacy:"Privacy",button:"Aanvraag versturen",sending:"Verzenden…",success:"Aanvraag ontvangen",successDetail:"Bewaar het referentienummer. Hiermee ontstaat geen dienstverleningsovereenkomst.",error:"Uw aanvraag kon niet worden verzonden. Probeer het later opnieuw.",captcha:"Voltooi de beveiligingscontrole.",choose:"Kies een dienst",ref:"Referentienummer",noFiles:"In dit stadium worden geen documenten geüpload."},
 en:{eyebrow:"ENQUIRIES",title:"Enquiries and contact",intro:"When services open, you can briefly describe your request. Do not send identity documents, health information, asylum files or litigation records.",closed:"Enquiries are not open yet",closedDesc:"No personal data is collected through this form until registration, agreements and privacy arrangements are complete.",fullName:"Full name",email:"Email address",country:"Relevant country",service:"Service type",message:"Brief description (max. 500 characters)",consent:"I have read the privacy information and understand how my details would be processed to review and respond to this enquiry.",privacy:"Privacy",button:"Send enquiry",sending:"Sending…",success:"Enquiry received",successDetail:"Keep the reference number. This does not create a services contract.",error:"Your enquiry could not be sent. Please try again later.",captcha:"Complete the security check.",choose:"Select a service",ref:"Reference",noFiles:"No document uploads are accepted at this stage."}
};
const categories=[
 {key:"documents",tr:"Resmî belgeler ve apostil",nl:"Officiële documenten en apostille",en:"Official documents and apostilles"},
 {key:"translation",tr:"Tercüme ve tasdik koordinasyonu",nl:"Vertaling en legalisatie",en:"Translation and legalisation"},
 {key:"administration",tr:"Hollanda idarî başvuruları",nl:"Nederlandse administratie",en:"Dutch administrative applications"},
 {key:"diplomas",tr:"Diploma değerlendirme",nl:"Diplomawaardering",en:"Diploma evaluation"},
 {key:"business",tr:"Şirket kuruluş hazırlığı",nl:"Voorbereiding bedrijfsoprichting",en:"Business formation preparation"},
 {key:"expert",tr:"Yetkili uzmana yönlendirme",nl:"Doorverwijzing naar specialisten",en:"Referral to authorised specialists"},
 {key:"other",tr:"Diğer",nl:"Overig",en:"Other"}
];
export default function IntakePage(){
 const lang=usePortalLanguage(),t=locales[lang];
 const [name,setName]=useState(""),[email,setEmail]=useState(""),[country,setCountry]=useState("Netherlands");
 const [service,setService]=useState(""),[message,setMessage]=useState(""),[consent,setConsent]=useState(false);
 const [token,setToken]=useState(""),[pending,setPending]=useState(false),[error,setError]=useState(""),[reference,setReference]=useState("");
 const widgetRef=useRef<HTMLDivElement>(null),rendered=useRef(false);
 function initTurnstile(){
   if(!enabled||!sitekey||!widgetRef.current||!window.turnstile||rendered.current)return;
   rendered.current=true;
   window.turnstile.render(widgetRef.current,{sitekey,callback:setToken,"expired-callback":()=>setToken("")});
 }
 async function submit(e:FormEvent<HTMLFormElement>){
   e.preventDefault();if(!enabled||!sitekey||!service||!consent||!token){setError(t.captcha);return;}
   setError("");setPending(true);
   try{
     const res=await fetch("/api/intake",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email,country,service,message,lang,privacyAccepted:true,turnstileToken:token})});
     const data=await res.json();
     if(!res.ok||typeof data.reference!=="string")throw new Error("intake failed");
     setReference(data.reference);
   }catch{setError(t.error);setToken("");window.turnstile?.reset();}
   finally{setPending(false);}
 }
 return <PageFrame lang={lang} eyebrow={t.eyebrow} title={t.title} description={t.intro}>
   {enabled&&sitekey&&<Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={initTurnstile}/>}
   <div className="avofis-card max-w-3xl rounded-[18px] border p-5 sm:p-7">
     {!enabled||!sitekey?<div role="status" className="flex items-start gap-3.5">
       <span className="avofis-icon-tile shrink-0"><LockKeyhole className="h-5 w-5" aria-hidden="true"/></span>
       <div><h2 className="text-[16px] font-semibold text-[#F2F5FF]">{t.closed}</h2><p className="mt-2 text-[13px] leading-[1.8] text-[#B9C5DF]">{t.closedDesc}</p></div>
     </div>:reference?<div role="status" className="flex items-start gap-3.5">
       <span className="avofis-icon-tile shrink-0"><CheckCircle2 className="h-5 w-5" aria-hidden="true"/></span>
       <div><h2 className="text-[16px] font-semibold text-[#F2F5FF]">{t.success}</h2><p className="mt-2 text-[13px] leading-[1.8] text-[#B9C5DF]">{t.successDetail}</p><p className="mt-3 font-mono text-[13px] text-[#dfbf59]">{t.ref}: {reference}</p></div>
     </div>:<form onSubmit={submit} className="space-y-4">
       <div className="grid gap-4 sm:grid-cols-2">
         <label className="avofis-form-label">{t.fullName}<input className="avofis-field" autoComplete="name" required maxLength={100} value={name} onChange={e=>setName(e.target.value)}/></label>
         <label className="avofis-form-label">{t.email}<input className="avofis-field" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)}/></label>
         <label className="avofis-form-label">{t.country}<select className="avofis-field" value={country} onChange={e=>setCountry(e.target.value)}><option value="Netherlands">Nederland</option><option value="Türkiye">Türkiye</option><option value="Germany">Deutschland</option><option value="Other">Other</option></select></label>
         <label className="avofis-form-label">{t.service}<select className="avofis-field" required value={service} onChange={e=>setService(e.target.value)}><option value="">{t.choose}</option>{categories.map(s=><option key={s.key} value={s.key}>{s[lang]}</option>)}</select></label>
       </div>
       <label className="avofis-form-label block">{t.message}<textarea className="avofis-field" rows={3} maxLength={500} value={message} onChange={e=>setMessage(e.target.value)}/></label>
       <p className="flex items-center gap-2 text-[12px] text-[#B9C5DF]"><ShieldCheck className="h-4 w-4 shrink-0 text-[#dfbf59]" aria-hidden="true"/>{t.noFiles}</p>
       <label className="flex items-start gap-3 text-[13px] leading-[1.75] text-[#DCE3F1]"><input className="mt-1 h-4 w-4 shrink-0" type="checkbox" required checked={consent} onChange={e=>setConsent(e.target.checked)}/><span>{t.consent} <Link href={"/gizlilik?lang="+lang} className="font-semibold text-[#dfbf59] underline">{t.privacy}</Link></span></label>
       <div ref={widgetRef} aria-label="Security verification"/>
       {error&&<p role="alert" className="rounded-lg border border-red-400/25 bg-red-950/30 p-3 text-[13px] text-red-200">{error}</p>}
       <button disabled={pending||!token||!consent} className="avofis-cta avofis-btn w-full disabled:cursor-not-allowed disabled:opacity-50">{pending?t.sending:t.button}</button>
     </form>}
   </div>
 </PageFrame>;
}
