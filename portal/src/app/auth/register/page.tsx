"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Page() {
  const [role, setRole] = useState("user");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role,
        },
      },
    });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    const userId = data.user?.id;

    if (userId) {
      await supabase.from("profiles").upsert({
        id: userId,
        full_name: fullName,
        role,
      });
    }

    setMessage("Kayıt başarılı. Giriş yapabilirsiniz.");
    setLoading(false);
  }

  return (
    <main>
      <SiteHeader />

      <section className="container-shell py-24">
        <div className="mx-auto max-w-md rounded-[28px] border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-semibold text-white">Hesap Oluştur</h1>

          <p className="mt-4 text-sm leading-7 text-slate-300">
            Avukat, stajyer ve ofis hesabı için rol seçimi destekli kayıt ekranı.
          </p>

          <form onSubmit={handleRegister} className="mt-8 space-y-4">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none"
            >
              <option value="user">Genel Kullanıcı</option>
              <option value="lawyer">Avukat</option>
              <option value="intern">Stajyer</option>
              <option value="office">Ofis</option>
            </select>

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
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-500"
            >
              {loading ? "Kayıt oluşturuluyor..." : "Hesap Oluştur"}
            </button>
          </form>

          {message && (
            <p className="mt-4 text-sm text-slate-300">{message}</p>
          )}
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
