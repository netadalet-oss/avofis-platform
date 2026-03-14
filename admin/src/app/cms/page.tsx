"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type NavItem = {
  label: string;
  href: string;
};

export default function Page() {
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [navigation, setNavigation] = useState<NavItem[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadHero();
    loadNavigation();
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

  async function loadNavigation() {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "navigation")
      .single();

    if (data?.value) {
      setNavigation(data.value);
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

  async function saveNavigation() {
    setSaving(true);

    await supabase.from("site_settings").upsert({
      key: "navigation",
      value: navigation
    });

    setSaving(false);
  }

  function updateNav(index: number, field: "label" | "href", value: string) {
    const copy = [...navigation];
    copy[index][field] = value;
    setNavigation(copy);
  }

  function addNav() {
    setNavigation([...navigation, { label: "", href: "" }]);
  }

  function removeNav(index: number) {
    const copy = [...navigation];
    copy.splice(index, 1);
    setNavigation(copy);
  }

  return (
    <main>
      <SiteHeader />

      <section className="container-shell py-24">
        <div className="space-y-16">

          {/* HERO EDITOR */}

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8">
            <h2 className="text-2xl font-semibold text-white">
              Ana Sayfa Hero
            </h2>

            <div className="mt-6 max-w-xl space-y-6">

              <div>
                <label className="mb-2 block text-sm text-slate-400">
                  Hero Başlık
                </label>

                <input
                  value={heroTitle}
                  onChange={(e) => setHeroTitle(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
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
                  className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                />
              </div>

              <button
                onClick={saveHero}
                disabled={saving}
                className="rounded-xl bg-blue-600 px-6 py-3 text-white"
              >
                {saving ? "Kaydediliyor..." : "Hero Kaydet"}
              </button>

            </div>
          </div>


          {/* NAVIGATION EDITOR */}

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8">

            <h2 className="text-2xl font-semibold text-white">
              Menü Yönetimi
            </h2>

            <div className="mt-6 space-y-4">

              {navigation.map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-3 gap-4"
                >

                  <input
                    value={item.label}
                    onChange={(e) =>
                      updateNav(index, "label", e.target.value)
                    }
                    placeholder="Başlık"
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                  />

                  <input
                    value={item.href}
                    onChange={(e) =>
                      updateNav(index, "href", e.target.value)
                    }
                    placeholder="Link"
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                  />

                  <button
                    onClick={() => removeNav(index)}
                    className="rounded-xl bg-red-600 px-4 py-3 text-white"
                  >
                    Sil
                  </button>

                </div>
              ))}

              <div className="flex gap-4 pt-4">

                <button
                  onClick={addNav}
                  className="rounded-xl bg-slate-700 px-6 py-3 text-white"
                >
                  Menü Ekle
                </button>

                <button
                  onClick={saveNavigation}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-white"
                >
                  Menü Kaydet
                </button>

              </div>

            </div>
          </div>

        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
