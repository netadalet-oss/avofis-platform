"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BadgeCheck, BookOpen, Building2, Check, ChevronDown, FileCheck2, FileText, Globe2, Landmark, Languages, LockKeyhole, Menu, Scale, ShieldCheck, X } from "lucide-react";

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
  return (
    <main className="min-h-screen bg-[#F7F6F2] text-[#17303A]">
      <div className="bg-[#102E35] text-[#DCE9E4]">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-2 text-[11px] tracking-wide md:px-8">
          <span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-[#D0AB75]" />{t.status}</span>
          <span className="hidden items-center gap-1 md:inline-flex"><Globe2 className="h-3 w-3" /> NL · TR · EN</span>
        </div>
      </div>
      <header className="sticky top-0 z-40 border-b border-[#15353C]/10 bg-[#F7F6F2]/95 backdrop-blur-xl">
        <div className="mx-auto flex h-[82px] max-w-7xl items-center justify-between px-5 md:px-8">
          <Link href="/" className="group flex items-center gap-3" aria-label="AVOfis">
            <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#163941] text-[#E8D3B6] shadow-sm"><Scale className="h-5 w-5" strokeWidth={1.6} /></span>
            <span className="text-[23px] font-semibold tracking-[-0.07em] text-[#122F38]">AV<span className="font-light">Ofis</span><span className="ml-1 text-[#B88C53]">.</span></span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-[#37545B] lg:flex" aria-label="Main navigation">
            <a href="#services" className="hover:text-[#B7864C]">{t.navServices}</a>
            <a href="#process" className="hover:text-[#B7864C]">{t.navProcess}</a>
            <a href="#about" className="hover:text-[#B7864C]">{t.navAbout}</a>
            <Link href="/bilgi" className="hover:text-[#B7864C]">{t.navKnowledge}</Link><Link href="/musteri" className="hover:text-[#B7864C]">{t.navClient}</Link>
          </nav>
          <div className="hidden items-center gap-3 lg:flex">
            <div className="flex items-center gap-1 rounded-full border border-[#CBD4CE] p-1 text-xs" aria-label="Language">
              {(["tr","nl","en"] as const).map(item => <button key={item} type="button" aria-pressed={lang===item} onClick={()=>setLang(item)} className={"rounded-full px-2.5 py-1.5 font-semibold uppercase transition " + (lang===item ? "bg-[#173A43] text-white":"text-[#667A7D] hover:bg-[#E7EBE6]")}>{item}</button>)}
            </div>
            <Link href={"/basvuru?lang=" + lang} className="inline-flex items-center gap-2 rounded-full bg-[#173A43] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#28626A]">{t.navContact}<ArrowUpRight className="h-4 w-4" /></Link>
          </div>
          <button type="button" onClick={()=>setMenuOpen(!menuOpen)} aria-label={menuOpen?"Close menu":"Open menu"} aria-expanded={menuOpen} className="rounded-lg p-2 text-[#173A43] lg:hidden">{menuOpen?<X/>:<Menu/>}</button>
        </div>
        {menuOpen && <div className="space-y-4 border-t border-[#E1E6E0] px-5 py-5 lg:hidden">
          <div className="flex gap-2">{(["tr","nl","en"] as const).map(item=><button key={item} type="button" onClick={()=>setLang(item)} aria-pressed={lang===item} className={"rounded-lg px-3 py-2 text-sm uppercase " + (lang===item?"bg-[#173A43] text-white":"bg-[#EBEFEB]")}>{item}</button>)}</div>
          <a className="block" href="#services" onClick={()=>setMenuOpen(false)}>{t.navServices}</a><a className="block" href="#process" onClick={()=>setMenuOpen(false)}>{t.navProcess}</a><a className="block" href="#about" onClick={()=>setMenuOpen(false)}>{t.navAbout}</a><Link className="block" href="/bilgi">{t.navKnowledge}</Link><Link className="block" href="/musteri">{t.navClient}</Link><Link className="block" href={"/basvuru?lang="+lang}>{t.navContact}</Link>
        </div>}
      </header>
      <section className="relative overflow-hidden bg-[#F7F6F2]">
        <div className="pointer-events-none absolute right-[-210px] top-[-230px] h-[650px] w-[650px] rounded-full border border-[#CCDACF]" />
        <div className="pointer-events-none absolute right-[-120px] top-[-140px] h-[470px] w-[470px] rounded-full border border-[#DFE6DC]" />
        <div className="mx-auto grid max-w-7xl gap-12 px-5 pb-24 pt-20 md:px-8 lg:grid-cols-[1.2fr_.8fr] lg:items-center lg:py-32">
          <div className="relative z-10">
            <div className="mb-7 inline-flex items-center gap-3 text-[11px] font-bold tracking-[.22em] text-[#A67B4B]"><span className="h-px w-9 bg-[#B28C62]"/>{t.kicker}</div>
            <h1 className="max-w-[760px] text-[clamp(3.2rem,6vw,6.4rem)] font-semibold leading-[1.07] tracking-[-.075em] text-[#16343B]">
              {t.titleA}<br/><span className="font-light italic text-[#B18A5A]">{t.titleB}</span><br/>{t.titleC}
            </h1>
            <p className="mt-9 max-w-xl text-[17px] leading-8 text-[#607276]">{t.lead}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <a href="#services" className="inline-flex items-center gap-3 rounded-full bg-[#163A43] px-7 py-4 text-sm font-semibold text-white shadow-lg shadow-[#163A43]/10 transition hover:bg-[#25606A]">{t.explore}<ArrowRight className="h-4 w-4"/></a>
              <Link href={"/basvuru?lang="+lang} className="inline-flex items-center gap-2 rounded-full border border-[#BBCAC4] px-7 py-4 text-sm font-semibold text-[#21454A] transition hover:bg-white">{t.apply}<ArrowUpRight className="h-4 w-4"/></Link>
            </div>
            <p className="mt-7 max-w-xl text-xs leading-5 text-[#7B8583]"><ShieldCheck className="mr-1 inline h-4 w-4 align-middle text-[#B18A5A]"/>{t.notice}</p>
          </div>
          <div className="relative mx-auto w-full max-w-[450px] lg:ml-auto">
            <div className="relative overflow-hidden rounded-[35px] bg-[#173A43] p-7 text-white shadow-[0_35px_90px_-35px_rgba(12,46,54,.55)] sm:p-9">
              <div className="absolute -right-28 -top-28 h-80 w-80 rounded-full border border-[#88A9A4]/20"/>
              <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full border border-[#88A9A4]/30"/>
              <div className="mb-20 flex items-center justify-between"><span className="text-xs font-semibold tracking-[.28em] text-[#DCC5A5]">AVOFIS / 01</span><Globe2 className="h-5 w-5 text-[#DCC5A5]"/></div>
              <div className="space-y-5">
                <span className="text-xs uppercase tracking-[.18em] text-[#A6C1BC]">NEDERLAND · TÜRKIYE</span>
                <p className="max-w-xs text-3xl font-light leading-snug tracking-[-.035em]">{lang==="tr"?"Sınırları aşan işlemler için tek bir düzen.":lang==="nl"?"Een helder traject over grenzen heen.":"Clear processes across borders."}</p>
                <div className="h-px bg-white/20"/>
                <div className="flex items-center justify-between text-sm text-[#CEE0DB]"><span>01 / Documenten</span><FileText className="h-5 w-5"/></div>
                <div className="flex items-center justify-between text-sm text-[#CEE0DB]"><span>02 / Administratie</span><Landmark className="h-5 w-5"/></div>
                <div className="flex items-center justify-between text-sm text-[#CEE0DB]"><span>03 / Expertise</span><Scale className="h-5 w-5"/></div>
              </div>
            </div>
            <div className="absolute -bottom-5 -left-5 rounded-2xl border border-[#D8E0D7] bg-white p-4 shadow-xl sm:-left-9">
              <div className="flex items-center gap-2 text-xs font-medium text-[#426269]"><BadgeCheck className="h-4 w-4 text-[#B89061]"/>{t.prelaunch}</div>
            </div>
          </div>
        </div>
      </section>
      <section id="services" className="bg-white py-24 md:py-28">
        <div className="mx-auto max-w-7xl px-5 md:px-8">
          <div className="mb-12 max-w-[730px]"><p className="text-xs font-bold tracking-[.24em] text-[#AE8757]">{t.serviceKicker}</p><h2 className="mt-4 text-4xl font-semibold tracking-[-.055em] text-[#18353D] md:text-5xl">{t.serviceTitle}</h2><p className="mt-5 text-base leading-8 text-[#667B7E]">{t.serviceLead}</p></div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{serviceCodes.map((code,i)=>{const Icon=icons[i];return <article key={code} className="group rounded-[25px] border border-[#DFE7E3] bg-[#FAFBF9] p-7 transition hover:-translate-y-1 hover:border-[#ADC9C2] hover:shadow-xl hover:shadow-[#18353D]/5"><div className="mb-9 flex items-start justify-between"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E5EDE7] text-[#2D6464]"><Icon className="h-6 w-6" strokeWidth={1.5}/></span><span className="text-xs text-[#A4B0AA]">0{i+1}</span></div><h3 className="text-xl font-semibold tracking-[-.03em]">{t[code]}</h3><p className="mt-3 min-h-[80px] text-sm leading-7 text-[#667B7E]">{t[(code+"d") as keyof typeof t]}</p><Link href={"/basvuru?lang="+lang} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#9C7446]">{t.navContact}<ArrowUpRight className="h-4 w-4"/></Link></article>})}</div>
        </div>
      </section>
      <section id="process" className="bg-[#EAF0EC] py-24">
        <div className="mx-auto max-w-7xl px-5 md:px-8"><p className="text-xs font-bold tracking-[.24em] text-[#A78251]">{t.howKicker}</p><h2 className="mt-4 max-w-2xl text-4xl font-semibold tracking-[-.05em] md:text-5xl">{t.howTitle}</h2>
          <div className="mt-12 grid gap-5 md:grid-cols-3">{[["01",t.step1,t.step1d],["02",t.step2,t.step2d],["03",t.step3,t.step3d]].map(x=><div key={x[0]} className="rounded-3xl border border-[#D5E0D9] bg-white p-7"><span className="text-sm font-semibold text-[#AE8655]">{x[0]}</span><h3 className="mt-8 text-xl font-semibold">{x[1]}</h3><p className="mt-3 text-sm leading-7 text-[#677D7B]">{x[2]}</p></div>)}</div>
        </div>
      </section>
      <section id="about" className="bg-[#143740] py-24 text-[#F3F6F2]">
        <div className="mx-auto grid max-w-7xl gap-14 px-5 md:px-8 lg:grid-cols-2 lg:items-center"><div><p className="text-xs font-bold tracking-[.24em] text-[#DBB889]">{t.aboutKicker}</p><h2 className="mt-5 text-4xl font-semibold leading-tight tracking-[-.05em] md:text-5xl">{t.aboutTitle}</h2><p className="mt-7 text-base leading-8 text-[#BAD0CC]">{t.aboutLead}</p></div><div className="space-y-5">{[[t.point1,t.point1d],[t.point2,t.point2d],[t.point3,t.point3d]].map((x,i)=><div key={i} className="flex gap-4 rounded-2xl border border-white/10 bg-white/[.04] p-5"><span className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#DCC29C] text-[#173A43]"><Check className="h-4 w-4"/></span><div><h3 className="font-semibold">{x[0]}</h3><p className="mt-2 text-sm leading-6 text-[#B9CDCA]">{x[1]}</p></div></div>)}</div></div>
      </section>
      <section className="bg-[#F7F6F2] py-24"><div className="mx-auto flex max-w-7xl flex-col gap-8 px-5 md:flex-row md:items-center md:justify-between md:px-8"><div><h2 className="max-w-xl text-4xl font-semibold tracking-[-.05em] md:text-5xl">{t.lastTitle}</h2><p className="mt-4 text-base text-[#677C7B]">{t.lastLead}</p></div><Link href={"/basvuru?lang="+lang} className="inline-flex shrink-0 items-center gap-3 self-start rounded-full bg-[#173A43] px-7 py-4 text-sm font-semibold text-white">{ready?t.apply:t.prelaunch}<ArrowUpRight className="h-4 w-4"/></Link></div></section>
      <footer className="border-t border-[#D9E0D9] bg-[#F7F6F2]"><div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-9 md:flex-row md:items-start md:justify-between md:px-8"><div><p className="text-2xl font-semibold tracking-[-.06em]">AVOfis<span className="text-[#B58C57]">.</span></p><p className="mt-2 text-xs text-[#728380]">{t.footer}</p></div><div className="max-w-[650px]"><p className="text-xs leading-6 text-[#667D79]">{t.legal}</p><div className="mt-4 flex flex-wrap gap-5 text-xs font-semibold text-[#31575A]"><Link href="/gizlilik">{t.privacy}</Link><Link href="/bilgi">{t.navKnowledge}</Link><Link href="/musteri">{t.navClient}</Link><Link href="/modules">{t.older}</Link><span>© {new Date().getFullYear()} AVOfis</span></div></div></div></footer>
    </main>
  );
}
