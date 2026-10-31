"use client";

import Link from "next/link";
import { PageFrame } from "@/components/avofis/PageFrame";
import { usePortalLanguage } from "@/hooks/usePortalLanguage";
import { journeys } from "@/lib/journeys";
import { officialSources } from "@/lib/journey-sources";

const text={
 tr:{eyebrow:"İŞLEMİNİZİ BULUN",title:"Hangi işlem için desteğe ihtiyacınız var?",intro:"Hizmet adı bilmeniz gerekmez. Yapmak istediğiniz işlemi seçin; gerekli olabilecek hazırlıkları, yetkili kurumu ve sonraki adımı görün.",need:"İşlemin kapsamı",ready:"Başvuru öncesinde",who:"Kim yürütür?",action:"Bu işlemi seç",source:"İlgili resmî kaynak",notice:"Bunlar kesin belge listesi veya hizmet teklifi değildir. Gerekli belgeler ilgili kurumun güncel kurallarına ve somut başvuruya göre belirlenir."},
 nl:{eyebrow:"KIES UW PROCEDURE",title:"Waarmee kunnen we u helpen?",intro:"U hoeft de naam van de dienst niet te kennen. Kies uw situatie en bekijk de vereisten, bevoegde instantie en vervolgstappen.",need:"De aanvraag",ready:"Voor de aanvraag",who:"Wie voert het uit?",action:"Kies deze procedure",source:"Officiële informatie",notice:"Dit is geen definitieve documentenlijst of offerte. De eisen volgen de ontvangende instantie en de concrete procedure."},
 en:{eyebrow:"FIND YOUR PROCEDURE",title:"What do you need to arrange?",intro:"You do not need to know a service category. Choose your situation to see possible requirements, responsible authorities and next steps.",need:"What is involved",ready:"Before applying",who:"Who performs the work?",action:"Select this procedure",source:"Official guidance",notice:"These are not definitive document checklists or offers. Actual requirements depend on the competent authority and individual case."}
};
export default function JourneysPage(){
 const lang=usePortalLanguage(),t=text[lang];
 return <PageFrame lang={lang} wide eyebrow={t.eyebrow} title={t.title} description={t.intro}>
   <div className="grid gap-4 lg:grid-cols-2">
    {journeys.map((j,i)=><article key={j.id} id={j.id} className="avofis-card flex min-w-0 flex-col rounded-[18px] border p-5 sm:p-7">
       <div className="text-[12px] font-semibold tracking-wide text-[#dfbf59]">{String(i+1).padStart(2,"0")}</div>
       <h2 className="mt-3 text-[19px] font-semibold leading-snug">{j.title[lang]}</h2>
       <p className="mt-3 text-[14px] leading-7 text-[#B9C5DF]">{j.audience[lang]}</p>
       <dl className="mt-5 space-y-3 border-t border-[#dfbf59]/15 pt-4 text-[14px] leading-7">
         <div><dt className="font-semibold text-[#E7D08A]">{t.need}</dt><dd className="text-[#B9C5DF]">{j.need[lang]}</dd></div>
         <div><dt className="font-semibold text-[#E7D08A]">{t.ready}</dt><dd className="text-[#B9C5DF]">{j.preparation[lang]}</dd></div>
         <div><dt className="font-semibold text-[#E7D08A]">{t.who}</dt><dd className="text-[#B9C5DF]">{j.responsibility[lang]}</dd></div>
       </dl>
       <div className="mt-5 border-t border-[#dfbf59]/15 pt-4"><p className="text-[12px] font-semibold text-[#B9C5DF]">{t.source}</p>{(officialSources[j.id]||[]).map(s=><a key={s.url} className="mt-2 inline-flex min-h-11 items-center text-[13px] leading-6 text-[#dfbf59] underline underline-offset-4" href={s.url} target="_blank" rel="noopener noreferrer">{s.name[lang]}</a>)}</div>
       <Link className="avofis-outline avofis-btn mt-6 self-start" href={"/basvuru?lang="+lang+"&islem="+encodeURIComponent(j.id)}>{t.action}</Link>
     </article>)}
   </div>
   <p className="mt-7 max-w-4xl text-[13px] leading-6 text-[#B9C5DF]">{t.notice}</p>
 </PageFrame>;
}
