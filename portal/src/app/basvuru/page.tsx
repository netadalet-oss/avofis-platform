"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import Script from "next/script";
import { ArrowLeft, CheckCircle2, LockKeyhole, ShieldCheck } from "lucide-react";

declare global {
  interface Window { turnstile?: { render: (el: HTMLElement, opts: { sitekey: string; callback: (token: string) => void; "expired-callback": () => void }) => string; reset: (id?: string) => void }; }
}
type Language = "tr" | "nl" | "en";
const copy = {
  tr: { back:"Ana sayfa", eyebrow:"ÖN BAŞVURU", title:"İşleminizi anlamakla başlayalım.", lead:"Yalnızca temel iletişim bilgilerini paylaşın. Kimlik, sağlık bilgisi, iltica dosyası veya dava evrakı göndermeyin.", closed:"Ön başvurular henüz açık değil.", closedDesc:"Şirket ve veri koruma kontrolleri tamamlanana kadar bilgi toplanmıyor.", name:"Ad soyad", email:"E-posta", country:"İlgili ülke", service:"İşlem türü", message:"Kısa açıklama (en fazla 500 karakter)", consent:"Gizlilik bilgilendirmesini okudum. Verilerimin bu talebi değerlendirmek ve bana yanıt vermek amacıyla işlenmesini kabul ediyorum.", send:"Başvuruyu gönder", sending:"Gönderiliyor...", success:"Başvurunuz alındı.", successD:"Referans numaranızı saklayın; başvurunun alınması bir hizmet sözleşmesi oluşturmaz.", fail:"Başvuru gönderilemedi. Lütfen daha sonra yeniden deneyin.", ref:"Başvuru referansı", privacy:"Gizlilik açıklaması", noFiles:"Bu formdan dosya yüklenmez.", choose:"Seçiniz", bot:"Güvenlik doğrulaması zorunludur." },
  nl: { back:"Home", eyebrow:"CONTACTAANVRAAG", title:"Begin met een duidelijke vraag.", lead:"Deel alleen contactgegevens. Stuur geen identiteitsbewijzen, medische gegevens, asieldossiers of processtukken.", closed:"Het aanvraagformulier is nog niet open.", closedDesc:"Tot registratie en privacycontroles zijn afgerond, verzamelen wij geen gegevens.", name:"Naam", email:"E-mail", country:"Betrokken land", service:"Type verzoek", message:"Korte toelichting (maximaal 500 tekens)", consent:"Ik heb de privacyinformatie gelezen. Mijn gegevens mogen worden gebruikt om mijn verzoek te beoordelen en mij te antwoorden.", send:"Aanvraag verzenden", sending:"Verzenden...", success:"Uw aanvraag is ontvangen.", successD:"Bewaar uw referentienummer; dit vormt geen overeenkomst.", fail:"Verzenden niet gelukt. Probeer later opnieuw.", ref:"Referentienummer", privacy:"Privacyverklaring", noFiles:"Hier kunt u geen bestanden uploaden.", choose:"Kies", bot:"Beveiligingscontrole is verplicht." },
  en: { back:"Home", eyebrow:"CONTACT ENQUIRY", title:"Start with a clear request.", lead:"Share basic contact details only. Do not provide identity documents, medical information, asylum files or litigation records.", closed:"Enquiries are not open yet.", closedDesc:"We are not collecting personal information until registration and privacy checks are complete.", name:"Full name", email:"Email", country:"Relevant country", service:"Service category", message:"Short explanation (max 500 characters)", consent:"I have read the privacy information. My data may be processed to assess my enquiry and respond to me.", send:"Send enquiry", sending:"Sending...", success:"Your enquiry was received.", successD:"Keep your reference number. Submitting an enquiry is not a services contract.", fail:"Could not submit your enquiry. Please try later.", ref:"Reference", privacy:"Privacy information", noFiles:"Files cannot be uploaded through this form.", choose:"Select", bot:"Security verification is required." }
};
const services = ["documents","administration","diplomas","business","translation","expert","other"] as const;
const serviceNames: Record<string, Record<Language,string>> = {
 documents:{tr:"Belge / apostil",nl:"Document / apostille",en:"Documents / apostille"},
 administration:{tr:"Hollanda idarî işlemleri",nl:"Nederlandse administratie",en:"Dutch administration"},
 diplomas:{tr:"Diploma değerlendirme",nl:"Diplomawaardering",en:"Diploma evaluation"},
 business:{tr:"Şirket kuruluş hazırlığı",nl:"Ondernemingsvoorbereiding",en:"Business formation preparation"},
 translation:{tr:"Tercüme koordinasyonu",nl:"Vertaalcoördinatie",en:"Translation coordination"},
 expert:{tr:"Bağımsız uzman yönlendirmesi",nl:"Verwijzing naar specialist",en:"Independent expert referral"},
 other:{tr:"Diğer",nl:"Overig",en:"Other"}
};
const countries = ["Netherlands","Türkiye","Germany","Other"];
const enabled = process.env.NEXT_PUBLIC_AVOFIS_INTAKE_ENABLED === "true";
const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

export default function IntakePage() {
  const [lang,setLang] = useState<Language>("tr");
  useEffect(()=>{ const value=new URLSearchParams(window.location.search).get("lang"); if(value==="nl"||value==="en")setLang(value); },[]);
  const t = copy[lang];
  const [name,setName] = useState("");
  const [email,setEmail] = useState("");
  const [country,setCountry] = useState("Netherlands");
  const [service,setService] = useState<string>("");
  const [message,setMessage] = useState("");
  const [agreed,setAgreed] = useState(false);
  const [token,setToken] = useState("");
  const [submitting,setSubmitting] = useState(false);
  const [error,setError] = useState("");
  const [reference,setReference] = useState("");
  const captchaRef = useRef<HTMLDivElement>(null);
  const renderedRef = useRef(false);
  function initCaptcha() {
    if (enabled && sitekey && captchaRef.current && window.turnstile && !renderedRef.current) {
      renderedRef.current = true;
      window.turnstile.render(captchaRef.current,{sitekey,callback:setToken,"expired-callback":()=>setToken("")});
    }
  }
  async function submit(e:FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!agreed || !token || !service) {setError(t.bot);return;}
    setError("");setSubmitting(true);
    try {
      const response = await fetch("/api/intake",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,email,country,service,message,lang,turnstileToken:token,privacyAccepted:true})});
      const data = await response.json();
      if (!response.ok || typeof data.reference !== "string") throw new Error(t.fail);
      setReference(data.reference);
    } catch {setError(t.fail);setToken("");window.turnstile?.reset();}
    finally {setSubmitting(false);}
  }
  return <main className="avofis-theme min-h-screen text-[#F2F5FF]">
    {enabled && sitekey && <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit" strategy="afterInteractive" onLoad={initCaptcha}/>}
    <div className="mx-auto max-w-3xl px-5 pb-14 pt-9 sm:pt-12">
      <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-[#dfbf59]"><ArrowLeft className="h-4 w-4"/>{t.back}</Link>
      <div className="mt-7 rounded-[20px] border border-[#dfbf59]/25 avofis-card p-5 shadow-sm sm:p-6">
        <span className="text-xs font-semibold tracking-[.2em] text-[#dfbf59]">{t.eyebrow}</span>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-.05em] sm:text-4xl">{t.title}</h1>
        <p className="mt-5 text-sm leading-7 text-[#B9C5DF]">{t.lead}</p>
        {!enabled || !sitekey ? <div className="mt-7 rounded-2xl border border-[#dfbf59]/25 bg-[#071738] p-6" role="status"><LockKeyhole className="h-7 w-7 text-[#dfbf59]"/><h2 className="mt-4 text-lg font-semibold">{t.closed}</h2><p className="mt-2 text-sm leading-7 text-[#B9C5DF]">{t.closedDesc}</p></div>
        : reference ? <div className="mt-7 rounded-2xl bg-[#071738] p-5" role="status"><CheckCircle2 className="h-8 w-8 text-[#dfbf59]"/><h2 className="mt-4 text-lg font-semibold">{t.success}</h2><p className="mt-3 text-sm">{t.successD}</p><p className="mt-5 rounded-lg avofis-card p-3 font-mono text-sm">{t.ref}: {reference}</p></div>
        : <form onSubmit={submit} className="mt-7 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold">{t.name}<input autoComplete="name" required maxLength={100} value={name} onChange={e=>setName(e.target.value)} className="avofis-field mt-2 w-full rounded-xl border border-[#dfbf59]/25 avofis-card p-3.5 font-normal outline-none"/></label>
            <label className="block text-sm font-semibold">{t.email}<input autoComplete="email" type="email" required maxLength={254} value={email} onChange={e=>setEmail(e.target.value)} className="avofis-field mt-2 w-full rounded-xl border border-[#dfbf59]/25 avofis-card p-3.5 font-normal outline-none"/></label>
            <label className="block text-sm font-semibold">{t.country}<select value={country} onChange={e=>setCountry(e.target.value)} className="avofis-field mt-2 w-full rounded-xl border border-[#dfbf59]/25 avofis-card p-3.5 font-normal outline-none">{countries.map(c=><option key={c} value={c}>{c}</option>)}</select></label>
            <label className="block text-sm font-semibold">{t.service}<select required value={service} onChange={e=>setService(e.target.value)} className="avofis-field mt-2 w-full rounded-xl border border-[#dfbf59]/25 avofis-card p-3.5 font-normal outline-none"><option value="">{t.choose}</option>{services.map(c=><option key={c} value={c}>{serviceNames[c][lang]}</option>)}</select></label>
          </div>
          <label className="block text-sm font-semibold">{t.message}<textarea rows={4} maxLength={500} value={message} onChange={e=>setMessage(e.target.value)} className="avofis-field mt-2 w-full rounded-xl border border-[#dfbf59]/25 avofis-card p-3.5 font-normal outline-none"/></label>
          <p className="flex items-center gap-2 text-xs text-[#B9C5DF]"><ShieldCheck className="h-4 w-4"/>{t.noFiles}</p>
          <label className="flex cursor-pointer items-start gap-3 text-[13px] leading-6 text-[#DCE3F1]"><input type="checkbox" required checked={agreed} onChange={e=>setAgreed(e.target.checked)} className="mt-1 h-4 w-4 shrink-0"/><span>{t.consent} <Link className="font-semibold underline" href="/gizlilik">{t.privacy}</Link></span></label>
          <div ref={captchaRef} aria-label="Security verification"/>
          {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700" role="alert">{error}</p>}
          <button disabled={submitting || !token || !agreed} className="rounded-xl avofis-cta avofis-btn text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{submitting?t.sending:t.send}</button>
        </form>}
      </div>
    </div>
  </main>;
}
