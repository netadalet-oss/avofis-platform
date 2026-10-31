import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { SERVICES } from "@/lib/service-catalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hizmet alanları | AVOfis",
  description: "AVOfis'in planlanan 17 hukukî ve idarî hizmet alanını, işlem öncesi hazırlık bilgilerini ve yetki sınırlarını inceleyin."
};

export default function HizmetlerPage() {
  return (
    <main>
      <SiteHeader />
      <section className="container-shell py-12 md:py-16">
        <p className="text-xs uppercase tracking-[0.2em] font-semibold text-sky-300">Avrupa geneli · Hukukî ve idarî konular</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight md:text-4xl">Hizmet alanlarını inceleyin</h1>
        <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
          AVOfis'in planladığı 17 alanda, konunuzu ve hazırlanabilecek belgeleri öğrenin.
          Her alanın bilgi sayfası açılır; fakat henüz müşteri kabulü, ücretli danışmanlık,
          mahkeme temsili veya resmî başvuru hizmeti açılmış değildir.
        </p>
        <div className="mt-6 rounded-xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-7 text-amber-100" role="note">
          AVOfis kuruluş ve fizibilite aşamasındadır. Aşağıdaki içerikler genel bilgi ve hazırlık
          içindir; meslekî yetki, fiyat, resmî süre veya gerçek hizmet teklifi değildir.
          Acil karar veya başvuru süreniz varsa doğrudan ilgili kurumdan ya da yetkili profesyonelden teyit alın.
        </div>
        <div className="mt-9 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {SERVICES.map((service, index) => (
            <article key={service.slug} className="flex flex-col rounded-[22px] border border-white/10 bg-white/5 p-5">
              <p className="text-xs font-semibold tracking-wide text-sky-300">Hizmet alanı {String(index+1).padStart(2,"0")}</p>
              <h2 className="mt-3 text-lg font-semibold">{service.title}</h2>
              <p className="mt-3 flex-1 text-sm leading-7 text-slate-300">{service.summary}</p>
              <Link className="mt-5 inline-flex w-fit rounded-xl border border-sky-300/40 px-4 py-2.5 text-sm font-medium text-sky-200 hover:bg-sky-300/10 focus:outline-none focus:ring-2 focus:ring-sky-200" href={`/hizmetler/${service.slug}`}>
                Bilgi ve hazırlık adımlarını aç <span aria-hidden="true" className="ml-2">→</span>
              </Link>
            </article>
          ))}
        </div>
        <div className="mt-10 rounded-[22px] border border-sky-400/20 bg-sky-400/5 p-6">
          <h2 className="text-lg font-semibold">Hangi hizmete bakacağınızdan emin değil misiniz?</h2>
          <p className="mt-2 text-sm leading-7 text-slate-300">Kişisel bilgi vermeden ülke, sorun ve varsa resmî karar durumunu seçerek hazırlık listesi oluşturabilirsiniz.</p>
          <Link className="mt-4 inline-block rounded-xl bg-sky-200 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-white" href="/baslangic">Sorununuza göre başlayın</Link>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
