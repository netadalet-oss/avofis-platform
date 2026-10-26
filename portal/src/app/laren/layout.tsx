import type { ReactNode } from "react";
import { LarenHeader } from "@/components/laren/LarenHeader";
import { LarenMobileNav } from "@/components/laren/LarenMobileNav";
import { SiteFooter } from "@/components/site-footer";

export default function LarenLayout({ children }: { children: ReactNode }) {
  return (
    <div className="laren-shell min-h-screen">
      <LarenHeader />
      {children}
      <div className="hidden md:block"><SiteFooter /></div>
      <LarenMobileNav />
    </div>
  );
}
