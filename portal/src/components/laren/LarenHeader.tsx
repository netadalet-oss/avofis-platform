"use client";

import Link from "next/link";
import { ArrowLeft, BriefcaseBusiness, LogIn } from "lucide-react";
import { usePathname } from "next/navigation";
import { useUser } from "@/hooks/useUser";

export function LarenHeader() {
  const pathname = usePathname();
  const { isAuthenticated } = useUser();
  const root = pathname === "/laren";

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07111f]/95 backdrop-blur-xl">
      <div className="container-shell flex h-16 items-center justify-between gap-3 md:h-20">
        <div className="flex min-w-0 items-center gap-3">
          {!root ? (
            <Link aria-label="LAREN ana sayfasına dön" href="/laren"
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 text-slate-200 md:hidden">
              <ArrowLeft aria-hidden="true" className="h-5 w-5" />
            </Link>
          ) : null}
          <Link href="/laren" className="flex min-w-0 items-center gap-3" aria-label="LAREN ana sayfa">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-400/10 text-sky-300">
              <BriefcaseBusiness aria-hidden="true" className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-lg font-bold tracking-[0.1em] text-white">LAREN</span>
              <span className="hidden text-xs text-slate-400 sm:block">Juridisch Advies & Dienstverlening</span>
            </span>
          </Link>
        </div>
        <nav aria-label="LAREN masaüstü menüsü" className="hidden items-center gap-2 md:flex">
          <Link href="/laren" className="rounded-xl px-4 py-3 text-sm text-slate-200 hover:bg-white/10">Ana sayfa</Link>
          <Link href="/laren/new" className="rounded-xl px-4 py-3 text-sm text-slate-200 hover:bg-white/10">Yeni başvuru</Link>
          <Link href="/laren/my" className="rounded-xl px-4 py-3 text-sm text-slate-200 hover:bg-white/10">Dosyalarım</Link>
        </nav>
        <Link href={isAuthenticated ? "/dashboard" : "/auth/login?next=%2Flaren%2Fmy"}
          className="flex min-h-11 shrink-0 items-center gap-2 rounded-xl border border-white/15 px-3 text-sm font-medium text-slate-200">
          {isAuthenticated ? "Hesabım" : "Giriş yap"}
          {!isAuthenticated && <LogIn aria-hidden="true" className="h-4 w-4" />}
        </Link>
      </div>
    </header>
  );
}
