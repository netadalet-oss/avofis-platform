"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin() {
    try {
      setLoading(true);
      setMessage("");

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setMessage(`Giriş başarısız: ${error.message}`);
        return;
      }

      router.replace("/cms");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <SiteHeader />

      <section className="container-shell py-24">
        <div className="mx-auto max-w-md rounded-[28px] border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-semibold text-white">Admin Girişi</h1>
          <p className="mt-3 text-sm leading-7 text-slate-300">
            CMS ve yönetim alanına erişmek için giriş yapın.
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block text-sm text-slate-400">
                E-posta
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                placeholder="ornek@avofis.com"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Şifre
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                placeholder="Şifreniz"
              />
            </div>

            {message ? (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {message}
              </div>
            ) : null}

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full rounded-xl bg-blue-600 px-6 py-3 text-white disabled:opacity-60"
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}