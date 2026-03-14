import { footerColumns } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-black/30">
      <div className="container-shell grid gap-10 py-16 md:grid-cols-4">
        <div>
          <div className="text-lg font-semibold">AvOfis</div>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Modern, ölçeklenebilir ve yönetilebilir hukuk araştırma ve çalışma platformu.
          </p>
        </div>

        {footerColumns.map((column) => (
          <div key={column.title}>
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">{column.title}</div>
            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              {column.links.map((link) => (
                <li key={link}>{link}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </footer>
  );
}
