import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata = {
  title: "LAREN | Hukuki ve İdari Hizmetler",
  description: "Hollanda ve Türkiye arasındaki idari ve ticari işlemler için koordinasyon ve dosya takibi.",
};

export default function LarenHome() {
  return (
    <main>
      <SiteHeader />
      <section className="container-shell py-16 sm:py-24">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 md:p-12">
          <p className="text-sm font-semibold tracking-[0.2em] text-sky-300">LAREN</p>
          <h1 className="mt-4 max-w-4xl text-4xl font-semibold leading-tight text-white md:text-5xl">
            Hollanda ve Türkiye arasında işlem koordinasyonu
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
            İdari başvurularınızı düzenleyin, belgelerinizi güvenli şekilde paylaşın ve
            dosyanızın durumunu tek panelden takip edin.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link href="/laren/new" className="rounded-xl bg-white px-6 py-3 font-semibold text-slate-950">
              Yeni başvuru oluştur
            </Link>
            <Link href="/laren/my" className="rounded-xl border border-white/20 px-6 py-3 text-white">
              Dosyalarımı görüntüle
            </Link>
            <Link href="/laren/staff" className="rounded-xl border border-white/20 px-6 py-3 text-white">
              Personel paneli
            </Link>
          </div>
        </div>
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          {[
            ["İdari hizmet", "Belge, başvuru ve işlem organizasyonu."],
            ["Ticari süreç", "Avukatlık dışı ticari operasyonların koordinasyonu."],
            ["Hukuki koordinasyon", "Türkiye'de avukatlık gerektiren işler bağımsız ve yetkili avukatça yürütülür."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-6">
              <h2 className="text-xl font-medium text-white">{title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-300">{body}</p>
            </div>
          ))}
        </div>
        <p className="mt-8 max-w-4xl text-sm leading-7 text-slate-400">
          LAREN avukatlık bürosu değildir. Türkiye'de avukatlık yetkisi gerektiren işlemler
          ilgili baroya kayıtlı bağımsız avukatlar tarafından ve ayrı sözleşmeyle yürütülür.
          Başvuru oluşturmak tek başına hukuki temsil ilişkisi kurmaz.
        </p>
      </section>
      <SiteFooter />
    </main>
  );
}
