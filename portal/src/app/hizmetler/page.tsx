"use client";
import Link from "next/link";
import { ArrowUpRight, Building2, FileText, GraduationCap, Landmark, Languages, UserRoundCheck, type LucideIcon } from "lucide-react";
import { PageFrame } from "@/components/avofis/PageFrame";
import { copy,serviceCodes,type ServiceCode } from "@/lib/avofis-content";
import { usePortalLanguage } from "@/hooks/usePortalLanguage";

const icons:Record<ServiceCode,LucideIcon>={documents:FileText,translation:Languages,administration:Landmark,diplomas:GraduationCap,business:Building2,referral:UserRoundCheck};
const text={
  tr:{eyebrow:"HİZMETLER",title:"Hizmet alanları ve kapsamları",description:"Her işlem için belgenin türü, başvuru kurumu, gereken uzmanlık ve hizmet sınırları ayrı değerlendirilir. Aşağıdaki hizmetler henüz faaliyete açılmamıştır.",noteTitle:"Hizmet yetkisi ve kapsam",note:"AVOfis, Hollanda'da bir avukatlık veya noterlik bürosu olarak faaliyet göstermez. Noterlik, yeminli tercüme, avukatlık ve diğer düzenlenmiş meslekî işlemler yalnızca ilgili yetkili profesyoneller tarafından yürütülür.",action:"Başvuru durumunu kontrol et"},
  nl:{eyebrow:"DIENSTEN",title:"Diensten en verantwoordelijkheden",description:"Per aanvraag worden documentvereisten, bevoegde instanties, specialistische inzet en grenzen van de opdracht vooraf vastgesteld. De dienstverlening is nog niet geopend.",noteTitle:"Bevoegdheid en afbakening",note:"AVOfis is geen Nederlands advocaten- of notariskantoor. Voorbehouden juridische, notariële en beëdigde vertaaldiensten worden uitsluitend door daartoe bevoegde professionals uitgevoerd.",action:"Beschikbaarheid bekijken"},
  en:{eyebrow:"SERVICES",title:"Services and scope",description:"Document requirements, responsible authorities, professional involvement and scope are assessed for each request. Services are not yet available to clients.",noteTitle:"Professional authorisation",note:"AVOfis is not a Dutch law firm or civil-law notary office. Reserved legal, notarial and sworn-translation services are delivered only by the relevant authorised professionals.",action:"Check availability"}
};
export default function ServicesPage(){
  const lang=usePortalLanguage(),t=text[lang],services=copy[lang].serviceList;
  return <PageFrame lang={lang} wide eyebrow={t.eyebrow} title={t.title} description={t.description}>
    <div className="grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {serviceCodes.map(code=>{
        const entry=services.find(s=>s.id===code);if(!entry)return null;
        const Icon=icons[code];
        return <article key={code} id={code} className="avofis-card flex h-full min-w-0 scroll-mt-24 flex-col rounded-[18px] border p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3"><span className="avofis-icon-tile"><Icon className="h-5 w-5" aria-hidden="true"/></span><span className="text-[11px] font-medium text-[#dfbf59]">{entry.category}</span></div>
          <h2 className="mt-4 text-[16px] font-semibold leading-snug text-[#F2F5FF]">{entry.title}</h2>
          <p className="mt-2 text-[13px] leading-[1.8] text-[#B9C5DF]">{entry.detail}</p>
        </article>;
      })}
    </div>
    <div className="avofis-card mt-6 flex items-start gap-3.5 rounded-[18px] border p-5">
      <span className="avofis-icon-tile shrink-0"><UserRoundCheck className="h-5 w-5" aria-hidden="true"/></span>
      <div><h2 className="text-[15px] font-semibold text-[#F2F5FF]">{t.noteTitle}</h2><p className="mt-1.5 text-[13px] leading-[1.8] text-[#B9C5DF]">{t.note}</p></div>
    </div>
    <Link href={"/basvuru?lang="+lang} className="avofis-outline avofis-btn mt-6">{t.action}<ArrowUpRight className="h-4 w-4" aria-hidden="true"/></Link>
  </PageFrame>;
}
