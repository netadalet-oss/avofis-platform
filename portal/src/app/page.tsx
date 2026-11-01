import Link from "next/link";
import type { Metadata } from "next";
import {
  ArrowRight, BookOpen, FileCheck2, FileSearch, Globe2,
  Landmark, Scale, ShieldCheck, UsersRound
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SERVICES } from "@/lib/service-catalog";
import { audiences } from "@/lib/avofis-site";
import { journeys } from "@/lib/journeys";

export const metadata: Metadata = {
  title: "AVOfis | Hukukî bilgi, işlem hazırlığı ve güvenli dosya hizmetleri",
  description: "17 hukukî ve idarî hizmet, 14 hedef kitle ve 12 işlem yolu için kaynak ve hazırlık bilgisi. Müşteri kaydı veya gerçek temsil henüz açık değil.",
  robots: { index: false, follow: false }
};

const audiencesAll = audiences;
const steps = [
  { n: "01", title: "Konunuzu belirleyin", description: "Ülke, işlem türü, ilgili kurum ve belge ihtiyacını kişisel bilgi vermeden ayırın.", href: "/baslangic" },
  { n: "02", title: "Hazırlık şartlarını inceleyin", description: "Resmî kaynak, olası süre, belge türü ve profesyonel yetki gereksinimlerini kontrol edin.", href: "/islemler" },
  { n: "03", title: "Güvenli işleme hazırlanın", description: "Şimdilik yalnız genel bilgi alın; özel dosya, ücret, sözleşme ve temsil için ayrı onay gerekir.", href: "/uyum" }
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#07111f] text-white">
      <SiteHeader />
      <section className="relative overflow-hidden border-b border-white/10">
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-48 h-[40rem] w-[40rem] rounded-full bg-sky-300/[.07] blur-3xl" />
        <div className="container-shell relative grid gap-12 py-20 md:py-24 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,.8fr)]">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-sky-300/30 bg-sky-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-sky-200">
              <Scale className="h-4 w-4" aria-hidden="true" />
              Avrupa · Hollanda · Türkiye · Sınır ötesi işlemler
            </p>
            <h1 className="mt-7 text-4xl font-semibold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
              Hukukî sürecinizi doğru bilgiyle başlatın.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
              17 hukukî ve idarî hizmet alanı, 14 hedef kitle ve 12 özgün işlem
              rotası. Ülkenizi, ilgili kurumu ve belge ihtiyacınızı belirlemek
              için açık hazırlık bilgilerine ulaşın.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/baslangic" className="inline-flex min-h-12 items-center gap-3 rounded-xl bg-sky-200 px-6 py-3 text-sm font-semibold text-slate-950 hover:bg-white">
                Sorununuza göre başlayın <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              <Link href="/hizmetler" className="inline-flex min-h-12 items-center rounded-xl border border-sky-200/40 px-6 py-3 text-sm font-semibold text-sky-100 hover:bg-sky-300/10">
                17 hizmeti inceleyin
              </Link>
            </div>
            <p className="mt-8 text-xs leading-6 text-amber-200">
              AVOfis kuruluş öncesi geliştirme aşamasındadır. Bu portal kişiye
              özel hukukî danışmanlık, avukatlık, dosya kabulü, ücretli hizmet,
              meslekî temsil veya resmî başvuru sunulduğu anlamına gelmez.
              Kişisel belgelerinizi kamu sayfalarına göndermeyin.
            </p>
          </div>
          <aside className="self-center rounded-[28px] border border-sky-300/20 bg-white/[.05] p-7 shadow-2xl sm:p-9"
            aria-labelledby="overview-heading">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">
              İlk bakışta AVOfis
            </p>
            <h2 id="overview-heading" className="mt-3 text-2xl font-semibold">Tek bir hukukî işlem haritası</h2>
            <div className="mt-7 grid grid-cols-2 gap-4">
              {[
                { n: "17", t: "Hizmet alanı", Icon: Scale },
                { n: "14", t: "Hedef kitle", Icon: UsersRound },
                { n: "12", t: "İşlem rotası", Icon: Globe2 },
                { n: "6", t: "Dil hedefi", Icon: BookOpen }
              ].map(({ n, t, Icon }) => (
                <div key={t} className="rounded-xl border border-white/10 bg-[#07111f]/70 p-4">
                  <Icon className="h-5 w-5 text-sky-300" aria-hidden="true" />
                  <p className="mt-3 text-3xl font-semibold">{n}</p>
                  <p className="mt-1 text-xs leading-5 text-slate-300">{t}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 text-xs leading-6 text-slate-400">
              Sayılar kaynak kataloğunun kapsamıdır, bağımsız hukukî veya
              teknik kabul oranı değildir. Altı dilin hukukî insan incelemesi beklenmektedir.
            </p>
          </aside>
        </div>
      </section>

      <section id="hizmetler" className="container-shell py-16 md:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.17em] text-sky-300">Hizmetler</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight">17 özgün hukukî ve idarî alan</h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300">
              Her alan için hedef kitle, işlem öncesi kontrol ve kaynak sınırı ayrı hazırlanır.
            </p>
          </div>
          <Link href="/hizmetler" className="text-sm text-sky-200 underline underline-offset-4">Bütün hizmetler</Link>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((service, i) => (
            <Link key={service.slug} href={"/hizmetler/" + service.slug}
              className="group flex flex-col rounded-2xl border border-white/10 bg-white/[.04] p-6 transition hover:border-sky-300/50 hover:bg-sky-300/[.06]">
              <span className="text-xs font-semibold text-sky-300">HİZMET {String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-3 text-lg font-semibold">{service.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-7 text-slate-300">{service.summary}</p>
              <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-sky-200">
                Hazırlık bilgisini inceleyin <ArrowRight className="h-4 w-4 group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-white/[.025] py-16">
        <div className="container-shell">
          <div className="flex items-center gap-3 text-sky-200">
            <UsersRound className="h-6 w-6" aria-hidden="true" />
            <h2 className="text-2xl font-semibold text-white">14 farklı kullanıcı ve ihtiyaç grubu</h2>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
            Konular yalnız belli bir vatandaşlığa veya meslek grubuna özgü değildir.
            Yetki ve ülke şartları her işlemde ayrıca incelenir.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {audiencesAll.map((item) => (
              <Link href={"/kimler-icin#" + item.slug} key={item.slug}
                className="rounded-xl border border-white/10 bg-[#07111f]/70 p-5 transition hover:border-sky-300/50">
                <h3 className="font-semibold">{item.title.tr}</h3>
                <p className="mt-2 text-xs leading-6 text-slate-300">{item.lead.tr}</p>
                <span className="mt-4 inline-block text-xs font-semibold text-sky-200">
                  İlgili hizmetleri inceleyin
                </span>
              </Link>
            ))}
          </div>
          <Link href="/katalog" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-sky-200 underline">
            Altı dilde hizmet kataloğunu inceleyin <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      <section id="islem-yollari" className="container-shell py-16">
        <div className="flex items-center gap-3 text-sky-200">
          <FileSearch className="h-6 w-6" aria-hidden="true" />
          <h2 className="text-2xl font-semibold text-white">12 işlem rotası</h2>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">
          Belge, oturum, iş, eğitim, konut ve sınır ötesi işlemlerde resmî
          koşulları ve belge hazırlığını öğrenin; burada kişisel veri alınmaz.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {journeys.map((journey, i) => (
            <Link href="/islemler" key={journey.id}
              className="rounded-xl border border-white/10 bg-white/[.04] p-5 hover:border-sky-300/50">
              <p className="text-xs text-sky-300">İŞLEM {String(i + 1).padStart(2, "0")}</p>
              <h3 className="mt-2 font-semibold">{journey.title.tr}</h3>
              <p className="mt-2 text-xs leading-6 text-slate-300">{journey.preparation.tr}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="border-y border-white/10 bg-[#0b1c30] py-16">
        <div className="container-shell">
          <h2 className="text-2xl font-semibold">İşleminizi nasıl hazırlarsınız?</h2>
          <div className="mt-7 grid gap-5 md:grid-cols-3">
            {steps.map((item) => (
              <article key={item.n} className="rounded-2xl border border-white/10 bg-white/[.04] p-6">
                <p className="text-3xl font-semibold text-sky-300">{item.n}</p>
                <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
                <Link href={item.href} className="mt-5 inline-flex text-sm text-sky-200 underline">İncele</Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="container-shell grid gap-8 py-16 lg:grid-cols-3">
        {[
          { title: "Hukukî bilgi ve resmî kaynaklar", note: "Mevzuat, içtihat ve yetkili kurumlarla ilgili tarihli, teyit gerektiren kaynaklar.", href: "/bilgi", Icon: BookOpen },
          { title: "Belge ve dosya hazırlığı", note: "Hassas bilgilerin güvenli kanala alınmadan önce korunması ve format hazırlığı.", href: "/belge-hazirlik", Icon: FileCheck2 },
          { title: "Hukukî ve veri koruma sınırları", note: "Yetki, kişisel veri, temsil, ödeme, insan onayı ve yayın koşullarının şeffaf açıklaması.", href: "/uyum", Icon: ShieldCheck }
        ].map(({ title, note, href, Icon }) => (
          <Link href={href} key={title} className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-sky-300/40">
            <Icon className="h-7 w-7 text-sky-300" aria-hidden="true" />
            <h3 className="mt-5 text-lg font-semibold">{title}</h3>
            <p className="mt-3 text-sm leading-7 text-slate-300">{note}</p>
            <span className="mt-5 inline-flex text-sm text-sky-200 underline">Ayrıntılı bilgi</span>
          </Link>
        ))}
      </section>
      <section className="container-shell pb-20">
        <div className="flex flex-wrap items-center justify-between gap-5 rounded-2xl border border-sky-300/25 bg-sky-300/[.06] p-7">
          <div>
            <div className="flex items-center gap-3"><Landmark className="h-6 w-6 text-sky-200" aria-hidden="true" />
              <h2 className="text-lg font-semibold">Gerçek yetki ve güvenli yayın ilkesi</h2>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300">
              Kamuya açık sayfalar genel bilgi verir. İzinli müşteri işlemleri ve
              kurum entegrasyonları bağımsız teknik, meslekî ve hukukî onay bekler.
            </p>
          </div>
          <Link href="/ilerleme" className="inline-flex min-h-11 items-center rounded-xl border border-sky-300/40 px-5 py-3 text-sm font-semibold text-sky-200">
            Doğrulanabilir geliştirme durumu
          </Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
