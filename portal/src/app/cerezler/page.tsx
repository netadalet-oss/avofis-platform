"use client";
import Link from "next/link";
import {PageFrame} from "@/components/avofis/PageFrame";
import {usePortalLanguage} from "@/hooks/usePortalLanguage";
const content={
 tr:{eyebrow:"ÇEREZLER / TASLAK",title:"Çerezler ve benzer teknolojiler",
 intro:"Bu, kuruluş öncesi bir açıklama taslağıdır. Tam teknik çerez ve üçüncü taraf envanteri henüz denetlenmedi. Gerçekte kullanılan teknolojilerin listesi ve saklama süreleri doğrulanmadan tam politika olarak sunulmaz.",
 items:[
  ["Gerekli işlevler","Oturum ve dil tercihi gibi zorunlu işlevler için ilgili teknik saklama mekanizmaları kullanılabilir. Bunlar için ayrı onay gerekip gerekmediği kullanımına göre incelenmelidir."],
  ["Analitik ve takip","İzleme/kişiselleştirilmiş reklam çerezleri ancak veri işleme envanteri, ilgili dayanak ve gerektiğinde önceden açık tercih mekanizması doğrulanınca kullanılabilir."],
  ["Tercihler","Takip için onay yoksa hizmete erişim engellenmemelidir; geri çekme ve reddetme seçenekleri eşit ölçüde erişilebilir olmalıdır. Bu sayfa bir çerez onay yönetim paneli değildir."]
 ],note:"İşlevsel/analitik/izleme ayrımı için Hollanda Autoriteit Persoonsgegevens rehberini takip edin."},
 nl:{eyebrow:"COOKIES / CONCEPT",title:"Cookies en vergelijkbare technieken",
 intro:"Dit is informatie in voorbereiding. De volledige technische inventaris van cookies en externe scripts is nog niet onafhankelijk gecontroleerd. Dit is geen vastgestelde cookieverklaring.",
 items:[
  ["Noodzakelijke functies","Functionele opslag kan nodig zijn voor sessies en taalvoorkeuren. De werkelijke gebruikte mechanismen moeten vóór opening worden geïnventariseerd."],
  ["Analyse en tracking","Tracking en privacygevoelige analytics mogen pas na inventarisatie en, waar nodig, voorafgaande vrij gegeven toestemming worden ingeschakeld."],
  ["Keuzevrijheid","Geen cookiewall; weigeren moet een reële en even eenvoudige keuze zijn. Dit is geen toestemmingsbeheerder."]
 ],note:"Zie Autoriteit Persoonsgegevens voor actuele richtlijnen."},
 en:{eyebrow:"COOKIES / DRAFT",title:"Cookies and similar technologies",
 intro:"This is a pre-launch statement, not a completed cookie inventory. Actual cookies, scripts, recipients and retention periods require independent review before claiming full compliance.",
 items:[
  ["Necessary functions","Session management and language preferences may require functional storage; actual technologies must first be audited."],
  ["Analytics and tracking","Tracking and intrusive analytics must remain outside the approved release until their purposes and applicable prior consent are verified."],
  ["Real choice","Rejecting tracking must not block access. A consent-management interface, if needed, must provide equivalent refusal and withdrawal options. This is not a consent banner."]
 ],note:"Refer to the Dutch Data Protection Authority for cookie rules."}
};
export default function CookiesPage(){
 const lang=usePortalLanguage(),t=content[lang];
 return <PageFrame lang={lang} eyebrow={t.eyebrow} title={t.title} description={t.intro}>
   <div className="grid gap-3">{t.items.map(([heading,body])=>
    <section key={heading} className="avofis-card rounded-xl border p-5">
     <h2 className="font-semibold">{heading}</h2>
     <p className="mt-2 text-sm leading-7 text-[#b9c5df]">{body}</p>
    </section>)}</div>
   <p className="mt-5 text-sm text-[#e8d18e]">{t.note}</p>
   <a href="https://autoriteitpersoonsgegevens.nl/themas/internet-slimme-apparaten/cookies"
    target="_blank" rel="noopener noreferrer" className="mt-3 inline-block text-sm text-[#dfbf59] underline">Autoriteit Persoonsgegevens — cookies</a>
   <p className="mt-4 text-sm text-[#b9c5df]">
    <Link className="text-[#dfbf59] underline" href={"/uyum"}>Yayın uygunluğu / Go-No-Go</Link>
   </p>
 </PageFrame>;
}
