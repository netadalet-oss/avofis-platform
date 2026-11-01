"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import { DEFAULT_LOGIN_DESTINATION, safePortalReturnPath } from "@/lib/safe-login-redirect";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, loading } = useUser();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      const safePath = safePortalReturnPath(pathname);
      const next = safePath === DEFAULT_LOGIN_DESTINATION
        ? "" : `?next=${encodeURIComponent(safePath)}`;
      router.replace(`/auth/login${next}`);
    }
  }, [isAuthenticated, loading, pathname, router]);

  if (loading) {
    return (
      <section className="container-shell py-24">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-8 text-sm text-slate-300">
          Oturum kontrol ediliyor...
        </div>
      </section>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
