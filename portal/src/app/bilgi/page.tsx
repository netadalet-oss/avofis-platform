import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, ArrowUpRight, BookOpen, ExternalLink } from "lucide-react";
export const metadata:Metadata={title:"Bilgi merkezi"};
const sections=[
["Hollanda idarî işlemleri","Gemeente, BRP ve resmî kayıt işlemlerinde güncel koşulları ilgili belediye doğrular.",[["Hollanda devlet rehberi","https://www.government.nl/"],["KVK kuruluş rehberi","https://www.kvk.nl/en/starting/"]]],
["Oturum ve vatandaşlık","Göç ve vatandaşlık başvurularında tür, süre, ücret ve temsil koşulları başvurudan önce kontrol edilmelidir.",[["IND","https://ind.nl/en"],["Mijn IND","https://ind.nl/en/my-ind"]]],
["Diploma, apostil ve tercüme","Belgeyi kabul edecek makamın tercüme ve apostil koşulları belirleyicidir.",[["IDW","https://www.idw.nl/en/"],["Rechtspraak","https://www.rechtspraak.nl/"],["Bureau Wbtv","https://www.bureauwbtv.nl/"]]],
["Türkiye ve sınır ötesi işlemler","Türkiye'deki kayıt ve belge taleplerinde yetkili kamu kurumu ve başvuru sistemi kullanılmalıdır.",[["e-Devlet","https://www.turkiye.gov.tr/"],["NetherlandsWorldwide","https://www.netherlandsworldwide.nl/"]]],
["Veri koruma ve tüketici hakları","Dijital hizmetlerde gizlilik, kimlik bilgilerinin korunması ve resmî ücretsiz yardım kanalları önem taşır.",[["Autoriteit Persoonsgegevens","https://autoriteitpersoonsgegevens.nl/"],["ACM ConsuWijzer","https://consument.acm.nl/"]]]
] as const;
export default function InformationPage() {
 return <main className="avofis-theme min-h-screen">
  <div className="avofis-container max-w-5xl py-10 sm:py-14">
   <Link href="/" className="inline-flex min-h-10 items-center gap-2 text-[13px] font-semibold text-[#dfbf59]"><ArrowLeft aria-hidden="true" className="h-4 w-4"/>AVOfis</Link>
   <div className="avofis-page-head"><p className="avofis-eyebrow">BİLGİ MERKEZİ</p><h1 className="avofis-page-title mt-3">Resmî bilgiye doğrudan erişin.</h1><p className="mt-4 max-w-3xl text-sm leading-[1.8] text-[#B9C5DF]">Genel bilgilendirme ve güvenilir kurum bağlantıları. Bunlar bireysel hukukî görüş veya süre garantisi değildir.</p></div>
   <div className="mt-8 grid items-stretch gap-3 md:grid-cols-2">
    {sections.map((section,i)=><section key={section[0]} className="avofis-card flex h-full min-w-0 gap-4 rounded-[18px] border p-5 sm:p-6">
      <span className="avofis-icon-tile shrink-0"><BookOpen aria-hidden="true" className="h-5 w-5"/></span>
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-3"><h2 className="text-[17px] font-semibold leading-snug text-[#F2F5FF]">{section[0]}</h2><span className="text-[11px] text-[#8D9AB9]">0{i+1}</span></div>
        <p className="mt-2 flex-1 text-[13px] leading-[1.75] text-[#B9C5DF]">{section[1]}</p>
        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#dfbf59]/15 pt-3">
          {section[2].map(([title,url])=><a key={url} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-[#dfbf59]/20 bg-[#071738] px-3 py-2 text-[12px] font-semibold text-[#dfbf59]">{title}<ExternalLink aria-hidden="true" className="h-3.5 w-3.5 shrink-0"/></a>)}
        </div>
      </div>
    </section>)}
   </div>
  </div>
 </main>;
}
