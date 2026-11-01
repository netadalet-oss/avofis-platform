import Link from "next/link";
import { footerColumns } from "@/lib/site";

/**
 * Seviye 1, B02 / AV-018: public footer is a reviewed static view.
 * Public content is static until verified editorial publication authorization.
 */
export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/30">
      <div className="container-shell grid gap-10 py-16 md:grid-cols-4">
        <div>
          <div className="text-lg font-semibold">AVOfis</div>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Kuruluş öncesi geliştirme aşamasında, genel hukukî bilgi ve hazırlık
            için tasarlanan portal. Aktif hukukî temsil veya müşteri dosyası kabulü sunulmaz.
          </p>
          <p className="mt-3 text-xs leading-6 text-slate-400">
            Tescilli adres, şirket ve KVK/sicil numarası ile doğrulanmış genel iletişim kanalı henüz yayımlanmadı.
            Doğrulanmamış adres veya meslekî sıfat gösterilmez.
          </p>
          <Link href="/ilerleme" className="mt-4 inline-block text-sm text-sky-200 underline underline-offset-4">
            Geliştirme ve şeffaflık durumu
          </Link>
        </div>
        {footerColumns.map((column) => (
          <div key={column.title}>
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">
              {column.title}
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              {column.links.map((link) => (
                <li key={link.href + link.label}>
                  <Link href={link.href} className="inline-flex min-h-10 items-center text-sky-200 underline underline-offset-4 hover:text-white focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
