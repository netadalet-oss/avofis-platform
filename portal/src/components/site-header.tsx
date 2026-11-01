import Link from "next/link";
import { Scale } from "lucide-react";
import { navigation } from "@/lib/site";

/**
 * Canonical AVOfis public navigation only.
 * Limited to canonical legal and administrative information pages.
 */
export function SiteHeader() {
  return (
    <header className="relative z-30 border-b border-white/10 bg-[#07111f]/95">
      <div className="container-shell flex flex-wrap items-center justify-between gap-4 py-4">
        <Link href="/" className="inline-flex min-h-11 items-center gap-3 text-white"
          aria-label="AVOfis ana sayfa">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-300/40 bg-sky-300/10">
            <Scale className="h-5 w-5 text-sky-200" aria-hidden="true" />
          </span>
          <span className="text-xl font-semibold tracking-tight">AVOfis</span>
        </Link>
        <nav aria-label="Ana gezinme" className="flex flex-wrap items-center gap-x-5 gap-y-3">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href}
              className="inline-flex min-h-10 items-center text-[13px] font-medium text-slate-200 hover:text-white focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300">
              {item.label}
            </Link>
          ))}
          <Link href="/diller" className="inline-flex min-h-10 items-center rounded-lg border border-white/20 px-3 text-[13px] text-sky-200">
            6 dil
          </Link>
        </nav>
      </div>
    </header>
  );
}
