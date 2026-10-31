"use client";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { PageFrame } from "@/components/avofis/PageFrame";
import { usePortalLanguage } from "@/hooks/usePortalLanguage";

const content={
  tr:{
    eyebrow:"GİZLİLİK",title:"Kişisel verilerin korunması",
    description:"AVOfis'in müşteri kabulü henüz açılmadı. Bu metin hazırlık aşamasındaki bilgilendirme taslağıdır; şirket bilgileri ve veri işleme koşulları kesinleştirilmeden nihai gizlilik bildirimi yerine kullanılamaz.",
    sections:[
      ["Veri sorumlusu ve iletişim","Şirketin tescilli unvanı, kayıt adresi ve veri koruma iletişim bilgileri faaliyete açılmadan önce bu sayfada yayımlanacaktır."],
      ["Başvuru sırasında alınacak bilgiler","Ön başvuru açıldığında ad, e-posta, ilgili ülke, seçilen işlem türü, o işleme özgü sınırlı seçenekler ve kısa açıklama istenmesi planlanmaktadır. İlk formda kimlik, sağlık, iltica veya mahkeme dosyaları talep edilmez."],
      ["Dosya belgeleri ve erişim","Hizmet sözleşmesi sonrasında gerekli belgelerin özel, erişim kontrollü müşteri alanında işlenmesi öngörülmektedir. Verilerin tutulma süreleri, sağlayıcılar ve silme prosedürü açılıştan önce belirlenecektir."],
      ["Haklar ve talepler","GDPR kapsamında erişim, düzeltme, silme ve diğer uygulanabilir hakların kullanılmasına ilişkin başvuru kanalı faaliyetten önce duyurulacaktır."]
    ],note:"Bu sayfadaki hazırlık bilgileri, GDPR Madde 13 kapsamında tamamlanmış bir aydınlatma metni değildir."
  },
  nl:{
    eyebrow:"PRIVACY",title:"Bescherming van persoonsgegevens",
    description:"AVOfis neemt nog geen klantdossiers aan. Dit is een concept voor de voorbereidingsfase, geen definitieve privacyverklaring. De bedrijfsgegevens en verwerkingsvoorwaarden moeten vóór de start worden vastgesteld.",
    sections:[
      ["Verwerkingsverantwoordelijke en contact","De geregistreerde bedrijfsnaam, vestigingsadres en contactgegevens voor privacyverzoeken worden vóór de start gepubliceerd."],
      ["Gegevens bij een eerste aanvraag","Zodra aanvragen open zijn, worden naar verwachting naam, e-mail, betrokken land, gekozen procedure en bijbehorende beperkte keuzevelden, plus een korte toelichting gevraagd. Identiteits-, medische, asiel- of procesdossiers horen niet in dit formulier."],
      ["Documenten en toegang","Na de opdrachtbevestiging kunnen noodzakelijke documenten worden verwerkt in een afgeschermd klantdossier. Bewaartermijnen, verwerkers en verwijderingsprocedures worden vóór ingebruikname bepaald."],
      ["Privacyrechten","Een bereikbaar kanaal voor inzage, correctie, verwijdering en andere toepasselijke AVG-rechten wordt vóór de start bekendgemaakt."]
    ],note:"Deze voorbereidingsinformatie is nog geen volledige informatieverstrekking volgens artikel 13 AVG."
  },
  en:{
    eyebrow:"PRIVACY",title:"Personal data protection",
    description:"AVOfis is not yet accepting client matters. This is a pre-launch draft, not a final privacy notice. The registered entity details and data-processing terms must be confirmed before services open.",
    sections:[
      ["Data controller and contact","The registered business name, address and contact details for privacy requests will be published before launch."],
      ["Initial enquiry information","Once enquiries are enabled, the proposed form is designed to ask for a name, email, country, selected procedure, limited procedure-specific choices and a short explanation. Identity, medical, asylum and litigation files should not be submitted."],
      ["Documents and access","Following a service agreement, necessary documents are intended to be processed within access-controlled client storage. Retention periods, processors and deletion procedures must be finalised before launch."],
      ["Individual rights","A channel for access, correction, erasure and other applicable GDPR rights will be published before launch."]
    ],note:"This pre-launch information is not yet a complete privacy notice under GDPR Article 13."
  }
};
export default function PrivacyPage(){
  const lang=usePortalLanguage(),t=content[lang];
  return <PageFrame lang={lang} eyebrow={t.eyebrow} title={t.title} description={t.description}>
    <div className="grid gap-3">
      {t.sections.map(([title,body],i)=><section key={title} className="avofis-card flex items-start gap-3.5 rounded-[18px] border p-5 sm:p-6">
        <span className="avofis-icon-tile shrink-0">{i===2?<LockKeyhole className="h-5 w-5" aria-hidden="true"/>:<ShieldCheck className="h-5 w-5" aria-hidden="true"/>}</span>
        <div className="min-w-0"><h2 className="text-[15px] font-semibold text-[#F2F5FF]">{title}</h2><p className="mt-2 text-[13px] leading-[1.8] text-[#B9C5DF]">{body}</p></div>
      </section>)}
    </div>
    <p className="mt-5 text-[12px] leading-[1.75] text-[#dfbf59]">{t.note}</p>
  </PageFrame>;
}
