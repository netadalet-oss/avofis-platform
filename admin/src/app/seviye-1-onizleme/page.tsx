import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "AVOfis | Seviye 1 Yönetim ve Uygulama Önizlemesi",
  description: "AVOfis bütün ürününün personel, API, güvenlik ve kurum modüllerinin ana işlev kapsamı.",
  robots: { index: false, follow: false }
};

const staffModules = [
  ["inbox", "Gelen işler", "Başvuruların güvenli karşılanması; henüz gerçek erişim yok"],
  ["triage", "Ön değerlendirme", "Ülke, işlem, aciliyet ve uzman yönlendirmesi"],
  ["matters", "Dosyalar", "Müşteri, tenant, atama ve dosya durumları"],
  ["calendar", "Takvim", "Randevu ve resmî sürelerin ayrı izlenmesi"],
  ["documents", "Belgeler", "Güvenli dosya, sürüm ve Storage erişimi"],
  ["pleadings", "Dilekçeler", "Taslak, insan inceleme ve temsil izinleri"],
  ["research", "Hukuk araştırması", "Kaynak, mevzuat ve geçerlilik denetimi"],
  ["judicial", "Yargı", "J01–J16; resmî sistem erişimi ayrı kapalı"],
  ["ind", "IND", "Sekiz işlem ve G1–G4 yetki kapıları"],
  ["messages", "Mesajlar", "Atanmış dosyaya bağlı güvenli iletişim"],
  ["billing", "Faturalama", "Onaylı ücret, sözleşme ve muhasebe"],
  ["payables", "Ödemeler", "Çift onay ve iade/ödemeler; canlı işlem yok"],
  ["reporting", "Raporlama", "Anonim ve yetkili faaliyet ölçümü"],
  ["audit", "Denetim", "Değiştirilemez olay ve yetki izleri"],
  ["people", "Kişiler", "Personel, müşteri ve doğrulanmış uzman rolleri"],
  ["settings", "Ayarlar", "Yayın, roller, kurumlar ve ortam sınırları"]
] as const;

const backendModules = [
  "admin","analytics","auth","careers","cases","cms","connect",
  "forum","messaging","notifications","offices","statutes",
  "support","workspace"
] as const;

const workstreams = [
  ["A0", "Program ve 594 R kaynağı"],
  ["A1", "Auth, RLS, güvenlik ve staging"],
  ["A2", "Hizmetler, hedef kitleler, hukukî bilgi ve altı dil"],
  ["A3", "Müşteri, dosya, belge, başvuru ve takvim"],
  ["A4", "16 personel ve yönetim modülü"],
  ["A5", "IND, yargı, finans ve dış sistemler"],
  ["A6", "Test, insan kabulü ve yayın/işletim"]
] as const;

export default function AdminWholeProductPreview() {
  return (
    <main className="min-h-screen bg-[#07111f] px-5 py-12 text-slate-100 sm:px-8">
      <div className="mx-auto max-w-6xl">
        <nav>
          <Link href="/" className="text-sm text-sky-200 underline underline-offset-4">
            AVOfis yönetim ana sayfa
          </Link>
        </nav>
        <header className="mt-10 max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-sky-300">
            Seviye 1 · Uygulamanın tamamı · Yalnız kod önizlemesi
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Yönetim, API ve personel ana modülleri
          </h1>
          <p className="mt-4 text-base leading-8 text-slate-300">
            Bu ekran gerçek müşteri veya personel verisini sorgulamaz.
            Her modülün ana görevi burada görünür; hiçbiri yalnız
            listelendiği için çalışıyor, yetkili veya bağımsız kabul edilmiş sayılmaz.
          </p>
          <p role="status" className="mt-5 rounded-xl border border-amber-300/30 bg-amber-300/10 p-4 text-sm leading-7 text-amber-100">
            Seviye 1 sürüyor · 0/594 bağımsız R kabul · 0/594 canlı kabul.
            Personel erişimi, gerçek dosya, ödeme, hukukî temsil ve kurum
            bağlantıları bağımsız izinler tamamlanmadan kapalıdır.
          </p>
        </header>
        <section className="mt-10">
          <h2 className="text-2xl font-semibold">Yedi ürün alanı, aynı seviyede</h2>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {workstreams.map(([code,name]) => (
              <li key={code} className="rounded-xl border border-white/10 bg-white/5 p-4">
                <span className="text-sm font-semibold text-sky-300">{code}</span>
                <span className="ml-3 text-sm">{name}</span>
              </li>
            ))}
          </ul>
        </section>
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">16 personel modülünün ana noktaları</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {staffModules.map(([slug,title,scope],i)=>(
              <article key={slug} className="rounded-xl border border-white/15 bg-white/5 p-5">
                <p className="text-xs font-semibold text-sky-300">
                  AV-{String(62+i).padStart(3,"0")} · {slug}
                </p>
                <h3 className="mt-2 font-semibold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-300">{scope}</p>
                <p className="mt-3 text-xs text-amber-200">İşlem ve yetki kabulü bekliyor</p>
                <Link href={"/personel/" + slug} className="mt-4 inline-flex text-sm text-sky-200 underline underline-offset-4">
                  Bu modülün ana ekranını aç
                </Link>
              </article>
            ))}
          </div>
        </section>
        <section className="mt-12">
          <h2 className="text-2xl font-semibold">{backendModules.length} API modül iskeleti</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Kod ağacındaki modül adlarıdır. Endpoint bildirimi, çalışan CRUD
            veya güvenli kimlik doğrulama anlamına gelmez.
          </p>
          <ul className="mt-4 grid grid-cols-2 gap-2 text-sm text-slate-300 sm:grid-cols-4 lg:grid-cols-7">
            {backendModules.map(name => (
              <li key={name} className="rounded-lg border border-white/10 bg-white/5 px-3 py-3">
                {name}
              </li>
            ))}
          </ul>
        </section>
        <section className="mt-12 rounded-2xl border border-white/15 bg-white/5 p-6">
          <h2 className="text-xl font-semibold">Seviye 2 ve sonrası nasıl ilerler?</h2>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            Her sonraki seviyede yedi alan, 101 AV görevi, 594 R
            gereksinimi ve bütün modüller tekrar işlenir.
            Önceki başarısız kalemler en az iki ayrı kanıtlı denemeyle
            yeniden ele alınır; izinli başka modüllerin geliştirilmesi durmaz.
          </p>
          <p className="mt-4 text-sm text-amber-200">
            Bu önizleme seviye geçişi, PR birleştirme veya üretim yayımlama onayı değildir.
          </p>
        </section>
      </div>
    </main>
  );
}
