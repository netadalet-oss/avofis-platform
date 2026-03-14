"use client";

import Link from "next/link";
import { Gavel, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { navigation as defaultNavigation, type NavigationItem } from "@/lib/site";
import { supabase } from "@/lib/supabase";

type NavigationSettingRow = {
  value?: NavigationItem[];
};

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<NavigationItem[]>(defaultNavigation);

  useEffect(() => {
    let mounted = true;

    async function loadNavigation() {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "navigation")
        .single();

      if (!mounted) return;

      if (error || !data?.value || !Array.isArray(data.value)) {
        return;
      }

      const normalizedItems = (data.value as NavigationItem[]).filter(
        (item) =>
          item &&
          typeof item.label === "string" &&
          item.label.trim() &&
          typeof item.href === "string" &&
          item.href.trim(),
      );

      if (normalizedItems.length > 0) {
        setMenuItems(normalizedItems);
      }
    }

    loadNavigation();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07111f]/80 backdrop-blur-xl">
      <div className="container-shell flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/30 bg-gradient-to-br from-sky-400/20 to-blue-600/20 shadow-glow">
            <Gavel className="h-5 w-5 text-sky-300" />
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight">AvOfis</div>
            <div className="text-xs text-slate-400">Hukuk çalışma platformu</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-slate-300 lg:flex">
          {menuItems.map((item) => (
            <a key={`${item.label}-${item.href}`} href={item.href} className="hover:text-white">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <a
            href="/auth/login"
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 hover:border-white/20 hover:bg-white/5"
          >
            Giriş Yap
          </a>
          <a
            href="/auth/register"
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-100"
          >
            Hesap Oluştur
          </a>
        </div>

        <button
          aria-label="Menü"
          className="inline-flex rounded-xl border border-white/10 p-2 text-slate-200 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="border-t border-white/10 bg-[#081321] md:hidden">
          <div className="container-shell flex flex-col gap-3 py-4">
            {menuItems.map((item) => (
              <a
                key={`${item.label}-${item.href}`}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-3">
              <a
                href="/auth/login"
                className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-medium text-slate-100"
              >
                Giriş Yap
              </a>
              <a
                href="/auth/register"
                className="rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-slate-950"
              >
                Hesap Oluştur
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
