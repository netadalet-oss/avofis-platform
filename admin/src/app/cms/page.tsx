"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

type NavItem = {
  label: string;
  href: string;
};

type ModuleItem = {
  title: string;
  text: string;
};

type FooterColumn = {
  title: string;
  links: string[];
};

export default function Page() {
  const [heroTitle, setHeroTitle] = useState("");
  const [heroSubtitle, setHeroSubtitle] = useState("");
  const [navigation, setNavigation] = useState<NavItem[]>([]);
  const [modules, setModules] = useState<ModuleItem[]>([]);
  const [footerColumns, setFooterColumns] = useState<FooterColumn[]>([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    loadHero();
    loadNavigation();
    loadModules();
    loadFooter();
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

    if (data?.value && Array.isArray(data.value)) {
      setNavigation(data.value);
    }
  }

  async function loadModules() {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "modules")
      .single();

    if (data?.value && Array.isArray(data.value)) {
      setModules(data.value);
    }
  }

  async function loadFooter() {
    const { data } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "footer")
      .single();

    if (data?.value && Array.isArray(data.value)) {
      setFooterColumns(data.value);
    }
  }

  function reloadAll() {
    loadHero();
    loadNavigation();
    loadModules();
    loadFooter();
    setMessage("İçerik yeniden yüklendi.");
  }

  function openPortal() {
    window.open("https://avofis.com", "_blank");
  }

  async function loadDefaults() {
    try {
      setSaving(true);
      setMessage("");

      const defaultHeroTitle =
        "Hukuk araştırması, belge üretimi ve kariyer ağı tek platformda.";
      const defaultHeroSubtitle =
        "İçtihat, mevzuat, dosya analizi, taslak üretimi, forum, ofis profilleri, staj eşleşmeleri ve profesyonel workspace deneyimini tek bir modern hukuk arayüzünde birleştirin.";

      const defaultNavigation: NavItem[] = [
        { label: "Modüller", href: "#moduller" },
        { label: "İçtihat", href: "#arastirma" },
        { label: "Mevzuat", href: "#arastirma" },
        { label: "Kariyer", href: "#kariyer" },
        { label: "Forum", href: "#topluluk" },
        { label: "Ofisler", href: "#ofisler" },
        { label: "İstatistikler", href: "#istatistikler" },
      ];

      const defaultModules: ModuleItem[] = [
        {
          title: "İçtihat Araştırma",
          text: "Karar arama, filtreleme ve emsal kümeleri.",
        },
        {
          title: "Mevzuat Modülü",
          text: "Madde bazlı görüntüleme ve değişiklik geçmişi.",
        },
        {
          title: "Dosya Analizi",
          text: "Belge yükleme ve hukuki sorun tespiti.",
        },
        {
          title: "Taslak Üretim",
          text: "Dilekçe, savunma ve sözleşme üretimi.",
        },
        {
          title: "Kariyer ve Staj",
          text: "Stajyer ve ofis eşleşme sistemi.",
        },
        {
          title: "Forum ve Topluluk",
          text: "Mesleki tartışma ve bilgi paylaşımı.",
        },
        {
          title: "Profesyonel Workspace",
          text: "Dosya, görev ve ekip yönetimi.",
        },
        {
          title: "Analitik ve Yönetim",
          text: "Platform ve içerik performansı.",
        },
        {
          title: "Güvenlik ve Uyum",
          text: "Rol bazlı erişim ve audit log.",
        },
        {
          title: "Ofis Profilleri",
          text: "Doğrulanmış hukuk bürosu profilleri.",
        },
        {
          title: "Bildirim Sistemi",
          text: "Platform içi ve e-posta bildirimleri.",
        },
        {
          title: "Connect Ekonomisi",
          text: "Platform içi kredi ve görünürlük sistemi.",
        },
      ];

      const defaultFooter: FooterColumn[] = [
        {
          title: "Platform",
          links: [
            "Ana Sayfa",
            "Modüller",
            "İçtihat",
            "Mevzuat",
            "Forum",
            "Kariyer",
          ],
        },
        {
          title: "Kurumsal",
          links: [
            "Hakkında",
            "Yayın İlkeleri",
            "Güvenlik",
            "Gizlilik",
            "İletişim",
          ],
        },
        {
          title: "Destek",
          links: [
            "Yardım Merkezi",
            "Sık Sorulan Sorular",
            "Kullanım Şartları",
            "KVKK",
          ],
        },
      ];

      const { error: heroError } = await supabase.from("pages").upsert({
        slug: "home",
        content: {
          hero: {
            title: defaultHeroTitle,
            subtitle: defaultHeroSubtitle,
          },
        },
      });

      if (heroError) {
        setMessage(`Varsayılan hero yüklenemedi: ${heroError.message}`);
        return;
      }

      const { error: navigationError } = await supabase.from("site_settings").upsert({
        key: "navigation",
        value: defaultNavigation,
      });

      if (navigationError) {
        setMessage(`Varsayılan menü yüklenemedi: ${navigationError.message}`);
        return;
      }

      const { error: modulesError } = await supabase.from("site_settings").upsert({
        key: "modules",
        value: defaultModules,
      });

      if (modulesError) {
        setMessage(`Varsayılan modüller yüklenemedi: ${modulesError.message}`);
        return;
      }

      const { error: footerError } = await supabase.from("site_settings").upsert({
        key: "footer",
        value: defaultFooter,
      });

      if (footerError) {
        setMessage(`Varsayılan footer yüklenemedi: ${footerError.message}`);
        return;
      }

      setHeroTitle(defaultHeroTitle);
      setHeroSubtitle(defaultHeroSubtitle);
      setNavigation(defaultNavigation);
      setModules(defaultModules);
      setFooterColumns(defaultFooter);

      setMessage("Varsayılan içerikler başarıyla yüklendi.");
    } finally {
      setSaving(false);
    }
  }

  async function saveHero() {
    try {
      setSaving(true);
      setMessage("");

      const { error } = await supabase.from("pages").upsert({
        slug: "home",
        content: {
          hero: {
            title: heroTitle,
            subtitle: heroSubtitle,
          },
        },
      });

      if (error) {
        setMessage(`Hero kaydedilemedi: ${error.message}`);
        return;
      }

      setMessage("Hero başarıyla kaydedildi.");
    } finally {
      setSaving(false);
    }
  }

  async function saveNavigation() {
    try {
      setSaving(true);
      setMessage("");

      const { error } = await supabase.from("site_settings").upsert({
        key: "navigation",
        value: navigation,
      });

      if (error) {
        setMessage(`Menü kaydedilemedi: ${error.message}`);
        return;
      }

      setMessage("Menü başarıyla kaydedildi.");
    } finally {
      setSaving(false);
    }
  }

  async function saveModules() {
    try {
      setSaving(true);
      setMessage("");

      const { error } = await supabase.from("site_settings").upsert({
        key: "modules",
        value: modules,
      });

      if (error) {
        setMessage(`Modüller kaydedilemedi: ${error.message}`);
        return;
      }

      setMessage("Modüller başarıyla kaydedildi.");
    } finally {
      setSaving(false);
    }
  }

  async function saveFooter() {
    try {
      setSaving(true);
      setMessage("");

      const { error } = await supabase.from("site_settings").upsert({
        key: "footer",
        value: footerColumns,
      });

      if (error) {
        setMessage(`Footer kaydedilemedi: ${error.message}`);
        return;
      }

      setMessage("Footer başarıyla kaydedildi.");
    } finally {
      setSaving(false);
    }
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

  function updateModule(index: number, field: "title" | "text", value: string) {
    const copy = [...modules];
    copy[index][field] = value;
    setModules(copy);
  }

  function addModule() {
    setModules([...modules, { title: "", text: "" }]);
  }

  function removeModule(index: number) {
    const copy = [...modules];
    copy.splice(index, 1);
    setModules(copy);
  }

  function updateFooterTitle(index: number, value: string) {
    const copy = [...footerColumns];
    copy[index].title = value;
    setFooterColumns(copy);
  }

  function updateFooterLinks(index: number, value: string) {
    const copy = [...footerColumns];
    copy[index].links = value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean);
    setFooterColumns(copy);
  }

  function addFooterColumn() {
    setFooterColumns([...footerColumns, { title: "", links: [] }]);
  }

  function removeFooterColumn(index: number) {
    const copy = [...footerColumns];
    copy.splice(index, 1);
    setFooterColumns(copy);
  }

  return (
    <main>
      <SiteHeader />

      <section className="container-shell py-24">
        <div className="space-y-16">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8">
            <h1 className="text-3xl font-semibold text-white">CMS Yönetimi</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-slate-300">
              Portal ana sayfasındaki temel içerikler buradan yönetilir.
            </p>

            <div className="mt-6 flex flex-wrap gap-4">
              <button
                onClick={reloadAll}
                className="rounded-xl bg-slate-700 px-5 py-3 text-white"
              >
                İçeriği Yeniden Yükle
              </button>

              <button
                onClick={openPortal}
                className="rounded-xl bg-emerald-600 px-5 py-3 text-white"
              >
                Portalı Aç
              </button>

              <button
                onClick={loadDefaults}
                disabled={saving}
                className="rounded-xl bg-orange-600 px-5 py-3 text-white disabled:opacity-60"
              >
                {saving ? "Yükleniyor..." : "Varsayılan Verileri Yükle"}
              </button>
            </div>

            {message ? (
              <div className="mt-6 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200">
                {message}
              </div>
            ) : null}
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8">
            <h2 className="text-2xl font-semibold text-white">Ana Sayfa Hero</h2>

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
                className="rounded-xl bg-blue-600 px-6 py-3 text-white disabled:opacity-60"
              >
                {saving ? "Kaydediliyor..." : "Hero Kaydet"}
              </button>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8">
            <h2 className="text-2xl font-semibold text-white">Menü Yönetimi</h2>

            <div className="mt-6 space-y-4">
              {navigation.map((item, index) => (
                <div key={index} className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <input
                    value={item.label}
                    onChange={(e) => updateNav(index, "label", e.target.value)}
                    placeholder="Başlık"
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                  />

                  <input
                    value={item.href}
                    onChange={(e) => updateNav(index, "href", e.target.value)}
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

              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={addNav}
                  className="rounded-xl bg-slate-700 px-6 py-3 text-white"
                >
                  Menü Ekle
                </button>

                <button
                  onClick={saveNavigation}
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-white disabled:opacity-60"
                >
                  {saving ? "Kaydediliyor..." : "Menü Kaydet"}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8">
            <h2 className="text-2xl font-semibold text-white">Modül Kartları</h2>

            <div className="mt-6 space-y-4">
              {modules.map((item, index) => (
                <div key={index} className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <input
                    value={item.title}
                    onChange={(e) => updateModule(index, "title", e.target.value)}
                    placeholder="Başlık"
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                  />

                  <input
                    value={item.text}
                    onChange={(e) => updateModule(index, "text", e.target.value)}
                    placeholder="Açıklama"
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                  />

                  <button
                    onClick={() => removeModule(index)}
                    className="rounded-xl bg-red-600 px-4 py-3 text-white"
                  >
                    Sil
                  </button>
                </div>
              ))}

              <div className="flex flex-wrap gap-4 pt-4">
                <button
                  onClick={addModule}
                  className="rounded-xl bg-slate-700 px-6 py-3 text-white"
                >
                  Modül Ekle
                </button>

                <button
                  onClick={saveModules}
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-white disabled:opacity-60"
                >
                  {saving ? "Kaydediliyor..." : "Modülleri Kaydet"}
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8">
            <h2 className="text-2xl font-semibold text-white">Footer Yönetimi</h2>

            <div className="mt-6 space-y-6">
              {footerColumns.map((column, index) => (
                <div key={index} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_auto]">
                    <input
                      value={column.title}
                      onChange={(e) => updateFooterTitle(index, e.target.value)}
                      placeholder="Kolon başlığı"
                      className="rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                    />

                    <button
                      onClick={() => removeFooterColumn(index)}
                      className="rounded-xl bg-red-600 px-4 py-3 text-white"
                    >
                      Sil
                    </button>
                  </div>

                  <div className="mt-4">
                    <label className="mb-2 block text-sm text-slate-400">
                      Linkler (her satıra bir link)
                    </label>

                    <textarea
                      value={column.links.join("\n")}
                      onChange={(e) => updateFooterLinks(index, e.target.value)}
                      rows={5}
                      className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white"
                    />
                  </div>
                </div>
              ))}

              <div className="flex flex-wrap gap-4 pt-2">
                <button
                  onClick={addFooterColumn}
                  className="rounded-xl bg-slate-700 px-6 py-3 text-white"
                >
                  Footer Kolonu Ekle
                </button>

                <button
                  onClick={saveFooter}
                  disabled={saving}
                  className="rounded-xl bg-blue-600 px-6 py-3 text-white disabled:opacity-60"
                >
                  {saving ? "Kaydediliyor..." : "Footer Kaydet"}
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
