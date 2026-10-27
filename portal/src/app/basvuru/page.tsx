"use client";

import { useEffect,useRef,useState,type FormEvent } from "react";
import Link from "next/link";
import Script from "next/script";
import { PageFrame } from "@/components/avofis/PageFrame";
import { usePortalLanguage } from "@/hooks/usePortalLanguage";
import { getJourney, journeys, validateJourneyDetails } from "@/lib/journeys";

declare global {
 interface Window {turnstile?:{render:(el:HTMLElement,options:{sitekey:string;callback:(token:string)=>void;"expired-callback":()=>void})=>string;reset:(id?:string)=>void};}
}
const enabled=process.env.NEXT_PUBLIC_AVOFIS_INTAKE_ENABLED==="true";
const sitekey=process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY||"";
const ui={
 tr:{eyebrow:"ÖN BAŞVURU",title:"İşleminize göre ön başvuru",intro:"Önce ne yapmak istediğinizi seçin. Farklı belge ve başvurular için farklı hazırlık adımları gösterilir. İlk aşamada kişisel belge yüklenmez.",journey:"Yapmak istediğiniz işlem",need:"Neden gerekli olabilir?",preparation:"Başvuru öncesi hazırlık",responsibility:"İşlemi kim yürütür?",questions:"İşleminizle ilgili bilgiler",choose:"Seçiniz",closed:"Çevrim içi başvuru şu anda kapalı",closedDesc:"Gerekli hukukî, veri koruma ve işletme koşulları doğrulanmadan ad, e-posta, belge veya ödeme alınmaz. Aşağıdaki işlem bilgilerini inceleyebilirsiniz.",required:"Başvuru sırasında işlemi değerlendirebilmek için şu bilgiler sorulacaktır:",name:"Ad soyad",email:"E-posta adresi",country:"İlgili ülke",summary:"Kısa açıklama (500 karakteri geçmeyin)",summaryHelp:"Kimlik numarası, DigiD parolası, sağlık, iltica veya mahkeme belgelerinin içeriğini yazmayın.",privacy:"Gizlilik bilgilendirmesi",consent:"Bilgilendirmeyi okudum ve talebimin incelenmesi için bu sınırlı bilgilerin işlenmesine ilişkin açıklamayı anladım.",send:"Ön başvuruyu gönder",sending:"Gönderiliyor…",verification:"Güvenlik kontrolünü tamamlayın.",failed:"Başvuru şu anda gönderilemedi. Lütfen daha sonra tekrar deneyin.",success:"Ön başvuru alındı",successInfo:"Bu kayıt bir hizmet sözleşmesi değildir. Başvuru referansınızı saklayın.",reference:"Başvuru referansı",noFiles:"Bu aşamada belge yüklenmez ve ücret alınmaz.",services:"Bütün işlemleri incele"},
 nl:{eyebrow:"AANVRAAG",title:"Aanvraag op basis van uw procedure",intro:"Kies eerst wat u wilt regelen. Voor verschillende procedures gelden verschillende voorbereidende vragen. U uploadt hier geen documenten.",journey:"Gewenste procedure",need:"Wat is vereist?",preparation:"Voorbereiding",responsibility:"Wie voert het uit?",questions:"Informatie over uw procedure",choose:"Kies een optie",closed:"Online aanvragen zijn momenteel gesloten",closedDesc:"Tot de wettelijke, privacy- en bedrijfsvoorwaarden zijn bevestigd, worden geen namen, e-mails, documenten of betalingen aangenomen. U kunt de procedure-informatie wel bekijken.",required:"Voor de beoordeling worden deze gegevens gevraagd:",name:"Volledige naam",email:"E-mailadres",country:"Betrokken land",summary:"Korte toelichting (maximaal 500 tekens)",summaryHelp:"Voer geen identificatienummers, DigiD-wachtwoorden, medische, asiel- of processtukken in.",privacy:"Privacyinformatie",consent:"Ik heb de informatie gelezen en begrijp de verwerking van deze beperkte gegevens voor de beoordeling van mijn verzoek.",send:"Aanvraag versturen",sending:"Versturen…",verification:"Voltooi de beveiligingscontrole.",failed:"Uw aanvraag kon niet worden verstuurd. Probeer het later opnieuw.",success:"Aanvraag ontvangen",successInfo:"Dit vormt geen dienstverleningsovereenkomst. Bewaar uw referentie.",reference:"Aanvraagreferentie",noFiles:"Geen documenten of betalingen in deze fase.",services:"Bekijk alle procedures"},
 en:{eyebrow:"ENQUIRY",title:"Enquiry for your specific procedure",intro:"First select what you need to arrange. The questions differ by procedure. No documents are uploaded at this stage.",journey:"What do you want to arrange?",need:"What may be involved?",preparation:"Before applying",responsibility:"Who carries out the work?",questions:"Details for this procedure",choose:"Choose an option",closed:"Online enquiries are currently closed",closedDesc:"Names, emails, documents and payments are not collected until legal, data-protection and business requirements have been verified. You can still review the procedure information.",required:"To assess the request, these details would be requested:",name:"Full name",email:"Email address",country:"Relevant country",summary:"Brief description (up to 500 characters)",summaryHelp:"Do not enter identity numbers, DigiD passwords, health records, asylum or litigation files.",privacy:"Privacy information",consent:"I have read the information and understand the processing of these limited details to assess my enquiry.",send:"Send enquiry",sending:"Sending…",verification:"Complete the security check.",failed:"Your enquiry could not be sent. Please try again later.",success:"Enquiry received",successInfo:"This does not establish a service agreement. Keep your reference.",reference:"Enquiry reference",noFiles:"No documents or payments at this stage.",services:"See all procedures"}
};
export default function IntakePage(){
 const lang=usePortalLanguage(),t=ui[lang];
 const [journeyId,setJourneyId]=useState("tr-to-nl");
 const [details,setDetails]=useState<Record<string,string>>({});
 const [name,setName]=useState(""),[email,setEmail]=useState(""),[country,setCountry]=useState("Netherlands");
 const [summary,setSummary]=useState(""),[consent,setConsent]=useState(false),[token,setToken]=useState("");
 const [pending,setPending]=useState(false),[error,setError]=useState(""),[reference,setReference]=useState("");
 const widgetRef=useRef<HTMLDivElement>(null),rendered=useRef(false);
 const chosen=getJourney(journeyId)||journeys[0];
 const ready=enabled&&!!sitekey;
 useEffect(()=>{
   const fromUrl=new URLSearchParams(window.location.search).get("islem")||"";
   if(getJourney(fromUrl))setJourneyId(fromUrl);
 },[]);
 function changeJourney(next:string){
   if(!getJourney(next))return;
   setJourneyId(next);setDetails({});setReference("");setError("");
 }
 function initTurnstile(){
   if(!ready||!widgetRef.current||!window.turnstile||rendered.current)return;
   rendered.current=true;
   window.turnstile.render(widgetRef.current,{sitekey,callback:setToken,"expired-callback":()=>setToken("")});
 }
 async function submit(e:FormEvent<HTMLFormElement>){
   e.preventDefault();
   if(!ready||!validateJourneyDetails(chosen.id,details)||!consent||!token){setError(t.verification);return;}
   setPending(true);setError("");
   try{
     const response=await fetch("/api/intake",{
       method:"POST",headers:{"Content-Type":"application/json"},
       body:JSON.stringify({name,email,country,message:summary,lang,service:chosen.service,journey:chosen.id,details,privacyAccepted:true,turnstileToken:token})
     });
     const result=await response.json();
     if(!response.ok||typeof result.reference!=="string")throw new Error("Submission rejected");
     setReference(result.reference);
   }catch{
     setError(t.failed);setToken("");window.turnstile?.reset();
   }finally{setPending(false);}
 }
 return <PageFrame lang={lang} eyebrow={t.eyebrow} title={t.title} description={t.intro}>
   <div className="avofis-card rounded-[18px] border p-5 sm:p-7">
     <label className="avofis-form-label block">{t.journey}
       <select className="avofis-field" value={journeyId} onChange={e=>changeJourney(e.target.value)}>
         {journeys.map(j=><option key={j.id} value={j.id}>{j.title[lang]}</option>)}
       </select>
     </label>
     <div className="mt-6 grid gap-4 lg:grid-cols-2">
       <div className="rounded-xl border border-[#dfbf59]/15 bg-[#071738] p-4">
         <h2 className="text-[15px] font-semibold">{t.need}</h2><p className="mt-2 text-[14px] leading-7 text-[#B9C5DF]">{chosen.need[lang]}</p>
         <h3 className="mt-5 text-[15px] font-semibold">{t.preparation}</h3><p className="mt-2 text-[14px] leading-7 text-[#B9C5DF]">{chosen.preparation[lang]}</p>
       </div>
       <div className="rounded-xl border border-[#dfbf59]/15 bg-[#071738] p-4">
         <h2 className="text-[15px] font-semibold">{t.responsibility}</h2><p className="mt-2 text-[14px] leading-7 text-[#B9C5DF]">{chosen.responsibility[lang]}</p>
         <h3 className="mt-5 text-[15px] font-semibold">{t.questions}</h3><p className="mt-2 text-[14px] leading-7 text-[#B9C5DF]">{chosen.next[lang]}</p>
       </div>
     </div>
     {!ready?<div className="mt-7 rounded-xl border border-[#dfbf59]/25 bg-[#04102C] p-5" role="status">
       <h2 className="text-[17px] font-semibold">{t.closed}</h2>
       <p className="mt-2 text-[14px] leading-7 text-[#B9C5DF]">{t.closedDesc}</p>
       <p className="mt-4 text-[13px] font-semibold">{t.required}</p>
       <ul className="mt-3 list-inside list-disc space-y-2 text-[14px] text-[#B9C5DF]">{chosen.fields.map(f=><li key={f.key}>{f.label[lang]}</li>)}</ul>
       <Link href={"/islemler?lang="+lang} className="avofis-outline avofis-btn mt-5">{t.services}</Link>
     </div>:reference?<div className="mt-7 rounded-xl border border-[#dfbf59]/25 bg-[#04102C] p-5" role="status">
       <h2 className="text-[18px] font-semibold">{t.success}</h2><p className="mt-2 text-[14px] leading-7 text-[#B9C5DF]">{t.successInfo}</p>
       <p className="mt-3 text-[15px] font-semibold text-[#dfbf59]">{t.reference}: {reference}</p>
     </div>:<form onSubmit={submit} className="mt-7 space-y-5">
       <fieldset className="grid gap-4 rounded-xl border border-[#dfbf59]/20 p-4 sm:grid-cols-2">
         <legend className="px-2 text-[16px] font-semibold">{t.questions}</legend>
         {chosen.fields.map(field=><label key={field.key} className="avofis-form-label block">
           {field.label[lang]}<select required className="avofis-field" value={details[field.key]||""} onChange={e=>setDetails(old=>({...old,[field.key]:e.target.value}))}>
             <option value="">{t.choose}</option>
             {field.options.map(option=><option key={option.value} value={option.value}>{option.label[lang]}</option>)}
           </select>
         </label>)}
       </fieldset>
       <fieldset className="grid gap-4 sm:grid-cols-2">
         <legend className="mb-4 text-[16px] font-semibold">{t.name} / {t.email}</legend>
         <label className="avofis-form-label block">{t.name}<input className="avofis-field" autoComplete="name" required minLength={2} maxLength={100} value={name} onChange={e=>setName(e.target.value)}/></label>
         <label className="avofis-form-label block">{t.email}<input className="avofis-field" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)}/></label>
         <label className="avofis-form-label block">{t.country}<select required className="avofis-field" value={country} onChange={e=>setCountry(e.target.value)}>
           <option value="Netherlands">Nederland</option><option value="Türkiye">Türkiye</option><option value="Germany">Deutschland</option><option value="Other">{lang==="tr"?"Diğer":lang==="nl"?"Overig":"Other"}</option>
         </select></label>
       </fieldset>
       <label className="avofis-form-label block">{t.summary}<textarea rows={3} className="avofis-field" maxLength={500} value={summary} onChange={e=>setSummary(e.target.value)}/></label>
       <p className="text-[13px] leading-6 text-[#B9C5DF]">{t.summaryHelp}</p>
       <p className="text-[13px] text-[#dfbf59]">{t.noFiles}</p>
       <label className="flex items-start gap-3 text-[13px] leading-7 text-[#E2E9F6]">
         <input type="checkbox" className="mt-1 h-4 w-4 shrink-0" required checked={consent} onChange={e=>setConsent(e.target.checked)}/>
         <span><Link href={"/gizlilik?lang="+lang} className="font-semibold text-[#dfbf59] underline">{t.privacy}</Link>: {t.consent}</span>
       </label>
       <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={initTurnstile}/>
       <div ref={widgetRef} aria-label={t.verification}/>
       {error&&<p role="alert" className="rounded-lg border border-red-400/30 p-3 text-[13px] text-red-200">{error}</p>}
       <button className="avofis-cta avofis-btn w-full disabled:opacity-50" disabled={pending||!token||!consent||!validateJourneyDetails(chosen.id,details)}>{pending?t.sending:t.send}</button>
     </form>}
   </div>
 </PageFrame>;
}
