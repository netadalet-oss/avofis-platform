"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BriefcaseBusiness, CirclePlus, FolderClosed, LayoutDashboard } from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { supabase } from "@/lib/supabase";

export function LarenMobileNav() {
  const pathname = usePathname();
  const { user } = useUser();
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    if (!user) { setIsStaff(false); return; }
    let active = true;
    async function lookup() {
      const { data } = await supabase.from("laren_staff").select("user_id")
        .eq("user_id", user!.id).maybeSingle();
      if (active) setIsStaff(Boolean(data));
    }
    void lookup();
    return () => { active = false; };
  }, [user]);

  const links = [
    { href: "/laren", label: "Ana sayfa", icon: BriefcaseBusiness, selected: pathname === "/laren" },
    { href: "/laren/new", label: "Başvuru", icon: CirclePlus, selected: pathname === "/laren/new" },
    { href: "/laren/my", label: "Dosyalarım", icon: FolderClosed, selected: pathname?.startsWith("/laren/my") },
    ...(isStaff ? [{ href: "/laren/staff", label: "Yönetim", icon: LayoutDashboard, selected: pathname?.startsWith("/laren/staff") }] : []),
  ];

  return (
    <nav aria-label="LAREN mobil gezinme"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-white/15 bg-[#081321]/95 pb-[env(safe-area-inset-bottom)] shadow-2xl backdrop-blur-xl md:hidden">
      <div className="mx-auto flex w-full max-w-lg items-stretch justify-around px-2">
        {links.map(item => {
          const Icon = item.icon;
          return (
            <Link href={item.href} key={item.href}
              aria-current={item.selected ? "page" : undefined}
              className={`flex min-h-[68px] min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-lg px-1 py-2 text-[11px] font-medium ${item.selected ? "text-sky-300" : "text-slate-300"}`}>
              <Icon aria-hidden="true" className="h-[22px] w-[22px]" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
