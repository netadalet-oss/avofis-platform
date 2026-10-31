import Link from "next/link";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

const workspaces = [
  { href: "/cases", title: "İçtihat Metin Masası", summary: "Kendinizin eklediği karar metinlerini geçici olarak arayın ve inceleyin." },
  { href: "/statutes", title: "Mevzuat Metin Masası", summary: "Kendi mevzuat metinlerinizde sözcük ve ifade arayın." },
  { href: "/documents", title: "Belge Taslakları", summary: "Kendi bilgilerinizle taslak oluşturun, sürümünü görüntüleyin ve TXT indirin." },
  { href: "/workspace", title: "Görevler ve Notlar", summary: "Sayfa açıkken kişisel görev ve not listenizi düzenleyin." },
  { href: "/careers", title: "Kariyer Takibi", summary: "Kendi bulduğunuz ilanları ve başvuru durumlarınızı geçici olarak takip edin." },
  { href: "/forum", title: "Tartışma Taslakları", summary: "Topluluğa göndermeden kişisel konu ve yanıt taslakları hazırlayın." }
];

export default function ModulesPage() {
  return (
    <main>
      <SiteHeader />
      <section className="container-shell py-16">
        <h1 className="text-3xl font-semibold text-white">Çalışma Modülleri</h1>
        <p className="mt-4 max-w-3xl text-slate-300">
          Bu modüller geliştirme önizlemesidir. İlgili sayfada hangi işlemlerin
          gerçekten çalıştığı ve hangi özelliklerin henüz bulunmadığı açıklanır.
        </p>
        <p className="mt-3 rounded-xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm text-amber-100">
          Metinler ve listeler hesaplara kaydedilmez; sunucuya gönderilmez.
          Sayfa yenilenince silinir. Gizli müvekkil bilgileri veya kişisel veriler kullanmayın.
        </p>
        <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {workspaces.map((item) => (
            <Link key={item.href} href={item.href}
              className="rounded-2xl border border-white/10 bg-white/5 p-6 transition hover:border-sky-300/50">
              <h2 className="text-lg font-semibold text-white">{item.title}</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">{item.summary}</p>
              <span className="mt-5 block text-sm text-sky-300">Çalışma alanını aç</span>
            </Link>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
