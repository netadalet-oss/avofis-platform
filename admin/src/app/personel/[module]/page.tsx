import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { STAFF_TOP_LEVEL, staffModuleBySlug } from "@/lib/staff-module-directory";
import { StaffSyntheticDemonstration } from "@/components/StaffSyntheticDemonstration";
import { staffScreenHandoffs } from "@/lib/staff-flow-handoffs";

export const metadata: Metadata = {
  title: "AVOfis | Personel modülünün ana kapsamı",
  description: "İlk seviye bütün ürün personel modülü işlev haritası. Henüz kişisel veri veya işlem kullanılmaz.",
  robots: { index: false, follow: false }
};
export const dynamicParams = false;
export function generateStaticParams() {
  return STAFF_TOP_LEVEL.map((item) => ({ module: item.slug }));
}

export default function StaffModuleLevelOnePage({ params }: { params: { module: string } }) {
  const item = staffModuleBySlug(params.module);
  if (!item) notFound();
  const index = STAFF_TOP_LEVEL.findIndex((row) => row.slug === item.slug);

  return (
    <main className="min-h-screen bg-[#07111f] px-5 py-12 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-4xl">
        <nav className="flex flex-wrap gap-5 text-sm text-sky-200">
          <Link href="/seviye-1-onizleme" className="underline underline-offset-4">
            Bütün yönetim modülleri
          </Link>
          <Link href="/" className="underline underline-offset-4">AVOfis yönetim</Link>
        </nav>
        <header className="mt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">
            Seviye 1 · AV-{String(62 + index).padStart(3, "0")} · {item.slug}
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">{item.title}</h1>
          <p className="mt-4 text-base leading-8 text-slate-300">{item.scope}</p>
        </header>

        <div className="mt-8 grid gap-5 sm:grid-cols-2">
          <section className="rounded-2xl border border-white/15 bg-white/5 p-6">
            <h2 className="text-lg font-semibold">Ana işlev</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{item.firstAction}</p>
          </section>
          <section className="rounded-2xl border border-white/15 bg-white/5 p-6">
            <h2 className="text-lg font-semibold">Beklenen çıktı</h2>
            <p className="mt-3 text-sm leading-7 text-slate-300">{item.output}</p>
          </section>
        </div>
        <StaffSyntheticDemonstration slug={item.slug} />
        <section className="mt-7 rounded-2xl border border-sky-300/20 bg-white/5 p-6"
          aria-labelledby="staff-next-screen-heading">
          <h2 id="staff-next-screen-heading" className="text-xl font-semibold">
            Seviye 2 · Sonraki ilgili personel ekranları
          </h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Aşağıdaki geçişler yalnız modül ekranlarının gezintisidir.
            Dosya, kişi, görev, yetki, mesaj veya kurum bilgisi aktarılmaz.
            Gerçek iş ataması ve işlem akışı için bağımsız insan ve sunucu onayı gerekir.
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {staffScreenHandoffs(item.slug).map(next => (
              <li key={next.slug} className="rounded-xl border border-white/15 p-4">
                <h3 className="font-semibold">{next.title}</h3>
                <p className="mt-2 text-sm text-slate-300">{next.scope}</p>
                <p className="mt-2 text-xs text-amber-200">{next.status}</p>
                <Link href={next.href} className="mt-3 inline-flex min-h-11 items-center text-sm text-sky-200 underline">
                  Yalnız ilgili ekranı aç
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/seviye-2-akis" className="mt-5 inline-flex min-h-11 items-center text-sm text-sky-200 underline">
            Bütün 16 personel akışına dön
          </Link>
        </section>
        <section className="mt-7 rounded-2xl border border-amber-300/30 bg-amber-300/10 p-6">
          <h2 className="text-lg font-semibold">Güvenli işlem sınırı</h2>
          <p className="mt-3 text-sm leading-7 text-amber-100">
            Bu modülün ana kapsam ekranı hiçbir gerçek personel/müşteri verisi
            okumaz, saklamaz veya değiştirmez. Sunucu kimliği, tenant, atama,
            AAL2, RLS, insan ve hukukî onay olmadan bu ekrandan hiçbir
            başvuru, belge, ödeme, resmî işlem veya mesaj gönderimi yapılamaz.
          </p>
          <p className="mt-3 text-xs text-amber-100">
            Statü: Seviye 1 ana iskelet · bağımsız R kabulü yok · production kapalı.
          </p>
        </section>
      </div>
    </main>
  );
}
