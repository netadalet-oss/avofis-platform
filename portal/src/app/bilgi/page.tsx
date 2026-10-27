"use client";
import { ExternalLink,GraduationCap,Building2,Landmark,Scale } from "lucide-react";
import { PageFrame } from "@/components/avofis/PageFrame";
import { useSiteLang } from "@/hooks/useSiteLang";
import { ui } from "@/lib/avofis-site";
const sources=[
 {icon:Landmark,urls:[["Government.nl","https://www.government.nl/"],["NetherlandsWorldwide","https://www.netherlandsworldwide.nl/"],["IND","https://ind.nl/en"]]},
 {icon:Building2,urls:[["KVK","https://www.kvk.nl/en/starting/"],["Make it in Germany","https://www.make-it-in-germany.com/en/"]]},
 {icon:GraduationCap,urls:[["IDW","https://www.idw.nl/en/"],["Bureau Wbtv","https://www.bureauwbtv.nl/"],["e-Devlet","https://www.turkiye.gov.tr/"]]},
 {icon:Scale,urls:[["European Court of Human Rights","https://www.echr.coe.int/"],["OHCHR","https://www.ohchr.org/"],["Rechtspraak","https://www.rechtspraak.nl/"]]}
];
const content={
 tr:{title:"Resmî bilgi ve kurum bağlantıları",lead:"İşlem koşulları ve ücretler ilgili ülke ve kuruma göre değişebilir. Başvuru öncesinde güncel resmî kaynakları inceleyin.",titles:["Hollanda resmî işlemleri ve göç","İşletme ve uluslararası çalışma","Belgeler, diploma ve Türkiye","Mahkemeler ve insan hakları"],desc:["Belediye, oturum, vize ve diğer devlet işlemlerine ilişkin resmî bilgiler.","Şirket kuruluşu, ticaret ve çalışma süreçlerine ilişkin kurum kaynakları.","Diploma, yeminli tercüman kayıtları ve Türkiye'deki resmî hizmetler.","Ulusal mahkemeler, AİHM ve Birleşmiş Milletler insan hakları mekanizmaları."],note:"Bağlantılar genel bilgi sunar; bireysel hukukî değerlendirme, temsil veya resmî başvuru yerine geçmez."},
 nl:{title:"Officiële bronnen en instanties",lead:"Voorwaarden en tarieven hangen af van land en instantie. Raadpleeg vóór een aanvraag de actuele officiële informatie.",titles:["Nederlandse overheid en migratie","Ondernemen en internationaal werken","Documenten, diploma's en Turkije","Rechtspraak en mensenrechten"],desc:["Officiële informatie over overheidszaken, verblijf en visa.","Bronnen over oprichting, handel en werken in Europa.","Diplomawaardering, beëdigde vertalers en Turkse digitale diensten.","Rechtbanken, EHRM en VN-mensenrechtenmechanismen."],note:"Deze links zijn algemene informatie, geen individueel juridisch advies of aanvraag."},
 de:{title:"Behördliche Informationen und Quellen",lead:"Voraussetzungen und Gebühren unterscheiden sich je nach Land und Behörde. Prüfen Sie aktuelle offizielle Quellen.",titles:["Niederländische Behörden und Migration","Unternehmen und internationale Arbeit","Dokumente, Diplome und Türkei","Gerichte und Menschenrechte"],desc:["Behördliche Informationen zu Visa und Aufenthalt.","Unternehmensgründung, Handel und internationale Beschäftigung.","Anerkennung, Übersetzerregister und türkische Verwaltungsdienste.","Gerichtsbarkeit, EGMR und UN-Menschenrechtsverfahren."],note:"Diese Links dienen nur der allgemeinen Information; keine Einzelfallberatung oder Antragstellung."},
 en:{title:"Official information and institutions",lead:"Requirements and fees vary by country and authority. Check the current official guidance before making an application.",titles:["Dutch government and immigration","Business and international employment","Documents, qualifications and Türkiye","Courts and human rights"],desc:["Official guidance on government services, residence and visas.","Sources about company formation, commerce and work in Europe.","Credential evaluation, sworn translators and Turkish e-government services.","National courts, the ECHR and UN human rights mechanisms."],note:"External links provide general information, not individual legal advice or applications."}
};
export default function InformationPage(){
 const lang=useSiteLang(),t=content[lang],u=ui[lang];
 return <PageFrame lang={lang} wide eyebrow={u.info} title={t.title} description={t.lead}>
  <div className="grid gap-3 sm:grid-cols-2">{sources.map((entry,i)=><section key={i} className="avofis-card flex h-full flex-col rounded-[18px] border p-5 sm:p-6"><span className="avofis-icon-tile"><entry.icon className="h-5 w-5" aria-hidden="true"/></span><h2 className="mt-4 text-[16px] font-semibold text-[#F2F5FF]">{t.titles[i]}</h2><p className="mt-2 flex-1 text-[13px] leading-[1.8] text-[#B9C5DF]">{t.desc[i]}</p><div className="mt-4 flex flex-wrap gap-2 border-t border-[#dfbf59]/15 pt-4">{entry.urls.map(([name,url])=><a key={url} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#dfbf59]/25 bg-[#071738] px-3 text-[12px] font-semibold text-[#dfbf59]">{name}<ExternalLink className="h-3.5 w-3.5" aria-hidden="true"/></a>)}</div></section>)}</div>
  <p className="mt-6 text-[12px] leading-[1.8] text-[#B9C5DF]">{t.note}</p>
 </PageFrame>;
}
