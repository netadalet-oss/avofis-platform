"use client";

import Link from "next/link";
import { ArrowUpRight, Building2, FileText, GraduationCap, Landmark, Languages, UserRoundCheck, type LucideIcon } from "lucide-react";
import { PageFrame } from "@/components/avofis/PageFrame";
import { copy,serviceCodes,type ServiceCode } from "@/lib/avofis-content";
import { usePortalLanguage } from "@/hooks/usePortalLanguage";
import { journeys } from "@/lib/journeys";

const icons:Record<ServiceCode,LucideIcon>={documents:FileText,translation:Languages,administration:Landmark,diplomas:GraduationCap,business:Building2,referral:UserRoundCheck};
const ui={
  tr:{eyebrow:"HİZMETLER",title:"Hizmetler ve işlem kapsamı",intro:"Her hizmet için gerekli belgeleri, yetkili işlemi yürütecek kişiyi, başvuru şeklini ve ücretlendirme yöntemini inceleyin.",more:"Hizmet ayrıntıları",disclaimer:"Avukatlık, noterlik, yeminli tercüme ve diğer yetki gerektiren işlemler ilgili bağımsız, yetkili meslek mensuplarınca yapılır."},
  nl:{eyebrow:"DIENSTEN",title:"Diensten en werkzaamheden",intro:"Lees per dienst welke documenten nodig kunnen zijn, wie de werkzaamheden uitvoert, hoe u aanvraagt en hoe de kosten worden vastgesteld.",more:"Dienstinformatie",disclaimer:"Advocatuur, notariaat, beëdigde vertalingen en andere voorbehouden werkzaamheden blijven bij onafhankelijke bevoegde beroepsbeoefenaren."},
  en:{eyebrow:"SERVICES",title:"Services and scope",intro:"For each service, review potential documents, responsible professionals, the application process and how fees are determined.",more:"Service details",disclaimer:"Legal representation, notarial work, sworn translation and other reserved services are handled by the relevant independent authorised professionals."}
};
export default function ServicesPage(){
  const lang=usePortalLanguage(),t=ui[lang],services=copy[lang].serviceList;
  return <PageFrame lang={lang} wide eyebrow={t.eyebrow} title={t.title} description={t.intro}>
    <section className="mb-8 border-b border-[#dfbf59]/20 pb-7"><h2 className="text-[18px] font-semibold">{lang==="tr"?"Doğrudan yapmak istediğiniz işlemi seçin":lang==="nl"?"Kies uw concrete procedure":"Choose your specific procedure"}</h2><p className="mt-2 text-[14px] leading-7 text-[#B9C5DF]">{lang==="tr"?"Hizmet kategorilerini bilmiyorsanız belgeyi nerede kullanacağınızı ve hangi işlemi yaptıracağınızı seçebilirsiniz.":lang==="nl"?"Selecteer op basis van uw situatie, zonder een dienstcategorie te hoeven kennen.":"Find the appropriate steps based on your situation without choosing a service category."}</p><Link href={"/islemler?lang="+lang} className="avofis-outline avofis-btn mt-4">{lang==="tr"?"İşlem türlerini göster":lang==="nl"?"Bekijk procedures":"View procedures"}</Link></section>
    <Link href={"/katalog?lang="+lang} className="avofis-cta avofis-btn mb-6 inline-flex">17 hizmetlik geniş Avrupa kataloğu · 6 dil</Link>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {serviceCodes.map(code=>{
        const service=services.find(s=>s.id===code);if(!service)return null;
        const Icon=icons[code];
        return <article key={code} className="avofis-card flex min-w-0 flex-col rounded-[18px] border p-5 sm:p-6">
          <span className="avofis-icon-tile"><Icon className="h-5 w-5" aria-hidden="true"/></span>
          <h2 className="mt-4 text-[17px] font-semibold leading-snug">{service.title}</h2>
          <p className="mt-3 flex-1 text-[14px] leading-7 text-[#B9C5DF]">{service.description}</p>
          <Link href={"/hizmetler/"+code+"?lang="+lang} className="mt-4 inline-flex min-h-11 items-center gap-2 border-t border-[#dfbf59]/15 pt-3 text-[14px] font-semibold text-[#dfbf59]">{t.more}<ArrowUpRight className="h-4 w-4" aria-hidden="true"/></Link>
        </article>;
      })}
    </div>
    <p className="mt-7 border-l-2 border-[#dfbf59] pl-4 text-[14px] leading-7 text-[#B9C5DF]">{t.disclaimer}</p>
  </PageFrame>;
}
