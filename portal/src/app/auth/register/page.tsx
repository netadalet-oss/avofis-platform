import Link from "next/link";
import type { Metadata } from "next";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export const metadata: Metadata = {
  title: "Hesap açılışı | AVOfis",
  description: "AVOfis kuruluş aşamasındadır; müşteri, personel ve meslekî hesap açılışı etkin değildir."
};

export default function RegistrationPage() {
  return (
    <main>
      <SiteHeader />
      <section className="container-shell py-16 md:py-24">
        <div className="mx-auto max-w-2xl rounded-[28px] border border-white/10 bg-white/5 p-7 md:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-300">Kuruluş öncesi bilgilendirme</p>
          <h1 className="mt-4 text-3xl font-semibold">Hesap açılışı şu anda kapalı</h1>
          <p className="mt-5 text-base leading-8 text-slate-300">
            AVOfis henüz kuruluş ve fizibilite aşamasındadır. Müşteri hesabı,
            personel hesabı, avukat veya uzman profili açılışı yapılmamaktadır.
            Meslekî unvanlar ve roller ancak gerçek belgeler ile ilgili ülke yetkileri
            doğrulandıktan sonra ayrı incelemeyle tanımlanabilir.
          </p>
          <p className="mt-4 text-sm leading-7 text-slate-300">
            Bu ekran ad, e-posta, parola, kimlik belgesi veya başka kişisel veri istemez.
            Lütfen gizli dosyanızı genel iletişim kanallarına göndermeyin.
          </p>
          <p role="status" className="mt-6 rounded-xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-7 text-amber-100">
            Yeni kullanıcı kaydı etkin değildir. Bir hesap oluşturulduğu veya
            hukukî hizmet ilişkisinin kurulduğu anlamına gelen işlem yapılmaz.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/baslangic" className="rounded-xl bg-sky-200 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-white">
              Sorununuza göre genel bilgi alın
            </Link>
            <Link href="/hizmetler" className="rounded-xl border border-white/20 px-5 py-3 text-sm text-slate-100 hover:bg-white/10">
              Planlanan hizmetleri inceleyin
            </Link>
          </div>
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
