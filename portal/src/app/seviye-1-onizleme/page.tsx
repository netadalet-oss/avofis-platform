import Link from "next/link";
import type { Metadata } from "next";
import { SERVICES } from "@/lib/service-catalog";
import { audiences } from "@/lib/avofis-site";
import { journeys } from "@/lib/journeys";
import {
  AV_AREAS, R_SECTION_NAMES, STAFF_MODULE_SLUGS, IND_PROCEDURES,
  STAGE_COUNT, STAGE_ONE_STATUS, INDEPENDENT_R_ACCEPTANCE, LIVE_R_ACCEPTANCE
} from "@/lib/whole-product-levels";

export const metadata: Metadata = {
  title: "AVOfis | Seviye 1 Bütün Ürün Önizlemesi",
  description: "Portal, müşteri yolculuğu, personel, yargı ve güvenlik modüllerinin gerçek kod kapsamı önizlemesi.",
  robots: { index: false, follow: false }
};

const humanReview = [
  "Kurumsal kimlik, meslekî faaliyet ve gerçek temsil yetkisi",
  "Güncel hukukî kaynak, uzman ve altı dil editör onayı",
  "Bağımsız staging Auth / Storage / tenant ve yedi RLS düzeltmesi",
  "Ücret, sözleşme, ödeme ve resmî gönderim yetkisi",
  "Bağımsız güvenlik, GDPR ve üretim imzası"
] as const;

const safeJourney = [
  { title: "Ülke ve konu", href: "/baslangic", desc: "Kişisel veri istemeyen seçim" },
  { title: "Hizmet kapsamı", href: "/hizmetler", desc: "17 hizmete ilişkin bilgi" },
  { title: "İşlem öncesi bilgi", href: "/islemler", desc: "12 senaryonun kaynak ve hazırlık bilgisi" },
  { title: "Belge hazırlığı", href: "/belge-hazirlik", desc: "Yerel önizleme; gerçek belge göndermeyin" },
  { title: "Resmî ve insan onayı", href: "/uyum", desc: "Şimdilik kapalı / ayrı yetki gerekir" }
] as const;

export default function WholeProductLevelOnePreview() {
  return (
    <main className="min-h-screen bg-[#07111f] px-5 py-10 text-white sm:px-8">
      <div className="mx-auto max-w-6xl">
        <nav aria-label="Önizleme sayfa konumu" className="flex flex-wrap gap-5 text-sm text-sky-200">
          <Link href="/" className="underline underline-offset-4">AVOfis ana sayfa</Link>
          <Link href="/ilerleme" className="underline underline-offset-4">İlerleme ve şeffaflık</Link>
          <Link href="/uyum" className="underline underline-offset-4">İşlem ve yayın sınırları</Link>
        </nav>
        <header className="mt-9 max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
            Geliştirme dalı · Seviye 1 / {STAGE_COUNT} · Tarih: 1 Kasım 2026
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            AVOfis — bütün ürün kapsamı önizlemesi
          </h1>
          <p className="mt-4 text-base leading-8 text-slate-300">
            Bu ekran tek bir modülün değil, AVOfis'in tüm ana iş alanlarının
            ilk seviye görünümüdür. Bir sonraki seviyede aynı alanların tamamı
            daha ayrıntılı işlenir. Kayıtlı iş başlığı, çalışan işlev veya
            yayın izni ile eşdeğer değildir.
          </p>
          <p role="status" className="mt-5 rounded-xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-7 text-amber-100">
            Seviye durum kodu: {STAGE_ONE_STATUS}. Bağımsız R kabul:
            {" "}{INDEPENDENT_R_ACCEPTANCE}/594; canlı kabul:
            {" "}{LIVE_R_ACCEPTANCE}/594. Gerçek müşteri hesabı, belge aktarımı,
            ücret tahsilatı, meslekî temsil ve resmî kurum gönderimi açık değildir.
          </p>
        </header>

        <section className="mt-11" aria-labelledby="main-streams">
          <h2 id="main-streams" className="text-2xl font-semibold">Bütün ürünün yedi ana çalışma alanı</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {AV_AREAS.map((area) => (
              <article key={area.id} className="rounded-2xl border border-white/15 bg-white/5 p-6">
                <p className="text-xs font-semibold tracking-[0.15em] text-sky-300">
                  {area.id} · AV-{String(area.avFrom).padStart(3, "0")}–AV-{String(area.avTo).padStart(3, "0")}
                </p>
                <h3 className="mt-3 text-lg font-semibold">{area.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{area.next}</p>
                <p className="mt-3 text-xs text-amber-200">
                  {area.status === "PUBLIC_PREVIEW_ONLY" ? "Açık bilgilendirme önizlemesi"
                    : area.status === "RESTRICTED_PREVIEW" ? "Yalnız kişisel verisiz hazırlık"
                    : "Gerçek işlem yetkisi / bağımsız kabul yok"}
                </p>
                <Link href={area.href} className="mt-4 inline-flex min-h-10 items-center text-sm text-sky-200 underline underline-offset-4">
                  İlgili güvenli görünümü aç
                </Link>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-12" aria-labelledby="journey">
          <h2 id="journey" className="text-2xl font-semibold">İlk seviye ziyaretçi yolculuğu</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {safeJourney.map((step, i) => (
              <Link key={step.title} href={step.href} className="rounded-2xl border border-sky-300/20 bg-sky-300/5 p-4 hover:border-sky-300/50">
                <span className="text-xs font-semibold text-sky-300">Adım {i + 1}</span>
                <h3 className="mt-2 font-semibold">{step.title}</h3>
                <p className="mt-2 text-xs leading-6 text-slate-300">{step.desc}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12" aria-labelledby="service-count">
          <h2 id="service-count" className="text-2xl font-semibold">
            {SERVICES.length} hizmet alanı · {audiences.length} hedef kitle · {journeys.length} işlem rotası
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Aşağıdaki kaynakta tanımlı başlıklar genel bilgiye açılır. Meslekî
            yetki, gerçek teklif veya başvuru işlemi açmaz.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {SERVICES.map((service, i) => (
              <Link key={service.slug} href={"/hizmetler/" + service.slug}
                className="rounded-xl border border-white/10 bg-white/5 p-4 hover:border-sky-200/40">
                <span className="text-xs text-sky-300">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="mt-1 font-medium">{service.title}</h3>
              </Link>
            ))}
          </div>
          <details className="mt-5 rounded-2xl border border-white/15 bg-white/5 p-5">
            <summary className="cursor-pointer font-semibold">{audiences.length} hedef kitleyi görüntüle</summary>
            <ol className="mt-4 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
              {audiences.map((audience) => (
                <li key={audience.slug}>{audience.title.tr}</li>
              ))}
            </ol>
          </details>
          <details className="mt-3 rounded-2xl border border-white/15 bg-white/5 p-5">
            <summary className="cursor-pointer font-semibold">{journeys.length} sorun/işlem rotasını görüntüle</summary>
            <ol className="mt-4 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
              {journeys.map(journey => (
                <li key={journey.id}>
                  <Link href={"/islemler#" + journey.id} className="underline underline-offset-4">
                    {journey.title.tr}
                  </Link>
                </li>
              ))}
            </ol>
          </details>
        </section>

        <section className="mt-12" aria-labelledby="backoffice">
          <h2 id="backoffice" className="text-2xl font-semibold">
            Personel, IND ve yargı: tüm ana modüller
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Personel ekranı ve dosya işlemleri burada etkinleştirilmez. Başlıkların
            yer alması, kimlik/rol doğrulamasının veya modül CRUD'unun tamamlandığı
            anlamına gelmez.
          </p>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <section className="rounded-2xl border border-white/15 bg-white/5 p-5">
              <h3 className="font-semibold">16 personel modülü · AV-062–AV-077</h3>
              <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-300">
                {STAFF_MODULE_SLUGS.map((slug, i) => (
                  <li key={slug}>{String(i + 1).padStart(2, "0")}. {slug}</li>
                ))}
              </ul>
            </section>
            <section className="rounded-2xl border border-white/15 bg-white/5 p-5">
              <h3 className="font-semibold">8 IND işlemi · J01–J16 yargı izi</h3>
              <ul className="mt-4 space-y-2 text-sm text-slate-300">
                {IND_PROCEDURES.map(name => <li key={name}>{name}</li>)}
              </ul>
              <p className="mt-4 text-sm text-amber-200">
                G1–G4 yetki ve iki kişi onayı bulunmadan başvuru/gönderim yapılamaz.
              </p>
              <Link href="/yargi-baglantilari" className="mt-3 inline-flex text-sm text-sky-200 underline">
                Yalnız resmî kaynak ve bağlantı durumu
              </Link>
            </section>
          </div>
        </section>

        <section className="mt-12" aria-labelledby="r-sections">
          <h2 id="r-sections" className="text-2xl font-semibold">
            33 gereksinim bölümü · R-001–R-594
          </h2>
          <p className="mt-3 text-sm text-slate-300">
            Her bölüm 18 özgün gereksinim içerir. Aşağıdaki liste ana kapsam
            haritasıdır; herhangi bir satır tek başına kabul edilmiş değildir.
          </p>
          <ol className="mt-5 grid gap-2 md:grid-cols-2">
            {R_SECTION_NAMES.map((name, i) => (
              <li key={name} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                <span className="mr-2 font-semibold text-sky-300">{String(i + 1).padStart(2, "0")}</span>
                {name}
                <span className="ml-2 text-xs text-slate-400">
                  R-{String(i * 18 + 1).padStart(3, "0")}–R-{String((i + 1) * 18).padStart(3, "0")}
                </span>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-12" aria-labelledby="parallel-tracks">
          <h2 id="parallel-tracks" className="text-2xl font-semibold">Her seviyede izlenen ek iş ve güvenlik kayıtları</h2>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {[
              ["J01–J16", "16 dijital yargı işi", "Resmî makam bağlantısı veya makbuz teyidi yok"],
              ["P01–P10", "10 personel yetki protokolü", "Bireysel atama, MFA ve audit kabulü bekliyor"],
              ["B01–B18", "18 yayın ve işletme engeli", "Her engel kanıtla ayrı kapanmalı"],
              ["T01–T13", "13 teslimat kilometre taşı", "CI, staging, hukuk ve yayın aynı kanıt değildir"],
              ["G1–G4", "4 IND izin kapısı", "İmza ve iki kişinin incelemesi olmadan gönderim yok"],
              ["TR · NL · DE · EN · AR RTL · RU", "6 dil ve RTL", "İnsan hukukî/linguistik onayı olmayan metin onaylı sayılmaz"]
            ].map(([id, title, note]) => (
              <div key={id} className="rounded-xl border border-white/15 bg-white/5 p-4">
                <p className="text-xs font-semibold text-sky-300">{id}</p>
                <h3 className="mt-2 font-semibold">{title}</h3>
                <p className="mt-2 text-xs leading-6 text-slate-300">{note}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12 rounded-2xl border border-amber-300/30 bg-white/5 p-6" aria-labelledby="human-review">
          <h2 id="human-review" className="text-xl font-semibold">Yayın ve insan onayı gereken işler</h2>
          <ul className="mt-4 list-inside list-disc space-y-2 text-sm leading-7 text-slate-300">
            {humanReview.map(item => <li key={item}>{item}</li>)}
          </ul>
          <p className="mt-5 text-sm text-amber-200">
            Bir seviye tüm modüllerde işlenebilir; önceki seviyenin başarısız
            denemeleri sonraki seviyede yeniden ele alınır. Bu yöntem hiçbir
            zaman resmî veya canlı işlemleri yetkisiz açmaz.
          </p>
        </section>
      </div>
    </main>
  );
}
