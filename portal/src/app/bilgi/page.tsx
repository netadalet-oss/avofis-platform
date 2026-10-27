"use client";
import { ExternalLink, Landmark, GraduationCap, Building2, FileText, type LucideIcon } from "lucide-react";
import { PageFrame } from "@/components/avofis/PageFrame";
import { usePortalLanguage } from "@/hooks/usePortalLanguage";

type Source={name:string;url:string};
type Group={title:string;description:string;icon:LucideIcon;sources:Source[]};
const sources:Source[][]=[
  [{name:"Government.nl",url:"https://www.government.nl/"},{name:"NetherlandsWorldwide",url:"https://www.netherlandsworldwide.nl/"}],
  [{name:"IND",url:"https://ind.nl/en"}],
  [{name:"IDW",url:"https://www.idw.nl/en/"},{name:"Bureau Wbtv",url:"https://www.bureauwbtv.nl/"}],
  [{name:"KVK",url:"https://www.kvk.nl/en/starting/"},{name:"e-Devlet",url:"https://www.turkiye.gov.tr/"}]
];
const content={
 tr:{eyebrow:"BİLGİ MERKEZİ",title:"İşlemler için resmî bilgi kaynakları",description:"Başvuru şartları ve ücretler zamanla değişebilir. Bu nedenle işlem öncesinde ilgili kamu kurumunun güncel açıklaması esas alınmalıdır.",foot:"Bu bağlantılar genel bilgilendirme içindir; kişiye özel hukukî görüş veya resmî başvuru yerine geçmez.",groups:[
  ["Hollanda resmî işlemleri","Belediye, belge kullanımı, tasdik ve kamu işlemlerine ilişkin güncel devlet rehberleri."],
  ["Oturum ve vatandaşlık","Hollanda oturum ve vatandaşlık başvurularında yetkili kurumun açıklamaları."],
  ["Diploma ve yeminli tercüme","Diploma değerlendirmesi ile yeminli tercüman kayıtlarına ilişkin resmî kaynaklar."],
  ["Şirket ve Türkiye belgeleri","KVK şirket kuruluş bilgileri ve Türkiye'deki resmî çevrim içi hizmetler."]
 ]},
 nl:{eyebrow:"INFORMATIE",title:"Officiële informatiebronnen",description:"Voorwaarden en tarieven van overheidsinstanties kunnen veranderen. Controleer daarom steeds de actuele informatie van de bevoegde instantie.",foot:"Deze links zijn algemene informatie en geen individueel juridisch advies of officiële aanvraag.",groups:[
  ["Nederlandse overheidsdiensten","Actuele informatie over gemeenten, documenten, legalisatie en andere overheidszaken."],
  ["Verblijf en naturalisatie","Officiële informatie over verblijfs- en naturalisatieprocedures."],
  ["Diploma's en beëdigde vertalingen","Bronnen voor diplomawaardering en het register van beëdigde vertalers."],
  ["Bedrijfsoprichting en Turkse documenten","Informatie van de KVK en digitale diensten van de Turkse overheid."]
 ]},
 en:{eyebrow:"INFORMATION",title:"Official information sources",description:"Application requirements and official fees may change. Check the latest guidance from the responsible public authority before proceeding.",foot:"These links are general information, not individual legal advice or an official application.",groups:[
  ["Dutch public administration","Government guidance on municipal matters, documents and legalisation."],
  ["Residence and naturalisation","Official information on Dutch residence and naturalisation procedures."],
  ["Diplomas and sworn translators","Resources for credential evaluation and sworn translator registers."],
  ["Business formation and Turkish documents","KVK business information and Turkish public digital services."]
 ]}
};
const icons=[Landmark,FileText,GraduationCap,Building2];
export default function InformationPage(){
 const lang=usePortalLanguage(),t=content[lang];
 return <PageFrame lang={lang} eyebrow={t.eyebrow} title={t.title} description={t.description} wide>
   <div className="grid items-stretch gap-3 md:grid-cols-2">
     {t.groups.map(([title,description],i)=>{
       const Icon=icons[i];
       return <article key={title} className="avofis-card flex h-full min-w-0 flex-col rounded-[18px] border p-5 sm:p-6">
         <div className="flex items-start gap-3.5"><span className="avofis-icon-tile"><Icon className="h-5 w-5" aria-hidden="true"/></span><div className="min-w-0"><h2 className="text-[16px] font-semibold leading-snug text-[#F2F5FF]">{title}</h2><p className="mt-2 text-[13px] leading-[1.8] text-[#B9C5DF]">{description}</p></div></div>
         <div className="mt-5 flex flex-wrap gap-2 border-t border-[#dfbf59]/15 pt-4">
           {sources[i].map(s=><a key={s.url} href={s.url} rel="noopener noreferrer" target="_blank" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#dfbf59]/20 bg-[#071738] px-3 text-[12px] font-medium text-[#dfbf59]">{s.name}<ExternalLink aria-hidden="true" className="h-3.5 w-3.5"/></a>)}
         </div>
       </article>;
     })}
   </div>
   <p className="mt-5 text-[12px] leading-[1.75] text-[#ACB9D3]">{t.foot}</p>
 </PageFrame>;
}
