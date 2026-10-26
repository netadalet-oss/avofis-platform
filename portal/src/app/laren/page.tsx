import Link from "next/link";

export const metadata = {
  title: "LAREN | Hukuki ve İdari Hizmetler",
  description: "Hollanda ve Türkiye arasındaki idari ve ticari işlemler için koordinasyon ve dosya takibi.",
};

export default function LarenHome() {
  return (
    <main>
      <section className="container-shell py-8 sm:py-20">
        <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 sm:p-8 md:p-12">
          <p className="text-sm font-semibold tracking-[0.2em] text-sky-300">LAREN</p>
          <h1 className="mt-4 max-w-4xl text-[30px] font-semibold leading-[1.16] tracking-tight text-white sm:text-4xl md:text-5xl">
            Hollanda ve Türkiye arasında işlem koordinasyonu
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-slate-300">
            İdari başvurularınızı düzenleyin, belgelerinizi güvenli şekilde paylaşın ve
            dosyanızın durumunu tek panelden takip edin.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href="/laren/new" className="flex min-h-12 items-center justify-center rounded-xl bg-white px-6 py-3 text-center font-semibold text-slate-950">
              Yeni başvuru oluştur
            </Link>
            <Link href="/laren/my" className="flex min-h-12 items-center justify-center rounded-xl border border-white/20 px-6 py-3 text-center text-white">
              Dosyalarımı görüntüle
            </Link>
            <Link href="/laren/staff" className="flex min-h-12 items-center justify-center rounded-xl border border-white/20 px-6 py-3 text-center text-white">
              Personel paneli
            </Link>
          </div>
        </div>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["İdari hizmet", "Belge, başvuru ve işlem organizasyonu."],
            ["Ticari süreç", "Avukatlık dışı ticari operasyonların koordinasyonu."],
            ["Hukuki koordinasyon", "Türkiye'de avukatlık gerektiren işler bağımsız ve yetkili avukatça yürütülür."],
          ].map(([title, body]) => (
            <div key={title} className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:p-6">
              <h2 className="break-words text-lg font-medium text-white sm:text-xl">{title}</h2>
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
      
    </main>
  );
}
