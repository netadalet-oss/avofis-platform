"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function Page() {
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadHero();
  }, []);

  async function loadHero() {
    const { data } = await supabase
      .from("pages")
      .select("content")
      .eq("slug", "home")
      .single();

    if (data?.content?.hero) {
      setHeroTitle(data.content.hero.title || "");
      setHeroSubtitle(data.content.hero.subtitle || "");
    }
  }

  async function saveHero() {
    setSaving(true);

    await supabase.from("pages").upsert({
      slug: "home",
      content: {
        hero: {
          title: heroTitle,
          subtitle: heroSubtitle
        }
      }
    });

    setSaving(false);
  }

  return (
    <main>
      <SiteHeader />

      <section className="container-shell py-24">
        <div className="rounded-[28px] border border-white/10 bg-white/5 p-8">

          <h1 className="text-3xl font-semibold text-white">
            CMS Yönetimi
          </h1>

          <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
            Ana sayfa içerikleri buradan düzenlenir.
          </p>

          <div className="mt-10 max-w-xl space-y-6">

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Hero Başlık
              </label>

              <input
                value={heroTitle}
                onChange={(e) => setHeroTitle(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm text-slate-400">
                Hero Açıklama
              </label>

              <textarea
                value={heroSubtitle}
                onChange={(e) => setHeroSubtitle(e.target.value)}
                rows={4}
                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none"
              />
            </div>

            <button
              onClick={saveHero}
              disabled={saving}
              className="rounded-xl bg-blue-600 px-6 py-3 text-sm font-medium text-white hover:bg-blue-500 disabled:opacity-60"
            >
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </button>

          </div>

        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
