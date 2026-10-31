"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useUser } from "@/hooks/useUser";

export default function Page() {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useUser();

  const [requestedRole, setRequestedRole] = useState("user");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [authLoading, isAuthenticated, router]);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          requested_role: requestedRole,
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("Hesap talebiniz alındı. E-posta doğrulaması gerekiyorsa kutunuzu kontrol edin. Meslekî veya ofis yetkisi verilmedi; ayrıca belge ve görev doğrulaması gerekir.");
    setLoading(false);
  }

  return (
    <main>
      <SiteHeader />

      <section className="container-shell py-16 sm:py-20 md:py-24">
        <div className="mx-auto mb-6 max-w-md">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-white/70 transition hover:text-white"
          >
            ← Ana sayfaya dön
          </Link>
        </div>

        <div className="mx-auto max-w-md rounded-[28px] border border-white/10 bg-white/5 p-6 sm:p-8">
          <h1 className="text-3xl font-semibold text-white">Hesap Oluştur</h1>

          <p className="mt-4 text-sm leading-7 text-slate-300">
            Hesap türü talebi oluşturun; meslekî yetki ayrıca doğrulanır.
          </p>

          <form onSubmit={handleRegister} className="mt-8 space-y-4">
            <select
              value={requestedRole}
              onChange={(e) => setRequestedRole(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="user">Genel Kullanıcı</option>
              <option value="lawyer">Avukat</option>
              <option value="intern">Stajyer</option>
              <option value="office">Ofis</option>
            </select>
            <p className="text-xs leading-5 text-amber-200">Bu seçim meslekî yetki vermez. Avukatlık, stajyerlik ve ofis yetkileri belgeyle ayrıca doğrulanmalıdır.</p>

            <input
              type="text"
              placeholder="Ad Soyad"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
            />

            <input
              type="email"
              placeholder="E-posta"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
            />

            <input
              type="password"
              placeholder="Şifre"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Kayıt oluşturuluyor..." : "Hesap Oluştur"}
            </button>
          </form>

          {message && <p className="mt-4 text-sm text-slate-300">{message}</p>}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}