"use client";
import { ExternalLink,Landmark,Scale,WalletCards,HeartHandshake,Globe2,GraduationCap } from "lucide-react";
import { PageFrame } from "@/components/avofis/PageFrame";
import { useSiteLang } from "@/hooks/useSiteLang";
import { ui } from "@/lib/avofis-site";

const groups=[
 {icon:Scale,urls:[
   ["Rechtspraak — gemachtigde","https://www.rechtspraak.nl/naar-de-rechter/rol-in-rechtszaak/gemachtigde"],
   ["Rechtspraak — kantonrechter","https://www.rechtspraak.nl/naar-de-rechter/rechtszaak-beginnen-particulier-of-organisatie/dagvaardingsprocedure-beginnen-kantonrechter"],
   ["Huurcommissie","https://www.huurcommissie.nl/"]
 ]},
 {icon:Landmark,urls:[
   ["Government.nl","https://www.government.nl/"],["IND","https://ind.nl/en"],
   ["NetherlandsWorldwide","https://www.netherlandsworldwide.nl/"]
 ]},
 {icon:WalletCards,urls:[
   ["Justis — Wki","https://www.justis.nl/producten/screening-incassodienstverlening/voor-wie-geldt-de-wki"],
   ["Belastingdienst","https://www.belastingdienst.nl/"],["UWV","https://www.uwv.nl/"],["SVB","https://www.svb.nl/"]
 ]},
 {icon:Globe2,urls:[
   ["Germany — RDG","https://www.gesetze-im-internet.de/rdg/BJNR284010007.html"],
   ["Make it in Germany","https://www.make-it-in-germany.com/en/"],
   ["Your Europe","https://europa.eu/youreurope/"]
 ]},
 {icon:HeartHandshake,urls:[
   ["European Court of Human Rights","https://www.echr.coe.int/"],
   ["OHCHR — United Nations","https://www.ohchr.org/"]
 ]},
 {icon:GraduationCap,urls:[
   ["KVK","https://www.kvk.nl/en/starting/"],
   ["IDW","https://www.idw.nl/en/"],
   ["Bureau Wbtv","https://www.bureauwbtv.nl/"],
   ["e-Devlet","https://www.turkiye.gov.tr/"]
 ]}
];
const content={
 tr:{title:"Resmî bilgi ve yetkili kurumlar",lead:"Avrupa'da her ülkenin hukukî ve idarî işlemleri farklıdır. Burada Hollanda, Almanya ve Avrupa kurumlarının başvuru ve hizmet kurallarına ulaşabilirsiniz.",titles:["Hollanda hukuk mahkemeleri ve kira","Hollanda kamu kurumları ve göç","Alacak tahsilatı, vergi ve sosyal güvenlik","Almanya ve Avrupa içi işlemler","AİHM ve uluslararası insan hakları","Şirket, eğitim ve resmî belgeler"],descriptions:[
 "Kanton yargısı, yetkili temsilci (gemachtigde), duruşma ve kira uyuşmazlığı usulleri.",
 "Oturum, vatandaşlık, devlet kurumları ve yurtdışında kullanılacak belgeler.",
 "Wki tahsilat kaydı, vergi işlemleri, UWV ve SVB sosyal güvenlik kararları.",
 "Almanya'nın RDG hukukî hizmet kuralları ve Avrupa içi çalışma, ikamet ve vatandaş hakları.",
 "AİHM başvuru kuralları ve Birleşmiş Milletler'in insan hakları başvuru mekanizmaları.",
 "KVK şirket işlemleri, diploma değerlendirmesi, yeminli tercüman kaydı ve Türkiye resmî hizmetleri."
 ],note:"Kaynak bağlantıları bireysel hukukî görüş, vekâlet veya başvuru oluşturmaz. Hizmet ve temsil yetkisi işlem, kişi ve ülkeye göre ayrıca doğrulanır."},
 nl:{title:"Officiële informatie en instanties",lead:"Procedures en professionele bevoegdheden verschillen per Europees land. Raadpleeg de bevoegde officiële instantie.",titles:["Rechtspraak en huurgeschillen","Nederlandse overheid en migratie","Incasso, belastingen en sociale zekerheid","Duitsland en Europese procedures","EHRM en mensenrechten","Ondernemen, onderwijs en documenten"],descriptions:[
 "Kantonzaken, gemachtigden, zittingen en Huurcommissie.",
 "Overheid, verblijf, naturalisatie en documenten.",
 "Wki-registratie, Belastingdienst, UWV en SVB.",
 "Duitse Rechtsdienstleistungsgesetz en grensoverschrijdende EU-zaken.",
 "Toelatingscriteria EHRM en VN-mensenrechtenmechanismen.",
 "KVK, diplomawaardering, beëdigde vertalers en Turkse overheidsbronnen."
 ],note:"Deze links vormen geen individueel juridisch advies of machtiging. Bevoegdheid wordt per procedure en land vastgesteld."},
 de:{title:"Offizielle Quellen und Behörden",lead:"Verfahrens- und Berufsregeln unterscheiden sich je nach europäischem Staat.",titles:["Niederländische Gerichte und Mietfragen","Niederländische Behörden und Aufenthalt","Inkasso, Steuern und Sozialleistungen","Deutschland und Europa","EGMR und Menschenrechte","Wirtschaft, Ausbildung und Dokumente"],descriptions:[
 "Kantongerichte, bevollmächtigte Vertreter und Mietkommission.",
 "Behörden, Aufenthalt, Einbürgerung und Urkunden.",
 "Wki-Registrierung, Steuerverwaltung, UWV und SVB.",
 "Rechtsdienstleistungsgesetz und EU-interne Angelegenheiten.",
 "EGMR-Verfahren und UN-Menschenrechtsmechanismen.",
 "Handelsregister, Anerkennung, beeidigte Übersetzer und Türkei-Dokumente."
 ],note:"Diese Quellen ersetzen keine Einzelfallberatung oder Vollmacht. Jede Befugnis ist national zu prüfen."},
 en:{title:"Official information and authorities",lead:"Legal procedures and professional permissions vary across European jurisdictions. Use the responsible official authority for current requirements.",titles:["Dutch courts and housing disputes","Dutch government and immigration","Debt recovery, tax and benefits","Germany and intra-European matters","ECHR and international human rights","Business, education and documents"],descriptions:[
 "Cantonal courts, non-lawyer representatives and the Huurcommissie.",
 "Government, residence, naturalisation and official documents.",
 "Wki debt-collection requirements, tax, UWV and SVB.",
 "German RDG rules and European cross-border procedures.",
 "ECHR application rules and UN human-rights mechanisms.",
 "Business formation, credentials, sworn translators and official Turkish services."
 ],note:"External sources do not constitute an individual legal opinion or power of attorney. Permissions depend on country and procedure."}
};
export default function InformationPage(){
 const lang=useSiteLang(),t=content[lang],u=ui[lang];
 return <PageFrame lang={lang} wide eyebrow={u.info} title={t.title} description={t.lead}>
  <div className="grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3">
   {groups.map((group,i)=><section key={i} className="avofis-card flex h-full flex-col rounded-[18px] border p-5">
    <span className="avofis-icon-tile"><group.icon className="h-5 w-5" aria-hidden="true"/></span>
    <h2 className="mt-4 text-[16px] font-semibold leading-snug text-[#F2F5FF]">{t.titles[i]}</h2>
    <p className="mt-2 flex-1 text-[13px] leading-[1.8] text-[#B9C5DF]">{t.descriptions[i]}</p>
    <div className="mt-4 grid gap-2 border-t border-[#dfbf59]/15 pt-4">
     {group.urls.map(([name,url])=><a href={url} key={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-2 text-[12px] font-medium text-[#dfbf59]">{name}<ExternalLink className="h-3.5 w-3.5 shrink-0"/></a>)}
    </div>
   </section>)}
  </div>
  <p className="mt-6 text-[12px] leading-[1.8] text-[#B9C5DF]">{t.note}</p>
 </PageFrame>;
}
