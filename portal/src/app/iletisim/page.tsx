"use client";

import Link from "next/link";
import { PageFrame } from "@/components/avofis/PageFrame";
import { usePortalLanguage } from "@/hooks/usePortalLanguage";

const content={
 tr:{eyebrow:"İLETİŞİM",title:"AVOfis ile iletişim",intro:"AVOfis iletişim ve dosya içi mesajlaşma kanalları henüz açılmadı; doğrulanmış iletişim seçenekleri faaliyete geçmeden önce burada açıklanacaktır.",action:"Ön başvuru (kapalı)",account:"Müşteri girişi (kapalı)",warning:"Şu anda doğrulanmış bir genel iletişim adresi yayımlanmamıştır. Çevrim içi ön başvuru da henüz etkin değildir. Lütfen bu aşamada belge veya kişisel veri göndermeyin.",follow:"Müşteri hesabı ve dosya içi mesajlaşma henüz etkin değildir. Bu sayfadan talep, belge veya mesaj gönderilemez."},
 nl:{eyebrow:"CONTACT",title:"Contact met AVOfis",intro:"Contactkanalen en berichten binnen klantdossiers zijn nog niet beschikbaar. Geverifieerde contactmogelijkheden worden vóór de start vermeld.",action:"Aanvraag (gesloten)",account:"Klantlogin (gesloten)",warning:"Er is momenteel geen geverifieerd algemeen contactadres gepubliceerd. Ook het online aanvraagformulier is nog niet actief. Stuur nu geen documenten of persoonsgegevens.",follow:"Klantaccounts en dossierberichten zijn nog niet actief. Via deze pagina kunt u geen verzoeken, documenten of berichten indienen."},
 en:{eyebrow:"CONTACT",title:"Contact AVOfis",intro:"Public contact channels and client-case messaging are not yet available. Verified contact options will be published before launch.",action:"Enquiries (closed)",account:"Client login (closed)",warning:"A verified public contact address has not yet been published. Online enquiries are not currently enabled. Please do not send documents or personal data at this stage.",follow:"Client accounts and case messaging are not yet active. No enquiries, documents or messages can be submitted through this page."}
};
export default function ContactPage(){
 const lang=usePortalLanguage(),t=content[lang];
 return <PageFrame lang={lang} eyebrow={t.eyebrow} title={t.title} description={t.intro}>
   <section className="avofis-card rounded-[18px] border p-6">
     <h2 className="text-[17px] font-semibold">{t.warning}</h2>
     <p className="mt-4 text-[14px] leading-7 text-[#B9C5DF]">{t.follow}</p>
     <div className="mt-6 flex flex-wrap gap-3">
       <Link href={"/basvuru?lang="+lang} className="avofis-outline avofis-btn">{t.action}</Link>
       <Link href={"/auth/login?lang="+lang} className="avofis-outline avofis-btn">{t.account}</Link>
     </div>
   </section>
 </PageFrame>;
}
