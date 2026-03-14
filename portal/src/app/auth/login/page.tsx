"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Page() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setMessage(error.message);
    } else {
      window.location.href = "/";
    }

    setLoading(false);
  }

  return (
    <main>
      <SiteHeader />

      <section className="container-shell py-24">
        <div className="mx-auto max-w-md rounded-[28px] border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-semibold text-white">Giriş Yap</h1>

          <p className="mt-4 text-sm leading-7 text-slate-300">
            AvOfis hesabınıza giriş yapın.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
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
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-500"
            >
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>
          </form>

          {message && (
            <p className="mt-4 text-sm text-red-400">{message}</p>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
