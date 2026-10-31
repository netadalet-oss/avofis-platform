"use client";

import Link from "next/link";
import { PageFrame } from "@/components/avofis/PageFrame";
import { usePortalLanguage } from "@/hooks/usePortalLanguage";

const content={
 tr:{eyebrow:"İLETİŞİM",title:"AVOfis ile iletişim",intro:"Belge, tercüme veya idarî işlem ihtiyacınızı iletmek için kullanılabilecek kanallar burada gösterilir.",action:"Ön başvuru sayfası",account:"Müşteri girişi",warning:"Şu anda doğrulanmış bir genel iletişim adresi yayımlanmamıştır. Çevrim içi ön başvuru da henüz etkin değildir. Lütfen bu aşamada belge veya kişisel veri göndermeyin.",follow:"Müşteri hesabınızda açık bir dosya varsa mesajlarınızı dosyanız üzerinden iletebilirsiniz."},
 nl:{eyebrow:"CONTACT",title:"Contact met AVOfis",intro:"Hier vindt u de beschikbare kanalen voor vragen over documenten, vertalingen en administratieve procedures.",action:"Aanvraagpagina",account:"Klantlogin",warning:"Er is momenteel geen geverifieerd algemeen contactadres gepubliceerd. Ook het online aanvraagformulier is nog niet actief. Stuur nu geen documenten of persoonsgegevens.",follow:"Heeft u al een actief klantdossier, dan kunt u daarin berichten versturen."},
 en:{eyebrow:"CONTACT",title:"Contact AVOfis",intro:"Available channels for enquiries about documents, translations and administrative procedures will be listed here.",action:"Enquiry page",account:"Client login",warning:"A verified public contact address has not yet been published. Online enquiries are not currently enabled. Please do not send documents or personal data at this stage.",follow:"If you already have an active client case, you can send messages through that case."}
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
