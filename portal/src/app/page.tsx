"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, BookOpen, Building2, Check, FileCheck2, FileText, Globe2, Landmark, Menu, Scale, ShieldCheck, X } from "lucide-react";

type Lang = "tr" | "nl" | "en";
const translations = {
  tr: {
    navServices: "Hizmetler", navKnowledge: "Bilgi merkezi", navClient: "Müşteri girişi", navProcess: "Nasıl çalışırız?", navAbout: "Yaklaşımımız", navContact: "Ön başvuru",
    status: "Hollanda merkezli · Kuruluş aşaması", kicker: "SINIR ÖTESİ İŞLERDE GÜVENİLİR YOL HARİTASI",
    titleA: "Belgeler, kurumlar,", titleB: "ülkeler arasında", titleC: "netlik.",
    lead: "Hollanda ve Türkiye bağlantılı idarî işlemler, resmî belgeler ve profesyonel süreç koordinasyonu için anlaşılır, sistemli bir hizmet deneyimi.",
    explore: "Hizmetleri keşfedin", apply: "İletişim ve ön başvuru", notice: "Ücretli dosya kabulü, kuruluş ve yetki koşulları tamamlandığında açılacaktır.",
    serviceKicker: "HİZMET ALANLARI", serviceTitle: "Doğru işlem. Doğru uzman. Net kapsam.",
    serviceLead: "Her hizmetin kapsamı önceden tanımlanır. Yetki gerektiren işler bağımsız yetkili uzmanlara bırakılır.",
    howKicker: "İŞLEYİŞ", howTitle: "Karmaşıklığı sade bir sürece dönüştürüyoruz.",
    step1: "İhtiyacınızı anlatın", step1d: "İlk aşamada yalnızca iletişim ve işlem türünü öğreniriz; hassas evrak istemeyiz.",
    step2: "Kapsamı netleştirelim", step2d: "Yetki, gerekli belgeler, tahmini süre, resmî masraf ve hizmet ücretini ayırırız.",
    step3: "Süreci takip edin", step3d: "Yetkili kişi veya uzman tarafından yürütülen işlem için doğrulanabilir çıktı ve durum bilgisi sunulur.",
    aboutKicker: "ÇALIŞMA İLKELERİ", aboutTitle: "Deneyim, sınırların bilinciyle değer kazanır.",
    aboutLead: "AVOfis, hukuk ve yargı tecrübesini dijital dosya düzeniyle birleştirmeyi hedefleyen bir girişimdir. Geçmiş meslekî deneyim, Hollanda'da advocaat yetkisi bulunduğu anlamına gelmez.",
    point1: "Açık yetki sınırları", point1d: "Hangi işi doğrudan, hangi işi bağımsız uzmanla yürüttüğümüzü açıklarız.",
    point2: "Veri minimizasyonu", point2d: "Ön görüşmede özel nitelikli veri veya dava dosyası toplamayı hedeflemeyiz.",
    point3: "Yazılı hizmet kapsamı", point3d: "Ücret, sorumluluk ve teslim edilecek sonuç sözleşmeyle belirlenir.",
    lastTitle: "İşleminizi birlikte netleştirelim.", lastLead: "Faaliyete geçiş aşamasını ve başvuru kanalının durumunu kontrol edin.", prelaunch: "Kuruluş aşamasındayız",
    legal: "AVOfis bir Hollanda advocaatlık bürosu değildir. Hukukî temsil, yeminli tercüme ve noterlik gerektiren işler ilgili yetkili uzmanlar tarafından yürütülür.",
    footer: "Hollanda · Türkiye · Uluslararası süreçler", older: "Araştırma platformu", privacy: "Gizlilik yaklaşımı",
    s1: "Resmî belge ve apostil", s1d: "Belgenin nereden alınacağı, nasıl doğrulanacağı ve nerede kullanılacağına yönelik süreç organizasyonu.",
    s2: "Hollanda idarî işlemleri", s2d: "Belediye, kayıt, randevu ve başvuru evrakı için düzenli hazırlık.",
    s3: "Diploma ve eğitim", s3d: "Diploma değerlendirmesi ve başvuru belgelerinin kontrolü.",
    s4: "Şirket ve ticaret", s4d: "Kuruluş öncesi evrak envanteri, KVK ve noter süreci koordinasyonu.",
    s5: "Türkiye–Hollanda belge işleri", s5d: "Tercüme, tasdik, belge kontrolü ve kurumlar arası belge akışı.",
    s6: "Yetkili uzman ağı", s6d: "Özel hukukî değerlendirme ve temsil için bağımsız avukat ve diğer uzmanlarla yönlendirme."
  },
  nl: {
    navServices: "Diensten", navKnowledge: "Informatie", navClient: "Mijn dossier", navProcess: "Werkwijze", navAbout: "Onze aanpak", navContact: "Contactaanvraag",
    status: "Gevestigd in Nederland · In voorbereiding", kicker: "DUIDELIJKHEID BIJ GRENSOVERSCHRIJDENDE ZAKEN",
    titleA: "Documenten, instanties,", titleB: "grenzen over", titleC: "met overzicht.",
    lead: "Heldere ondersteuning bij administratieve processen, officiële documenten en professionele coördinatie tussen Nederland en Turkije.",
    explore: "Bekijk de diensten", apply: "Contactaanvraag", notice: "Betaalde dossiers worden pas aangenomen nadat registratie en vereiste bevoegdheden zijn afgerond.",
    serviceKicker: "DIENSTEN", serviceTitle: "De juiste stap. De juiste specialist.",
    serviceLead: "De dienstverlening wordt vooraf afgebakend. Voorbehouden werkzaamheden worden uitgevoerd door onafhankelijk bevoegde beroepsbeoefenaren.",
    howKicker: "WERKWIJZE", howTitle: "Complexe procedures, helder uitgelegd.",
    step1: "Omschrijf uw vraag", step1d: "Eerst vragen wij slechts om contactgegevens en het soort verzoek; geen gevoelige documenten.",
    step2: "Duidelijke opdracht", step2d: "Bevoegdheid, documenten, indicatieve doorlooptijd, overheidskosten en onze vergoeding worden gescheiden.",
    step3: "Volg de voortgang", step3d: "U ontvangt een controleerbaar resultaat en voortgangsinformatie van de bevoegde uitvoerder.",
    aboutKicker: "ONZE UITGANGSPUNTEN", aboutTitle: "Ervaring met duidelijke grenzen.",
    aboutLead: "AVOfis bouwt op juridische en rechterlijke ervaring en een gestructureerde digitale werkwijze. Eerdere ervaring betekent niet dat wij in Nederland als advocaat zijn toegelaten.",
    point1: "Heldere bevoegdheden", point1d: "Wij maken duidelijk wat wij zelf doen en wat een onafhankelijke specialist uitvoert.",
    point2: "Minimale gegevens", point2d: "Bij het eerste contact vragen wij geen bijzondere persoonsgegevens of procesdossiers.",
    point3: "Schriftelijke afspraken", point3d: "Vergoeding, verantwoordelijkheden en oplevering leggen wij vooraf vast.",
    lastTitle: "Breng overzicht in uw aanvraag.", lastLead: "Bekijk de beschikbaarheid van ons contactkanaal.", prelaunch: "In voorbereiding",
    legal: "AVOfis is geen Nederlands advocatenkantoor. Voorbehouden juridische vertegenwoordiging, beëdigde vertalingen en notariële diensten worden uitgevoerd door bevoegde professionals.",
    footer: "Nederland · Turkije · Internationaal", older: "Onderzoeksplatform", privacy: "Privacy", 
    s1: "Documenten & apostille", s1d: "Begeleiding bij verkrijgen, controleren en gebruiken van officiële documenten.",
    s2: "Nederlandse administratie", s2d: "Voorbereiding van gemeentezaken, afspraken en aanvragen.",
    s3: "Diploma & opleiding", s3d: "Ondersteuning bij diplomawaardering en documentcontrole.",
    s4: "Onderneming & handel", s4d: "Dossieropbouw voorafgaand aan KVK- en notarisprocedures.",
    s5: "Nederland–Turkije", s5d: "Coördinatie van vertaling, legalisatie en documentstromen.",
    s6: "Onafhankelijke experts", s6d: "Doorverwijzing naar bevoegde advocaten en andere specialisten."
  },
  en: {
    navServices: "Services", navKnowledge: "Information", navClient: "Client area", navProcess: "Our process", navAbout: "Our approach", navContact: "Enquiry",
    status: "Based in the Netherlands · In preparation", kicker: "CLARITY ACROSS BORDERS",
    titleA: "Documents, institutions,", titleB: "and borders.", titleC: "Made clearer.",
    lead: "Structured support with administrative procedures, official documents and professional coordination between the Netherlands and Türkiye.",
    explore: "Explore services", apply: "Contact enquiry", notice: "Paid case intake opens only after registration and required authorisations are complete.",
    serviceKicker: "SERVICES", serviceTitle: "The right step. The right expert.",
    serviceLead: "Scope is agreed in advance. Reserved professional services are provided by independently authorised specialists.",
    howKicker: "HOW IT WORKS", howTitle: "A clear path through complex processes.",
    step1: "Tell us what you need", step1d: "We initially request only basic contact details and a service category, not sensitive case files.",
    step2: "Agree a clear scope", step2d: "We separate authority, documents, timelines, official costs and service fees.",
    step3: "Follow each step", step3d: "Receive a verifiable outcome and updates from the authorised provider.",
    aboutKicker: "OUR PRINCIPLES", aboutTitle: "Experience supported by clear boundaries.",
    aboutLead: "AVOfis aims to bring legal and judicial experience together with organised digital processes. Prior experience is not a claim to admission as a Dutch advocaat.",
    point1: "Clear authority", point1d: "We distinguish support activities from work reserved for independent professionals.",
    point2: "Privacy by design", point2d: "Initial enquiries do not request sensitive personal data or litigation files.",
    point3: "Written scope", point3d: "Fees, responsibilities and deliverables are documented.",
    lastTitle: "Find the right starting point.", lastLead: "Check whether our enquiry channel is available.", prelaunch: "Preparing to launch",
    legal: "AVOfis is not a Dutch law firm. Reserved legal representation, sworn translation and notarial services are carried out by authorised professionals.",
    footer: "Netherlands · Türkiye · International", older: "Research platform", privacy: "Privacy approach",
    s1: "Documents & apostille", s1d: "Organising official-document requests, verification and cross-border use.",
    s2: "Dutch administration", s2d: "Preparation for municipal matters, appointments and applications.",
    s3: "Education & credentials", s3d: "Diploma evaluation application preparation and document review.",
    s4: "Business & trade", s4d: "Business-formation documentation and KVK/notary coordination.",
    s5: "Türkiye–Netherlands", s5d: "Translation, legalisation and document-flow coordination.",
    s6: "Independent specialists", s6d: "Referrals to authorised lawyers and other professional experts."
  }
} as const;

const icons = [FileCheck2, Landmark, BookOpen, Building2, Globe2, Scale];
const serviceCodes = ["s1", "s2", "s3", "s4", "s5", "s6"] as const;
const ready = process.env.NEXT_PUBLIC_AVOFIS_INTAKE_ENABLED === "true";

export default function HomePage() {
  const [lang, setLang] = useState<Lang>("tr");
  const [menuOpen, setMenuOpen] = useState(false);
  const t = translations[lang];
  const languages: Lang[] = ["tr", "nl", "en"];
  const nav = [
    { href: "#services", label: t.navServices },
    { href: "#process", label: t.navProcess },
    { href: "#about", label: t.navAbout },
    { href: "/bilgi", label: t.navKnowledge }
  ];

  return (
    <main className="avofis-theme min-h-screen">
      <div className="border-b border-[#dfbf59]/10 bg-[#04102C]">
        <div className="avofis-container flex min-h-8 items-center justify-between gap-3 py-1 text-[11px] text-[#B9C5DF]">
          <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#dfbf59]" />{t.status}</span>
          <span className="hidden items-center gap-1.5 sm:inline-flex"><Globe2 aria-hidden="true" className="h-3.5 w-3.5 text-[#dfbf59]" /> NL · TR · EN</span>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b border-[#dfbf59]/15 bg-[#030A22]/95 backdrop-blur-xl">
        <div className="avofis-container flex h-[68px] items-center justify-between gap-4">
          <Link href="/" aria-label="AVOfis ana sayfa" className="inline-flex shrink-0 items-center gap-2.5">
            <span className="avofis-logo-icon"><Scale aria-hidden="true" className="h-[21px] w-[21px]" strokeWidth={1.75} /></span>
            <span className="text-[22px] font-semibold tracking-[-.065em] text-[#F2F5FF]">AV<span className="font-normal">Ofis</span><span className="text-[#dfbf59]">.</span></span>
          </Link>
          <nav className="hidden items-center gap-6 xl:gap-7 xl:flex" aria-label="Main navigation">
            {nav.map(item => item.href.startsWith("#") ?
              <a key={item.href} className="avofis-nav-link" href={item.href}>{item.label}</a> :
              <Link key={item.href} className="avofis-nav-link" href={item.href}>{item.label}</Link>)}
            <Link className="avofis-nav-link" href="/musteri">{t.navClient}</Link>
          </nav>
          <div className="hidden shrink-0 items-center gap-3 xl:flex">
            <div className="inline-flex items-center gap-0.5 rounded-lg border border-[#dfbf59]/25 p-1" aria-label="Language">
              {languages.map(item => <button key={item} type="button" onClick={()=>setLang(item)} aria-pressed={lang===item} className={"avofis-lang " + (lang===item?"avofis-lang-active":"")}>{item.toUpperCase()}</button>)}
            </div>
            <Link href={"/basvuru?lang="+lang} className="avofis-cta avofis-btn">{t.navContact}<ArrowUpRight aria-hidden="true" className="h-4 w-4"/></Link>
          </div>
          <button type="button" className="avofis-icon-btn xl:hidden" onClick={()=>setMenuOpen(v=>!v)} aria-label={menuOpen?"Menüyü kapat":"Menüyü aç"} aria-expanded={menuOpen} aria-controls="mobile-nav">
            {menuOpen?<X aria-hidden="true" className="h-5 w-5"/>:<Menu aria-hidden="true" className="h-5 w-5"/>}
          </button>
        </div>
        {menuOpen && <nav id="mobile-nav" className="avofis-container grid gap-1 border-t border-[#dfbf59]/15 py-3 xl:hidden" aria-label="Mobile navigation">
          {nav.map(item=>item.href.startsWith("#")?
            <a key={item.href} href={item.href} className="avofis-mobile-link" onClick={()=>setMenuOpen(false)}>{item.label}</a> :
            <Link key={item.href} href={item.href} className="avofis-mobile-link" onClick={()=>setMenuOpen(false)}>{item.label}</Link>)}
          <Link href="/musteri" className="avofis-mobile-link" onClick={()=>setMenuOpen(false)}>{t.navClient}</Link>
          <div className="flex items-center justify-between gap-3 pt-2">
            <div className="inline-flex items-center gap-1 rounded-lg border border-[#dfbf59]/25 p-1">{languages.map(item=><button key={item} onClick={()=>setLang(item)} aria-pressed={lang===item} className={"avofis-lang "+(lang===item?"avofis-lang-active":"")}>{item.toUpperCase()}</button>)}</div>
            <Link href={"/basvuru?lang="+lang} onClick={()=>setMenuOpen(false)} className="avofis-cta avofis-btn">{t.navContact}<ArrowUpRight aria-hidden="true" className="h-4 w-4"/></Link>
          </div>
        </nav>}
      </header>

      <section className="relative overflow-hidden">
        <div className="avofis-container grid items-center gap-9 py-14 sm:py-16 lg:grid-cols-[minmax(0,1.15fr)_minmax(310px,.85fr)] lg:gap-12 lg:py-[84px]">
          <div className="min-w-0">
            <p className="avofis-eyebrow"><span className="h-px w-7 bg-[#dfbf59]"/>{t.kicker}</p>
            <h1 className="mt-5 max-w-2xl text-[clamp(2.25rem,4.7vw,4.1rem)] font-semibold leading-[1.12] tracking-[-.055em] text-[#F2F5FF]">
              {t.titleA}<br/><span className="text-[#dfbf59]">{t.titleB}</span><br/>{t.titleC}
            </h1>
            <p className="mt-6 max-w-[565px] text-[15px] leading-[1.8] text-[#B9C5DF] sm:text-base">{t.lead}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#services" className="avofis-cta avofis-btn">{t.explore}<ArrowRight aria-hidden="true" className="h-4 w-4"/></a>
              <Link href={"/basvuru?lang="+lang} className="avofis-btn avofis-outline">{t.apply}<ArrowUpRight aria-hidden="true" className="h-4 w-4"/></Link>
            </div>
            <p className="mt-6 flex max-w-xl items-start gap-2 text-xs leading-[1.7] text-[#AEBBD5]"><ShieldCheck aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 text-[#dfbf59]"/>{t.notice}</p>
          </div>
          <div className="avofis-card relative min-w-0 overflow-hidden rounded-[24px] border p-6 sm:p-8">
            <div className="pointer-events-none absolute -right-14 -top-16 h-56 w-56 rounded-full border border-[#dfbf59]/15"/>
            <div className="pointer-events-none absolute -right-7 -top-9 h-44 w-44 rounded-full border border-[#dfbf59]/15"/>
            <div className="relative flex items-center justify-between gap-4 border-b border-[#dfbf59]/15 pb-5">
              <span className="text-[11px] font-bold uppercase tracking-[.16em] text-[#dfbf59]">AVOFIS / NL · TR · EN</span>
              <Globe2 aria-hidden="true" className="h-5 w-5 text-[#dfbf59]"/>
            </div>
            <div className="relative py-7">
              <span className="text-xs font-medium uppercase tracking-[.12em] text-[#AEBBD5]">NEDERLAND · TÜRKIYE</span>
              <p className="mt-3 max-w-sm text-[25px] font-medium leading-snug tracking-[-.035em] text-[#F2F5FF] sm:text-[28px]">{lang==="tr"?"Sınırları aşan işlemler için tek bir düzen.":lang==="nl"?"Een helder traject over grenzen heen.":"Clear processes across borders."}</p>
            </div>
            <div className="relative grid gap-2 border-t border-[#dfbf59]/15 pt-5">
              {[[FileText,"01 / Documenten"],[Landmark,"02 / Administratie"],[Scale,"03 / Expertise"]].map(([Icon,label],index)=>{
                const C=Icon as typeof FileText;
                return <div key={index} className="flex h-11 items-center gap-3 rounded-xl border border-[#dfbf59]/10 bg-[#071738]/70 px-3.5">
                  <C aria-hidden="true" className="h-4 w-4 shrink-0 text-[#dfbf59]"/>
                  <span className="text-[13px] font-medium text-[#DCE3F1]">{label as string}</span>
                  <Check aria-hidden="true" className="ml-auto h-4 w-4 text-[#dfbf59]"/>
                </div>;
              })}
            </div>
            <div className="relative mt-5 inline-flex items-center gap-2 rounded-lg bg-[#dfbf59]/10 px-3 py-2 text-xs font-semibold text-[#f0d56d]"><BadgeCheck aria-hidden="true" className="h-4 w-4"/>{t.prelaunch}</div>
          </div>
        </div>
      </section>

      <section id="services" className="border-y border-[#dfbf59]/10 bg-[#04102C] py-14 sm:py-16">
        <div className="avofis-container">
          <div className="avofis-section-heading"><div><p className="avofis-eyebrow">{t.serviceKicker}</p><h2 className="avofis-h2 mt-3">{t.serviceTitle}</h2></div><p className="avofis-section-desc">{t.serviceLead}</p></div>
          <div className="mt-8 grid items-stretch gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {serviceCodes.map((code,i)=>{
              const Icon=icons[i];
              return <article key={code} className="avofis-card avofis-service-card group flex h-full min-w-0 flex-col rounded-[18px] border p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <span className="avofis-icon-tile"><Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.7}/></span>
                  <span className="text-xs font-semibold tabular-nums text-[#8D9AB9]">0{i+1}</span>
                </div>
                <h3 className="mt-5 text-[17px] font-semibold leading-snug tracking-[-.02em] text-[#F2F5FF]">{t[code]}</h3>
                <p className="mt-2 flex-1 text-[13px] leading-[1.75] text-[#B9C5DF]">{t[(code+"d") as keyof typeof t]}</p>
                <div className="mt-5 border-t border-[#dfbf59]/15 pt-3.5">
                  <Link href={"/basvuru?lang="+lang} className="inline-flex min-h-9 items-center gap-2 text-[13px] font-semibold text-[#dfbf59]">{t.navContact}<ArrowUpRight aria-hidden="true" className="h-4 w-4"/></Link>
                </div>
              </article>;
            })}
          </div>
          <Link href="/hizmetler" className="avofis-outline avofis-btn mt-6">{t.explore}<ArrowUpRight aria-hidden="true" className="h-4 w-4"/></Link>
        </div>
      </section>

      <section id="process" className="py-14 sm:py-16">
        <div className="avofis-container">
          <p className="avofis-eyebrow">{t.howKicker}</p>
          <h2 className="avofis-h2 mt-3 max-w-2xl">{t.howTitle}</h2>
          <div className="mt-8 grid items-stretch gap-3 md:grid-cols-3">
            {[[t.step1,t.step1d,FileText],[t.step2,t.step2d,FileCheck2],[t.step3,t.step3d,ShieldCheck]].map(([title,desc,Icon],i)=>{
              const StepIcon=Icon as typeof FileText;
              return <div key={i} className="avofis-card flex h-full min-w-0 gap-4 rounded-[18px] border p-5 sm:p-6">
                <span className="avofis-icon-tile shrink-0"><StepIcon aria-hidden="true" className="h-5 w-5"/></span>
                <div className="min-w-0"><span className="text-[11px] font-semibold tabular-nums tracking-[.13em] text-[#dfbf59]">0{i+1}</span><h3 className="mt-1 text-[16px] font-semibold leading-snug text-[#F2F5FF]">{title as string}</h3><p className="mt-2 text-[13px] leading-[1.75] text-[#B9C5DF]">{desc as string}</p></div>
              </div>;
            })}
          </div>
        </div>
      </section>

      <section id="about" className="border-y border-[#dfbf59]/10 bg-[#071738] py-14 sm:py-16">
        <div className="avofis-container grid items-center gap-8 lg:grid-cols-2 lg:gap-12">
          <div className="min-w-0">
            <p className="avofis-eyebrow">{t.aboutKicker}</p>
            <h2 className="avofis-h2 mt-3">{t.aboutTitle}</h2>
            <p className="mt-4 max-w-xl text-[14px] leading-[1.85] text-[#B9C5DF]">{t.aboutLead}</p>
          </div>
          <div className="grid gap-3">
            {[[t.point1,t.point1d],[t.point2,t.point2d],[t.point3,t.point3d]].map(([title,desc],i)=>
              <div key={i} className="avofis-card flex min-w-0 items-start gap-3.5 rounded-[16px] border p-4 sm:p-5">
                <span className="avofis-icon-tile h-9 w-9 shrink-0"><Check aria-hidden="true" className="h-4 w-4"/></span>
                <div className="min-w-0"><h3 className="text-[15px] font-semibold text-[#F2F5FF]">{title}</h3><p className="mt-1 text-[13px] leading-[1.7] text-[#B9C5DF]">{desc}</p></div>
              </div>)}
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-14">
        <div className="avofis-container">
          <div className="avofis-card flex flex-col items-start gap-5 rounded-[20px] border p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div className="min-w-0"><h2 className="text-[clamp(1.4rem,2.5vw,1.85rem)] font-semibold leading-tight tracking-[-.035em] text-[#F2F5FF]">{t.lastTitle}</h2><p className="mt-2 text-[13px] leading-6 text-[#B9C5DF]">{t.lastLead}</p></div>
            <Link href={"/basvuru?lang="+lang} className="avofis-cta avofis-btn shrink-0">{ready?t.apply:t.prelaunch}<ArrowUpRight aria-hidden="true" className="h-4 w-4"/></Link>
          </div>
        </div>
      </section>
      <footer className="border-t border-[#dfbf59]/15 bg-[#04102C]">
        <div className="avofis-container grid gap-5 py-8 md:grid-cols-[180px_1fr] md:gap-10">
          <div><p className="text-xl font-semibold tracking-[-.055em] text-[#F2F5FF]">AVOfis<span className="text-[#dfbf59]">.</span></p><p className="mt-1 text-xs text-[#B9C5DF]">{t.footer}</p></div>
          <div className="md:text-right"><p className="text-xs leading-[1.75] text-[#B9C5DF]">{t.legal}</p><div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-[#dfbf59] md:justify-end"><Link href="/gizlilik">{t.privacy}</Link><Link href="/bilgi">{t.navKnowledge}</Link><Link href="/musteri">{t.navClient}</Link><Link href="/modules">{t.older}</Link><span className="text-[#B9C5DF]">© {new Date().getFullYear()} AVOfis</span></div></div>
        </div>
      </footer>
    </main>
  );
}
