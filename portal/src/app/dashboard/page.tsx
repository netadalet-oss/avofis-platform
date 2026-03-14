"use client";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { LogoutButton } from "@/components/auth/LogoutButton";
import { useUser } from "@/hooks/useUser";

export default function Page() {
  const { user } = useUser();

  return (
    <ProtectedRoute>
      <main>
        <SiteHeader />
        <section className="container-shell py-24">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <div>
                <h1 className="text-3xl font-semibold text-white">Kullanıcı Paneli</h1>
                <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
                  Profil, başvurular, taslaklar, analizler, dosyalar, görevler ve bildirimler için kullanıcı alanı.
                </p>
                <div className="mt-6 space-y-2 text-sm text-slate-300">
                  <p>
                    <span className="text-slate-400">Kullanıcı:</span>{" "}
                    {user?.user_metadata?.full_name || user?.email || "Bilinmiyor"}
                  </p>
                  <p>
                    <span className="text-slate-400">E-posta:</span> {user?.email || "-"}
                  </p>
                  <p>
                    <span className="text-slate-400">Rol:</span>{" "}
                    {user?.user_metadata?.role || "user"}
                  </p>
                </div>
              </div>

              <div className="shrink-0">
                <LogoutButton />
              </div>
            </div>
          </div>
        </section>
        <SiteFooter />
      </main>
    </ProtectedRoute>
  );
}
