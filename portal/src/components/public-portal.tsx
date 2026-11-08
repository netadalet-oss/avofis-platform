"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight, ArrowUpRight, BookOpen, Briefcase, Check, ChevronDown,
  ChevronRight, FileText, FolderOpen, Menu, MessageSquare,
  Newspaper, Search, Scale, Users, Wallet, X, type LucideIcon
} from "lucide-react";
import {
  findPortalService, portalGroups, portalHighlights,
  type PortalGroup, type PortalService
} from "@/lib/portal-experience";

const iconMap: Record<string, LucideIcon> = {
  scale: Scale, briefcase: Briefcase, folder: FolderOpen, wallet: Wallet,
  book: BookOpen, newspaper: Newspaper, messages: MessageSquare, users: Users
};
const primaryNavigation = [
  "hizmetler", "is-ve-teklifler", "dosya-ve-basvurular",
  "hukuk-bilgisi", "hukuk-haberleri", "topluluk"
];
const serviceHref = (slug: string) => "/hizmet/" + slug;

function Logo() {
  return (
    <Link href="/" aria-label="AvOfis ana sayfa" className="flex shrink-0 items-center gap-2.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#182e4b] text-white">
        <Scale size={22} strokeWidth={1.8} />
      </span>
      <span className="flex flex-col">
        <strong className="text-[21px] font-bold leading-5 tracking-[-0.045em] text-[#182c46]">AvOfis</strong>
        <span className="mt-1 text-[10px] font-medium tracking-[0.13em] text-[#6b7787]">HUKUK PLATFORMU</span>
      </span>
    </Link>
  );
}

function PortalHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="relative z-40 border-b border-[#e4e9f0] bg-white">
      <div className="mx-auto flex h-[76px] max-w-[1340px] items-center justify-between gap-5 px-5 md:px-7">
        <Logo />
        <nav className="hidden h-full items-center gap-0.5 xl:flex" aria-label="Ana menü">
          {primaryNavigation.map((id) => {
            const group = portalGroups.find((g) => g.id === id)!;
            return (
              <div key={id} className="group relative flex h-full items-center">
                <a href={"/#grup-" + id} className="flex items-center gap-1.5 rounded-lg px-3 py-2.5 text-[13px] font-semibold text-[#3b495c] hover:bg-[#f2f5f9] hover:text-[#142c49]">
                  {group.title === "Hukuki Hizmetler" ? "Hizmetler" :
                   group.title === "Dosya ve Başvurular" ? "Dosya Takibi" :
                   group.title === "Hukuk Bilgi Merkezi" ? "Hukuk Bilgisi" :
                   group.title === "Hukuk Haberleri" ? "Haberler" :
                   group.title === "Topluluk ve Soru–Cevap" ? "Topluluk" : group.title}
                  <ChevronDown size={14} className="text-[#8a97a8]" />
                </a>
                <div className="invisible absolute left-0 top-[68px] w-[310px] translate-y-1 rounded-2xl border border-[#e4e9f0] bg-white p-2 opacity-0 shadow-[0_18px_50px_rgba(24,46,75,.15)] transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                  <p className="px-3 pb-2 pt-2 text-[11px] font-bold uppercase tracking-[.10em] text-[#8c98a6]">{group.title}</p>
                  {group.services.map((service) => (
                    <Link key={service.slug} href={serviceHref(service.slug)} className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-[13px] text-[#36475c] hover:bg-[#f3f6fa] hover:text-[#1b385a]">
                      {service.title}<ChevronRight size={14} className="shrink-0 text-[#a5b0bc]" />
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
        <div className="hidden items-center gap-3 sm:flex">
          <Link href="/auth/login" className="rounded-lg px-3 py-2.5 text-[13px] font-semibold text-[#455368] hover:bg-[#f1f4f8]">Giriş Yap</Link>
          <Link href="/auth/register" className="rounded-xl bg-[#19334f] px-4 py-2.5 text-[13px] font-semibold text-white hover:bg-[#284b70]">Üye Ol</Link>
        </div>
        <button type="button" aria-label={mobileOpen ? "Menüyü kapat" : "Menüyü aç"} aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)} className="rounded-xl border border-[#e4e9f0] p-2.5 text-[#233950] xl:hidden">
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      {mobileOpen && (
        <div className="max-h-[75vh] overflow-y-auto border-t border-[#e4e9f0] bg-white px-5 py-3 xl:hidden">
          {portalGroups.map((group) => (
            <details key={group.id} className="border-b border-[#eef1f5]">
              <summary className="flex cursor-pointer list-none items-center justify-between py-3.5 text-sm font-semibold text-[#223751]">
                {group.title}<ChevronDown size={16} />
              </summary>
              <div className="pb-3">
                {group.services.map((service) => (
                  <Link onClick={() => setMobileOpen(false)} key={service.slug} href={serviceHref(service.slug)} className="block rounded-lg px-3 py-2.5 text-sm text-[#5a6879] hover:bg-[#f4f6f8]">{service.title}</Link>
                ))}
              </div>
            </details>
          ))}
          <div className="flex gap-3 py-4">
            <Link href="/auth/login" className="flex-1 rounded-xl border border-[#dfe5ec] px-4 py-3 text-center text-sm font-semibold text-[#203851]">Giriş Yap</Link>
            <Link href="/auth/register" className="flex-1 rounded-xl bg-[#19334f] px-4 py-3 text-center text-sm font-semibold text-white">Üye Ol</Link>
          </div>
        </div>
      )}
    </header>
  );
}

function PortalFooter() {
  const footerGroups = [portalGroups[0], portalGroups[1], portalGroups[4], portalGroups[6]];
  return (
    <footer className="border-t border-[#e4e9f0] bg-white">
      <div className="mx-auto grid max-w-[1260px] gap-10 px-5 pb-10 pt-12 sm:grid-cols-2 lg:grid-cols-[1.25fr_repeat(4,1fr)] lg:px-7">
        <div>
          <Logo />
          <p className="mt-5 max-w-xs text-[13px] leading-6 text-[#738092]">Hukuki hizmetlere erişim, çalışma süreçleri ve güvenilir hukuk bilgisi için ortak buluşma noktası.</p>
        </div>
        {footerGroups.map((group) => (
          <div key={group.id}>
            <h3 className="mb-4 text-[13px] font-bold text-[#223650]">{group.title}</h3>
            <div className="space-y-2.5">
              {group.services.slice(0, 4).map((service) => (
                <Link key={service.slug} href={serviceHref(service.slug)} className="block text-[12px] leading-5 text-[#6a7889] hover:text-[#1d4269]">{service.title}</Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-[#e9edf2]">
        <div className="mx-auto flex max-w-[1260px] flex-wrap justify-between gap-3 px-5 py-5 text-[11px] text-[#8491a0] lg:px-7">
          <span>© AvOfis · Hukuki hizmetler ve bilgi platformu</span>
          <span>AvOfis, UYAP veya herhangi bir resmî yargı portalı değildir.</span>
        </div>
      </div>
    </footer>
  );
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mb-6">
      <p className="mb-2 text-[11px] font-bold uppercase tracking-[.13em] text-[#9b7b41]">{eyebrow}</p>
      <h2 className="text-2xl font-bold tracking-[-.035em] text-[#1e324c] md:text-[28px]">{title}</h2>
      {description && <p className="mt-2 max-w-[760px] text-[14px] leading-6 text-[#718093]">{description}</p>}
    </div>
  );
}

function GroupCard({ group }: { group: PortalGroup }) {
  const Icon = iconMap[group.icon] || Scale;
  return (
    <article id={"grup-" + group.id} className="scroll-mt-24 rounded-[19px] border border-[#e3e9f0] bg-white p-5 shadow-[0_6px_24px_rgba(22,47,74,.035)] md:p-6">
      <div className="flex items-start gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[13px] bg-[#edf3f8] text-[#284867]"><Icon size={21} strokeWidth={1.7} /></div>
        <div>
          <h3 className="text-[16px] font-bold leading-6 text-[#213a55]">{group.title}</h3>
          <p className="mt-1 text-[12px] leading-5 text-[#788695]">{group.description}</p>
        </div>
      </div>
      <div className="mt-4 border-t border-[#edf0f4] pt-2">
        {group.services.map((service) => (
          <Link key={service.slug} href={serviceHref(service.slug)} className="group flex items-center justify-between gap-2 rounded-lg px-2 py-[9px] text-[13px] text-[#425267] transition hover:bg-[#f3f6fa] hover:text-[#1e456e]">
            <span>{service.title}</span><ArrowUpRight size={15} className="shrink-0 text-[#a2afbc] group-hover:text-[#365b7b]" />
          </Link>
        ))}
      </div>
    </article>
  );
}

function FlowStep({ index, title, subtitle }: { index: number; title: string; subtitle: string }) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[#cfdbe6] bg-[#edf4f9] text-xs font-bold text-[#2a4d70]">{index}</div>
      <div className="min-w-0">
        <div className="text-[13px] font-bold text-[#273e56]">{title}</div>
        <div className="mt-1 text-[12px] leading-5 text-[#788797]">{subtitle}</div>
      </div>
    </div>
  );
}

export function PortalHome() {
  const [query, setQuery] = useState("");
  const normalized = query.trim().toLocaleLowerCase("tr-TR");
  const searchMatches = normalized
    ? portalGroups.flatMap((group) => group.services.filter((service) =>
        (service.title + " " + service.description + " " + group.title).toLocaleLowerCase("tr-TR").includes(normalized)
      ).map((service) => ({ group, service })))
    : [];

  return (
    <div className="min-h-screen bg-[#f6f8fb] text-[#24364d]">
      <PortalHeader />
      <main>
        <section className="relative overflow-hidden bg-[#18314e] text-white">
          <div className="pointer-events-none absolute right-[-110px] top-[-200px] h-[540px] w-[540px] rounded-full border border-white/10" />
          <div className="pointer-events-none absolute right-[-40px] top-[-130px] h-[420px] w-[420px] rounded-full border border-white/10" />
          <div className="mx-auto grid max-w-[1260px] gap-12 px-5 py-16 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:px-7 lg:py-20">
            <div className="relative max-w-[720px]">
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[.07] px-3 py-1.5 text-[11px] font-semibold tracking-[.06em] text-[#e7d3a2]">
                <Scale size={13} /> HUKUKİ HİZMETLER VE BİLGİ
              </div>
              <h1 className="max-w-[720px] text-[37px] font-bold leading-[1.13] tracking-[-.048em] sm:text-[49px] lg:text-[56px]">
                Hukuki ihtiyaçlarınız için <span className="text-[#e6c98b]">tek adres.</span>
              </h1>
              <p className="mt-6 max-w-[620px] text-[15px] leading-7 text-[#d2dce6]">
                Hukuki hizmet talebi oluşturun, teklifleri değerlendirin, iş ve başvurularınızı takip edin. Makalelere, hukuk haberlerine ve uzman görüşlerine kolayca ulaşın.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link href={serviceHref("is-talebi-olustur")} className="inline-flex items-center gap-2 rounded-xl bg-[#e3c485] px-5 py-3.5 text-[13px] font-bold text-[#20354a] hover:bg-[#f0d49c]">İş talebi oluştur <ArrowRight size={16} /></Link>
                <a href="#hizmetler" className="inline-flex items-center gap-2 rounded-xl border border-white/25 bg-white/5 px-5 py-3.5 text-[13px] font-semibold text-white hover:bg-white/10">Tüm hizmetleri incele <ChevronRight size={16}/></a>
              </div>
              <div className="relative mt-10 max-w-[615px]">
                <Search size={19} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#708096]" />
                <input aria-label="Hizmet ve konu ara" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Hizmet, işlem veya hukuk konusu ara…" className="h-[54px] w-full rounded-xl border border-white/20 bg-white px-12 pr-4 text-sm text-[#263a50] outline-none placeholder:text-[#8b97a4] focus:border-[#e6c98b] focus:ring-2 focus:ring-[#e6c98b]/20"/>
                {normalized && (
                  <div className="absolute left-0 right-0 top-[61px] z-20 max-h-[310px] overflow-auto rounded-xl border border-[#e2e8ef] bg-white p-2 shadow-xl">
                    {searchMatches.length ? searchMatches.slice(0, 12).map(({group, service}) =>
                      <Link key={service.slug} href={serviceHref(service.slug)} className="flex justify-between gap-2 rounded-lg px-3 py-2.5 text-sm text-[#2b425b] hover:bg-[#f0f4f8]">
                        <span>{service.title}</span><span className="shrink-0 text-[11px] text-[#8d9baa]">{group.title}</span>
                      </Link>
                    ) : <p className="px-3 py-3 text-[13px] text-[#6c7d8e]">Bu aramayla eşleşen hizmet bulunamadı.</p>}
                  </div>
                )}
              </div>
            </div>
            <div className="relative hidden lg:block">
              <div className="rounded-[22px] border border-white/15 bg-white p-6 text-[#263a52] shadow-[0_30px_75px_rgba(6,21,40,.24)]">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[.1em] text-[#9d8453]">ÖRNEK İŞ DOSYASI</p>
                    <h2 className="mt-2 text-[17px] font-bold text-[#223b55]">Sözleşme inceleme talebi</h2>
                    <p className="mt-1 text-[12px] text-[#8290a0]">Başvurudan teslimata kadar tek süreç</p>
                  </div>
                  <FileText size={24} className="text-[#647d96]" />
                </div>
                <div className="my-6 h-px bg-[#e9edf2]" />
                <div className="space-y-5">
                  <FlowStep index={1} title="Talep ve kapsam" subtitle="İhtiyaç, belgeler ve iş tanımı" />
                  <FlowStep index={2} title="Teklif ve bütçe" subtitle="Uzman tekliflerinin değerlendirilmesi" />
                  <FlowStep index={3} title="İnceleme ve çalışma" subtitle="Süreç, yazışmalar ve gerekli belgeler" />
                  <FlowStep index={4} title="Teslim ve onay" subtitle="Sonucun incelenmesi ve revizyon" />
                </div>
                <div className="mt-6 flex items-center justify-between rounded-xl bg-[#f2f6f9] px-4 py-3">
                  <span className="text-[12px] font-semibold text-[#526a82]">İş sürecinizi takip edin</span>
                  <Link href={serviceHref("dosyalarim")} className="inline-flex items-center gap-1 text-[12px] font-bold text-[#1e4b74]">Dosyalarım <ArrowRight size={13}/></Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1260px] px-5 py-12 lg:px-7">
          <SectionHeading eyebrow="HIZLI İŞLEMLER" title="Bugün ne yapmak istiyorsunuz?" description="En sık ihtiyaç duyulan hizmetlere doğrudan ulaşın." />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {portalHighlights.map((item, i) => {
              const Icon = [Scale, Briefcase, FolderOpen, BookOpen][i];
              return <Link key={item.slug} href={serviceHref(item.slug)} className="group rounded-[18px] border border-[#e3e9ef] bg-white p-5 shadow-[0_4px_18px_rgba(25,50,74,.025)] hover:border-[#bdcfe0] hover:shadow-[0_10px_25px_rgba(25,50,74,.07)]">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf3f8] text-[#2a4c6c]"><Icon size={21} /></div>
                  <ArrowUpRight size={17} className="text-[#a3afbc] group-hover:text-[#31587b]" />
                </div>
                <h3 className="text-[15px] font-bold text-[#253d56]">{item.title}</h3>
                <p className="mt-1.5 text-[12px] leading-5 text-[#7e8b99]">{item.note}</p>
              </Link>;
            })}
          </div>
        </section>

        <section id="hizmetler" className="mx-auto max-w-[1260px] scroll-mt-24 px-5 pb-14 lg:px-7">
          <SectionHeading eyebrow="TÜM HİZMETLER" title="İhtiyacınıza göre hizmet alanları" description="Hukuki işlerinizi yürütmek, bilgi edinmek ve toplulukla iletişim kurmak için tüm alanları tek yerde keşfedin." />
          <div className="grid items-stretch gap-4 md:grid-cols-2 xl:grid-cols-3">
            {portalGroups.map((group) => <GroupCard key={group.id} group={group}/>)}
          </div>
        </section>

        <section className="border-y border-[#e1e8ee] bg-white py-14">
          <div className="mx-auto max-w-[1260px] px-5 lg:px-7">
            <SectionHeading eyebrow="İŞ VE TESLİM SÜRECİ" title="Talebinizden teslimata kadar" description="İş ilanı, teklif, bütçe, teslim ve değerlendirme aşamaları tek bir dosya üzerinden ilerleyecek şekilde tasarlanmıştır." />
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Talebinizi tanımlayın", "Hizmet konusu, kapsam, süre ve beklenen sonucu yazın."],
                ["Teklifleri değerlendirin", "Uzmanlık, kapsam ve bütçe önerilerini karşılaştırın."],
                ["Koşullarda anlaşın", "Teslim tarihini, iş aşamalarını ve revizyon koşullarını netleştirin."],
                ["Çalışmayı takip edin", "İşin ilerleyişini, evrakları ve mesajları dosyada görün."],
                ["Teslimi inceleyin", "Çıktıyı alın; gerekirse revizyon talep edin."],
                ["İşi sonuçlandırın", "Onay, ödeme kaydı ve tamamlanma belgelerini takip edin."]
              ].map(([title, sub], i) => (
                <div key={title} className="flex gap-3.5 rounded-xl border border-[#e9eef2] bg-[#fafcfd] p-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#eaf0f6] text-[12px] font-bold text-[#345779]">{String(i + 1).padStart(2, "0")}</span>
                  <div><h3 className="text-[13px] font-bold text-[#2a435d]">{title}</h3><p className="mt-1 text-[12px] leading-5 text-[#7a8796]">{sub}</p></div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[1260px] px-5 py-14 lg:px-7">
          <SectionHeading eyebrow="HUKUK BİLGİSİ" title="Bilgi, gündem ve topluluk bir arada" description="Alanına göre düzenlenen içeriklerle sorularınıza yanıt arayın ve hukuki gelişmeleri takip edin." />
          <div className="grid gap-4 md:grid-cols-3">
            {[
              { icon: BookOpen, label: "UZMAN YAZILARI", title: "Makaleler ve hukuk rehberleri", text: "İş, aile, tüketici, ticaret ve diğer hukuk alanlarındaki yazı ve değerlendirmeler.", cta: "Makaleleri incele", slug: "makaleler" },
              { icon: Newspaper, label: "HUKUK GÜNDEMİ", title: "Mevzuat, kararlar ve haberler", text: "Düzenlemeler, yargı kararları ve kurumsal duyurular konu başlıklarına ayrılır.", cta: "Haberleri incele", slug: "hukuk-gundemi" },
              { icon: MessageSquare, label: "SORU–CEVAP", title: "Sorular ve hukukçu görüşleri", text: "Kullanıcı soruları, uzman yanıtları, yorumlar ve mesleki tartışmalar.", cta: "Topluluğa göz at", slug: "sorular-ve-yanitlar" }
            ].map((item) => (
              <Link key={item.slug} href={serviceHref(item.slug)} className="group flex flex-col rounded-[18px] border border-[#e2e9f0] bg-white p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#edf3f8] text-[#2d506f]"><item.icon size={21}/></div>
                <p className="mt-6 text-[10px] font-bold tracking-[.1em] text-[#a28a5e]">{item.label}</p>
                <h3 className="mt-2 text-lg font-bold tracking-[-.025em] text-[#243d57]">{item.title}</h3>
                <p className="mt-3 flex-1 text-[13px] leading-6 text-[#7b8a99]">{item.text}</p>
                <span className="mt-7 inline-flex items-center gap-2 text-[12px] font-bold text-[#2c5476]">{item.cta}<ArrowRight size={15}/></span>
              </Link>
            ))}
          </div>
        </section>

        <section className="bg-[#eaf0f5] py-12">
          <div className="mx-auto flex max-w-[1260px] flex-col items-start justify-between gap-6 px-5 md:flex-row md:items-center lg:px-7">
            <div>
              <h2 className="text-[23px] font-bold tracking-[-.03em] text-[#213a55]">Hukuki işlemlerinizi tek yerde yönetin.</h2>
              <p className="mt-2 text-[13px] text-[#6f8090]">Kendi taleplerinizi, uzman tekliflerini ve çalışma süreçlerini hesabınızdan takip edin.</p>
            </div>
            <Link href="/auth/register" className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#1b3856] px-5 py-3.5 text-[13px] font-semibold text-white hover:bg-[#294b6c]">Hesap oluştur <ArrowRight size={16}/></Link>
          </div>
        </section>
      </main>
      <PortalFooter />
    </div>
  );
}

const workSteps = [
  "İhtiyaç ve kapsam belirleme", "Teklif veya bütçe değerlendirmesi",
  "İşin yürütülmesi", "Teslim, revizyon ve sonuçlandırma"
];
const recordSteps = [
  "Başvuru ve kayıt", "Yetkili incelemesi", "Ek belge veya bilgi",
  "Karar ve sonuç", "Teslim ve işlem geçmişi"
];
const contentSteps = [
  "Konu veya hukuk alanı seçimi", "İçerikleri ve kaynakları inceleme",
  "İlgili soruları ve uzman görüşlerini okuma"
];

function ServicePath({ service, group }: {service: PortalService; group: PortalGroup}) {
  const steps = group.id === "is-ve-teklifler" ? workSteps :
    group.id === "dosya-ve-basvurular" ? recordSteps :
    ["hukuk-bilgisi", "hukuk-haberleri", "topluluk"].includes(group.id) ? contentSteps :
    group.id === "odemeler" ? ["İlgili iş dosyasını seçme", "Ücret koşullarını inceleme", "Ödeme ve itiraz kayıtları"] : recordSteps;
  return (
    <div className="space-y-4">
      {steps.map((step, i) => <FlowStep key={step} index={i + 1} title={step} subtitle={i === 0 ? service.title : "İlgili hizmet dosyası üzerinden takip edilir."} />)}
    </div>
  );
}

export function PortalServicePage({ slug }: { slug: string }) {
  const found = findPortalService(slug);
  if (!found) {
    return <div className="min-h-screen bg-[#f6f8fb]"><PortalHeader/><main className="mx-auto max-w-5xl px-5 py-24"><h1 className="text-3xl font-bold text-[#223b54]">Sayfa bulunamadı</h1><Link href="/" className="mt-5 inline-flex gap-2 text-sm text-[#23577d]">Ana sayfa <ArrowRight size={16}/></Link></main><PortalFooter/></div>;
  }
  const { service, group } = found;
  const Icon = iconMap[group.icon] || Scale;

  return (
    <div className="min-h-screen bg-[#f6f8fb]">
      <PortalHeader />
      <main className="mx-auto max-w-[1260px] px-5 pb-20 pt-9 lg:px-7">
        <nav aria-label="İçerik yolu" className="flex flex-wrap items-center gap-2 text-[12px] text-[#8997a6]">
          <Link href="/" className="hover:text-[#244769]">Ana Sayfa</Link><ChevronRight size={13}/>
          <a href={"/#grup-" + group.id} className="hover:text-[#244769]">{group.title}</a><ChevronRight size={13}/>
          <span className="font-semibold text-[#34516e]">{service.title}</span>
        </nav>
        <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_290px]">
          <div>
            <div className="rounded-[22px] border border-[#e3eaf1] bg-white p-6 md:p-9">
              <div className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-[#edf3f8] text-[#2b4f70]"><Icon size={25}/></div>
              <p className="mt-6 text-[11px] font-bold uppercase tracking-[.12em] text-[#a48756]">{group.title}</p>
              <h1 className="mt-2 text-[30px] font-bold tracking-[-.04em] text-[#1f3751] md:text-[39px]">{service.title}</h1>
              <p className="mt-4 max-w-[690px] text-[15px] leading-7 text-[#708192]">{service.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/auth/register" className="inline-flex items-center gap-2 rounded-xl bg-[#1d3b59] px-5 py-3 text-[13px] font-bold text-white hover:bg-[#2b506f]">Hesap oluşturarak devam et <ArrowRight size={15}/></Link>
                <Link href="/auth/login" className="inline-flex items-center gap-2 rounded-xl border border-[#dbe4ec] px-5 py-3 text-[13px] font-semibold text-[#36516d] hover:bg-[#f5f8fa]">Hesabım var</Link>
              </div>
            </div>
            <div className="mt-5 rounded-[22px] border border-[#e3eaf1] bg-white p-6 md:p-9">
              <h2 className="text-[20px] font-bold text-[#243d56]">İşlem ve takip adımları</h2>
              <p className="mt-2 text-[13px] leading-6 text-[#8190a0]">Bu hizmet için öngörülen kullanıcı akışı.</p>
              <div className="mt-7 grid gap-7 sm:grid-cols-2"><ServicePath group={group} service={service}/></div>
            </div>
            <div className="mt-5 rounded-[22px] border border-[#e3eaf1] bg-white p-6 md:p-9">
              <h2 className="text-[20px] font-bold text-[#243d56]">Bu alanda neler bulabilirsiniz?</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  ["Hizmetin kapsamı", service.description],
                  ["İlgili belgeler", "Hizmetle ilgili bilgi, belge ve başvuru kayıtları."],
                  ["Süreç takibi", "İnceleme, çalışma ve sonuç aşamalarının görünümü."],
                  ["Mesajlar ve bildirimler", "İlgili işlem hakkındaki yazışma ve bildirim alanı."]
                ].map(([title, text]) => <div key={title} className="flex gap-3 rounded-xl bg-[#f7f9fb] p-4"><Check size={16} className="mt-0.5 shrink-0 text-[#547b93]"/><div><h3 className="text-[13px] font-bold text-[#2b455f]">{title}</h3><p className="mt-1 text-[12px] leading-5 text-[#8490a0]">{text}</p></div></div>)}
              </div>
              <p className="mt-6 text-[11px] leading-5 text-[#8e9baa]">Bu ekran hizmet yapısını gösteren önizlemedir. Başvuru kaydı, belge gönderimi ve ödeme işlemleri bu önizleme üzerinden gerçekleştirilemez.</p>
            </div>
          </div>
          <aside className="h-fit rounded-[20px] border border-[#e3eaf1] bg-white p-5">
            <div className="mb-3 flex items-center gap-2.5 border-b border-[#ecf0f4] pb-4"><Icon size={19} className="text-[#476e90]"/><h2 className="text-[14px] font-bold text-[#273f58]">{group.title}</h2></div>
            <nav aria-label="İlgili hizmetler" className="space-y-1">
              {group.services.map((s) => <Link key={s.slug} href={serviceHref(s.slug)} aria-current={s.slug === slug ? "page" : undefined} className={"flex items-center justify-between rounded-lg px-3 py-2.5 text-[12px] " + (s.slug === slug ? "bg-[#eaf1f6] font-bold text-[#234565]" : "text-[#6b7c8d] hover:bg-[#f4f7f9]")}><span>{s.title}</span><ChevronRight size={13}/></Link>)}
            </nav>
            <Link href="/#hizmetler" className="mt-5 flex items-center justify-between border-t border-[#ecf0f4] pt-4 text-[12px] font-bold text-[#345d80]">Tüm hizmetler <ArrowRight size={15}/></Link>
          </aside>
        </div>
      </main>
      <PortalFooter />
    </div>
  );
}
