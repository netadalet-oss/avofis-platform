"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileSearch,
  FileText,
  GraduationCap,
  Layers3,
  MessageSquareMore,
  Scale,
  Search,
  ShieldCheck,
  Users2,
  Workflow
} from "lucide-react";
import { EditableText } from "@/components/cms/EditableText";
import { useEditMode } from "@/components/providers/EditModeProvider";
import { ModuleGrid } from "@/components/module-grid";
import { SectionTitle } from "@/components/section-title";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { useUser } from "@/hooks/useUser";
import { stats } from "@/lib/site";
import { supabase } from "@/lib/supabase";

const featurePills = [
  "İçtihat araştırma",
  "Mevzuat erişimi",
  "Dosya analizi",
  "Taslak üretimi",
  "Forum ve topluluk",
  "Staj ve kariyer",
  "Workspace",
  "Connect ekonomisi"
];

const researchCards = [
  {
    title: "Merkezi hukuk araştırması",
    text: "İçtihat, mevzuat, rehber içerik ve topluluk tartışmalarını aynı araştırma deneyiminde birleştirir."
  },
  {
    title: "Bağlantılı bilgi akışı",
    text: "Bir kararın ilgili mevzuatını, forum tartışmasını ve ilişkili içeriklerini tek akışta sunar."
  },
  {
    title: "Çalışılabilir hukuk verisi",
    text: "Sadece okuma değil; kaydetme, not alma, sınıflandırma ve üretim için aktif kullanım sağlar."
  }
];

const careerColumns = [
  {
    title: "Stajyerler için",
    points: [
      "Profil ve CV oluşturma",
      "İlanlara başvuru ve takip",
      "Ofis profillerini inceleme",
      "Topluluk ve rehber alanlarına erişim"
    ]
  },
  {
    title: "Ofisler için",
    points: [
      "İlan yayınlama ve aday havuzu",
      "Başvuru pipeline yönetimi",
      "Mesajlaşma ve değerlendirme akışı",
      "Marka görünürlüğü ve ekip profilleri"
    ]
  }
];

const officeHighlights = [
  "Doğrulanmış profil yapısı",
  "Uzmanlık alanı görünürlüğü",
  "Staj ve kariyer ilanları",
  "Ofis ekip yapısı ve rol modeli"
];

const defaultHeroTitle =
  "Hukuk araştırması, belge üretimi ve kariyer ağı tek platformda.";

const defaultHeroSubtitle =
  "İçtihat, mevzuat, dosya analizi, taslak üretimi, forum, ofis profilleri, staj eşleşmeleri ve profesyonel workspace deneyimini tek bir modern hukuk arayüzünde birleştirin.";

type HomeCmsContent = {
  hero?: {
    title?: string;
    subtitle?: string;
  };
};

type EditableHero = {
  title: string;
  subtitle: string;
};

export default function HomePage() {
  const { session, loading: authLoading } = useUser();
  const { editMode, setEditMode } = useEditMode();

  const [cmsContent, setCmsContent] = useState<HomeCmsContent | null>(null);
  const [heroDraft, setHeroDraft] = useState<EditableHero>({
    title: "",
    subtitle: ""
  });
  const [heroSaving, setHeroSaving] = useState(false);
  const [heroMessage, setHeroMessage] = useState("");

  const role = useMemo(() => {
    const rawRole = session?.user?.user_metadata?.role;
    return typeof rawRole === "string" ? rawRole.toLowerCase() : "";
  }, [session]);

  const isAdmin = role === "admin" || role === "super_admin";

  useEffect(() => {
    let mounted = true;

    async function loadCMS() {
      const { data, error } = await supabase
        .from("pages")
        .select("content")
        .eq("slug", "home")
        .single();

      if (!mounted) return;

      if (error || !data?.content) {
        setHeroDraft({
          title: defaultHeroTitle,
          subtitle: defaultHeroSubtitle
        });
        return;
      }

      const content = data.content as HomeCmsContent;

      setCmsContent(content);
      setHeroDraft({
        title: content?.hero?.title || defaultHeroTitle,
        subtitle: content?.hero?.subtitle || defaultHeroSubtitle
      });
    }

    loadCMS();

    return () => {
      mounted = false;
    };
  }, []);

  async function saveHeroField(field: "title" | "subtitle", value: string) {
    const nextHero = {
      title:
        field === "title"
          ? value
          : (cmsContent?.hero?.title || heroDraft.title || defaultHeroTitle),
      subtitle:
        field === "subtitle"
          ? value
          : (cmsContent?.hero?.subtitle ||
              heroDraft.subtitle ||
              defaultHeroSubtitle),
    };

    try {
      setHeroSaving(true);
      setHeroMessage("");

      const { error } = await supabase.from("pages").upsert({
        slug: "home",
        content: {
          hero: nextHero
        }
      });

      if (error) {
        setHeroMessage(`Hero kaydedilemedi: ${error.message}`);
        return;
      }

      setCmsContent((prev) => ({
        ...(prev || {}),
        hero: nextHero
      }));

      setHeroDraft(nextHero);
      setHeroMessage("Hero başarıyla kaydedildi.");
    } finally {
      setHeroSaving(false);
    }
  }

  function openHeroEditMode() {
    setEditMode(true);
    setHeroMessage("");
    setHeroDraft({
      title: cmsContent?.hero?.title || defaultHeroTitle,
      subtitle: cmsContent?.hero?.subtitle || defaultHeroSubtitle
    });
  }

  function cancelHeroEditMode() {
    setEditMode(false);
    setHeroMessage("");
    setHeroDraft({
      title: cmsContent?.hero?.title || defaultHeroTitle,
      subtitle: cmsContent?.hero?.subtitle || defaultHeroSubtitle
    });
  }

  return (
    <main className="min-h-screen">
      <SiteHeader />

      <section className="relative overflow-hidden">
        <div className="container-shell grid gap-14 pb-20 pt-16 lg:grid-cols-[1.1fr_0.9fr] lg:pb-28 lg:pt-20">
          <div className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/10 px-4 py-2 text-sm text-sky-200">
              <BadgeCheck className="h-4 w-4" />
              Açık erişim araştırma + profesyonel çalışma katmanı
            </div>

            {isAdmin && !authLoading ? (
              <div className="mb-4 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    if (editMode) {
                      cancelHeroEditMode();
                    } else {
                      openHeroEditMode();
                    }
                  }}
                  className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-200"
                >
                  {editMode ? "Düzenlemeyi Kapat" : "Düzenleme Modu"}
                </button>

                {heroSaving ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                    Kaydediliyor...
                  </div>
                ) : null}

                {heroMessage ? (
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200">
                    {heroMessage}
                  </div>
                ) : null}
              </div>
            ) : null}

            <EditableText
              value={cmsContent?.hero?.title || ""}
              defaultValue={defaultHeroTitle}
              tag="h1"
              className="max-w-4xl text-4xl font-semibold tracking-tight text-white md:text-6xl md:leading-[1.05]"
              inputClassName="w-full max-w-4xl rounded-2xl border border-amber-400/30 bg-white/5 px-5 py-4 text-3xl font-semibold tracking-tight text-white outline-none md:text-5xl"
              placeholder="Hero başlık"
              onSave={async (nextValue) => {
                if (!editMode) return;
                await saveHeroField("title", nextValue);
              }}
            />

            <div className="mt-6">
              <EditableText
                value={cmsContent?.hero?.subtitle || ""}
                defaultValue={defaultHeroSubtitle}
                tag="p"
                multiline
                rows={5}
                className="max-w-2xl text-base leading-8 text-slate-300 md:text-lg"
                inputClassName="w-full max-w-2xl rounded-2xl border border-amber-400/30 bg-white/5 px-5 py-4 text-base leading-8 text-slate-200 outline-none"
                placeholder="Hero açıklama"
                onSave={async (nextValue) => {
                  if (!editMode) return;
                  await saveHeroField("subtitle", nextValue);
                }}
              />
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {featurePills.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200"
                >
                  {item}
                </span>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <a
                href="#moduller"
                className="inline-flex items-center gap-2 rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-slate-950 transition hover:bg-slate-100"
              >
                Platformu Keşfet
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href="#arastirma"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-white transition hover:border-white/20 hover:bg-white/10"
              >
                Modülleri İncele
                <ChevronRight className="h-4 w-4" />
              </a>
            </div>

            <div className="mt-12 grid max-w-2xl grid-cols-2 gap-4 md:grid-cols-4">
              {stats.slice(0, 4).map((item) => (
                <div
                  key={item.label}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                >
                  <div className="text-2xl font-semibold text-white">
                    {item.value}
                  </div>
                  <div className="mt-1 text-xs leading-5 text-slate-400">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -left-10 top-10 h-28 w-28 rounded-full bg-sky-400/20 blur-3xl" />
            <div className="absolute -right-4 bottom-10 h-32 w-32 rounded-full bg-blue-500/20 blur-3xl" />

            <div className="relative rounded-[28px] border border-white/10 bg-white/5 p-4 shadow-2xl shadow-black/30 backdrop-blur-xl">
              <div className="rounded-[24px] border border-white/10 bg-[#081321] p-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div>
                    <div className="text-sm font-semibold text-white">
                      Araştırma Paneli
                    </div>
                    <div className="text-xs text-slate-400">
                      İçtihat + mevzuat + topluluk akışı
                    </div>
                  </div>
                  <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                    Canlı yapı
                  </div>
                </div>

                <div className="mt-4 rounded-2xl border border-white/10 bg-slate-900/80 p-4">
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-slate-300">
                    <Search className="h-4 w-4 text-sky-300" />
                    Karar, kanun, konu, ofis, ilan veya forum başlığı ara...
                  </div>

                  <div className="mt-4 grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="text-xs uppercase tracking-[0.18em] text-slate-400">
                              İçtihat sonucu
                            </div>
                            <div className="mt-2 text-base font-semibold text-white">
                              Yargıtay 9. HD · İşçilik alacaklarında hesaplama
                              yöntemi
                            </div>
                            <p className="mt-2 text-sm leading-6 text-slate-300">
                              Karar özeti, ilgili mevzuat maddeleri, benzer
                              kararlar ve forum tartışmaları aynı akışta.
                            </p>
                          </div>
                          <div className="rounded-xl border border-sky-400/20 bg-sky-400/10 p-3">
                            <BookOpen className="h-5 w-5 text-sky-300" />
                          </div>
                        </div>
                        <div className="mt-4 flex flex-wrap gap-2 text-xs text-slate-300">
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                            İş Hukuku
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                            Ücret Alacağı
                          </span>
                          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
                            Emsal Kümeleri
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="flex items-center gap-3">
                            <Scale className="h-5 w-5 text-indigo-300" />
                            <div className="text-sm font-semibold">
                              İlgili mevzuat
                            </div>
                          </div>
                          <div className="mt-3 text-sm leading-6 text-slate-300">
                            TBK madde bağlantıları ve değişiklik geçmişi tek
                            görünümde.
                          </div>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                          <div className="flex items-center gap-3">
                            <MessageSquareMore className="h-5 w-5 text-cyan-300" />
                            <div className="text-sm font-semibold">
                              Topluluk yorumu
                            </div>
                          </div>
                          <div className="mt-3 text-sm leading-6 text-slate-300">
                            Konuya ait forum başlıkları ve uzman katkıları
                            bağlantılı.
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-sm font-semibold">
                        Profesyonel Çalışma Alanı
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        Aynı dosyada üretim ve takip
                      </div>

                      <div className="mt-4 space-y-3">
                        {[
                          { label: "Dosya analizi oluşturuldu", icon: Workflow },
                          { label: "İstinaf taslağı hazırlandı", icon: FileText },
                          { label: "Ekip görevi atandı", icon: Users2 },
                          { label: "Süre hesabı eklendi", icon: Clock3 }
                        ].map((item) => {
                          const Icon = item.icon;
                          return (
                            <div
                              key={item.label}
                              className="flex items-center gap-3 rounded-xl border border-white/10 bg-slate-950/50 px-3 py-3"
                            >
                              <div className="rounded-lg border border-white/10 bg-white/5 p-2">
                                <Icon className="h-4 w-4 text-sky-300" />
                              </div>
                              <div className="text-sm text-slate-200">
                                {item.label}
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <div className="mt-4 rounded-xl border border-emerald-400/15 bg-emerald-400/10 p-4 text-sm text-emerald-200">
                        Connect cüzdanı, bildirimler ve dosya geçmişi aynı
                        panelde görünür.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-black/20 py-6">
        <div className="container-shell flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-medium text-white">
              Açık erişim bilgi katmanı + üyelik tabanlı profesyonel alan
            </div>
            <div className="text-sm text-slate-400">
              Hukuk araştırmasını, üretimi ve kariyer ağını tek yapı altında
              toplar.
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300">
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
              Şeffaf yapı
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
              Güvenli veri yönetimi
            </span>
            <span className="rounded-full border border-white/10 bg-white/5 px-3 py-2">
              Yönetilebilir içerik sistemi
            </span>
          </div>
        </div>
      </section>

      <ModuleGrid />

      <section id="arastirma" className="bg-black/20 py-24">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <SectionTitle
              eyebrow="Araştırma katmanı"
              title="İçtihat ve mevzuat erişimini çalışılabilir bir hukuk deneyimine dönüştürür."
              text="Karar arama, mevzuat görüntüleme, konu filtreleri, benzer içerikler, notlar, kayıt listeleri ve ilişkili topluluk tartışmaları tek düzende sunulur."
            />

            <div className="mt-8 space-y-4">
              {researchCards.map((card) => (
                <div
                  key={card.title}
                  className="rounded-2xl border border-white/10 bg-white/5 p-5"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-300" />
                    <div>
                      <div className="text-base font-semibold text-white">
                        {card.title}
                      </div>
                      <p className="mt-2 text-sm leading-7 text-slate-300">
                        {card.text}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-[#0a1525] p-5 shadow-2xl shadow-black/25">
            <div className="grid gap-5 md:grid-cols-[1fr_0.82fr]">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold text-white">
                      İçtihat Arama
                    </div>
                    <div className="text-xs text-slate-400">
                      Mahkeme, konu, tarih ve sonuç tipi filtreleri
                    </div>
                  </div>
                  <FileSearch className="h-5 w-5 text-sky-300" />
                </div>
                <div className="mt-4 space-y-3 text-sm">
                  {[
                    "Yargıtay / Danıştay / AYM filtreleri",
                    "Karar özeti ve tam metin görünümü",
                    "Emsal karar önerileri",
                    "Kişisel not ve kayıt listeleri"
                  ].map((item) => (
                    <div
                      key={item}
                      className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-slate-200"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-3">
                    <Scale className="h-5 w-5 text-indigo-300" />
                    <div>
                      <div className="text-sm font-semibold text-white">
                        Mevzuat görünümü
                      </div>
                      <div className="text-xs text-slate-400">
                        Madde bazlı arama ve değişiklik geçmişi
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 h-28 rounded-2xl border border-dashed border-white/10 bg-slate-950/50 p-4 text-sm leading-6 text-slate-300">
                    TBK · Madde bazlı görünüm
                    <br />
                    Eski / yeni metin karşılaştırması
                    <br />
                    İlişkili içtihat bağlantıları
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center gap-3">
                    <Layers3 className="h-5 w-5 text-cyan-300" />
                    <div>
                      <div className="text-sm font-semibold text-white">
                        Birleşik arama
                      </div>
                      <div className="text-xs text-slate-400">
                        İçtihat + mevzuat + forum + ofis + ilan
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-300">
                    {[
                      "Global search",
                      "Kaydedilen aramalar",
                      "Arama alarmı",
                      "Filtre geçmişi"
                    ].map((tag) => (
                      <div
                        key={tag}
                        className="rounded-xl border border-white/10 bg-slate-950/50 px-3 py-2.5"
                      >
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container-shell py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_1fr]">
          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-3">
                <FileText className="h-5 w-5 text-sky-300" />
              </div>
              <div>
                <div className="text-xl font-semibold text-white">
                  Taslak Üretim ve Dosya Analizi
                </div>
                <div className="text-sm text-slate-400">
                  Hukuki metin üretimi ve dosya değerlendirme motoru
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {[
                "Dava dilekçesi",
                "Cevap dilekçesi",
                "Savunma",
                "İstinaf / temyiz",
                "Sözleşme",
                "Hukuki görüş",
                "Risk analizi",
                "Olay kronolojisi"
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-4 text-sm text-slate-200"
                >
                  {item}
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm leading-7 text-slate-300">
              Belge yükleme, hukuki sorun tespiti, içtihat önerisi, mevzuat
              bağlantıları ve üretim akışı tek çalışma yüzeyinde ilerler.
            </p>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-8">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-3">
                <Users2 className="h-5 w-5 text-sky-300" />
              </div>
              <div>
                <div className="text-xl font-semibold text-white">
                  Profesyonel Workspace
                </div>
                <div className="text-sm text-slate-400">
                  Takım çalışması, belge yönetimi ve görev takibi
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {[
                "Dosya klasörleri ve paylaşılan belgeler",
                "Görev atama, süre takibi ve not sistemi",
                "Versiyon geçmişi ve ortak çalışma düzeni",
                "Mesajlaşma, bildirim ve çalışma akışları"
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-white/10 bg-slate-950/50 p-4"
                >
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-300" />
                  <div className="text-sm leading-7 text-slate-200">
                    {item}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-2xl border border-sky-400/15 bg-sky-400/10 p-4 text-sm leading-7 text-sky-100">
              Rol bazlı erişim, güvenli veri yönetimi ve ekip içi işbirliği
              mantığıyla tasarlanmıştır.
            </div>
          </div>
        </div>
      </section>

      <section id="kariyer" className="bg-black/20 py-24">
        <div className="container-shell">
          <SectionTitle
            eyebrow="Kariyer ağı"
            title="Stajyerler ve hukuk büroları için güçlü, şeffaf ve ölçülebilir bir eşleşme alanı."
            text="İlan yayınlama, başvuru, aday değerlendirme, ofis görünürlüğü, kariyer içerikleri ve profil bazlı eşleşme önerileri aynı modülde ilerler."
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1fr_0.9fr]">
            {careerColumns.map((column, index) => (
              <div
                key={column.title}
                className="rounded-[28px] border border-white/10 bg-white/5 p-7"
              >
                <div className="mb-5 flex items-center gap-3">
                  <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-3">
                    {index === 0 ? (
                      <GraduationCap className="h-5 w-5 text-sky-300" />
                    ) : (
                      <Building2 className="h-5 w-5 text-sky-300" />
                    )}
                  </div>
                  <div className="text-xl font-semibold text-white">
                    {column.title}
                  </div>
                </div>
                <div className="space-y-3">
                  {column.points.map((point) => (
                    <div
                      key={point}
                      className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-4 text-sm leading-7 text-slate-200"
                    >
                      {point}
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <div className="rounded-[28px] border border-white/10 bg-gradient-to-b from-sky-400/10 to-white/5 p-7">
              <div className="text-xl font-semibold text-white">
                Canlı metrikler
              </div>
              <div className="mt-6 grid grid-cols-2 gap-4">
                {[
                  { value: "420+", label: "Aktif ilan" },
                  { value: "350+", label: "Ofis profili" },
                  { value: "7.2K+", label: "Başvuru" },
                  { value: "%68", label: "Eşleşme dönüşümü" }
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-white/10 bg-slate-950/50 p-4"
                  >
                    <div className="text-2xl font-semibold text-white">
                      {item.value}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      {item.label}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/50 p-4 text-sm leading-7 text-slate-300">
                Başvuru pipeline, mesajlaşma, kısa liste ve ofis görünürlüğü
                aynı kariyer omurgasına bağlıdır.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="topluluk" className="container-shell py-24">
        <div className="grid gap-10 lg:grid-cols-[0.92fr_1.08fr]">
          <div>
            <SectionTitle
              eyebrow="Forum ve topluluk"
              title="Hukuk profesyonelleri, akademisyenler ve öğrenciler için yaşayan bilgi ağı."
              text="Soru-cevap, mevzuat yorumları, içtihat değerlendirmeleri, staj deneyimleri ve mesleki tartışmalar kontrollü moderasyon yapısıyla gelişir."
            />
            <div className="mt-8 space-y-4">
              {[
                "Medeni hukuk, ceza hukuku, idare hukuku, iş hukuku ve diğer uzmanlık alanları",
                "En iyi cevap, oylama, etiketleme, takip ve raporlama sistemi",
                "Doğrulanmış uzman profilleri ve katkı görünürlüğü",
                "İçtihat ve mevzuat sayfalarıyla bağlantılı tartışmalar"
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-7 text-slate-300"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[28px] border border-white/10 bg-white/5 p-6">
            <div className="grid gap-5 md:grid-cols-2">
              {[
                {
                  title: "İçtihat Tartışmaları",
                  meta: "248 başlık",
                  text: "Kararların gerekçesi, uygulama alanı ve emsal etkisi üzerine uzman görüşleri."
                },
                {
                  title: "Mevzuat Değerlendirmeleri",
                  meta: "182 başlık",
                  text: "Madde değişiklikleri, yorum farkları ve uygulamaya etkiler."
                },
                {
                  title: "Staj ve Kariyer Deneyimleri",
                  meta: "331 başlık",
                  text: "Ofis kültürü, başvuru süreci ve mesleğe geçiş deneyimleri."
                },
                {
                  title: "Mesleki Uygulama",
                  meta: "416 başlık",
                  text: "Ofis yönetimi, süreç verimliliği ve profesyonel iş akışı önerileri."
                }
              ].map((item) => (
                <article
                  key={item.title}
                  className="rounded-[24px] border border-white/10 bg-slate-950/50 p-5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-base font-semibold text-white">
                      {item.title}
                    </div>
                    <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                      {item.meta}
                    </div>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-300">
                    {item.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="ofisler" className="bg-black/20 py-24">
        <div className="container-shell">
          <SectionTitle
            eyebrow="Ofis profilleri"
            title="Hukuk büroları için modern, güvenilir ve görünür bir profesyonel vitrin."
            text="Ofis uzmanlık alanları, ekip yapısı, staj ilanları, doğrulanmış profil bilgileri ve işbirliği olanakları tek profilde sunulur."
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1fr_1fr]">
            <div className="rounded-[28px] border border-white/10 bg-white/5 p-7 lg:col-span-2">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-5">
                <div>
                  <div className="text-xl font-semibold text-white">
                    Örnek ofis görünümü
                  </div>
                  <div className="text-sm text-slate-400">
                    Kurumsal profil · uzmanlık alanı · ekip · ilanlar
                  </div>
                </div>
                <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-300">
                  Doğrulanmış Ofis
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
                <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-lg font-semibold text-white">
                    AH
                  </div>
                  <div className="mt-4 text-lg font-semibold text-white">
                    Avo Legal Partners
                  </div>
                  <div className="mt-1 text-sm text-slate-400">
                    İstanbul · Ticaret Hukuku · İş Hukuku
                  </div>
                </div>
                <div className="grid gap-3">
                  {officeHighlights.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-4 text-sm text-slate-200"
                    >
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-7">
              <div className="text-xl font-semibold text-white">
                Platform avantajları
              </div>
              <div className="mt-5 space-y-3">
                {[
                  "Merkezi hukuk araştırması",
                  "Hızlı belge üretimi",
                  "Güvenli ekip işbirliği",
                  "Ölçülebilir kariyer dönüşümü",
                  "Topluluk ve uzman katkısı",
                  "Admin panelden yönetilebilir içerik"
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-white/10 bg-slate-950/50 px-4 py-4 text-sm text-slate-200"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="istatistikler" className="container-shell py-24">
        <SectionTitle
          eyebrow="Şeffaf istatistikler"
          title="Platform kullanımını görünür, anlaşılır ve ölçülebilir hale getirir."
          text="Kullanıcı sayısı, içerik performansı, forum hareketliliği, kariyer dönüşümü ve belge üretim yoğunluğu panel ve public alan arasında tutarlı bir veri akışına bağlanır."
        />
        <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {stats.map((item) => (
            <div
              key={item.label}
              className="rounded-[26px] border border-white/10 bg-white/5 p-6"
            >
              <div className="text-3xl font-semibold text-white">
                {item.value}
              </div>
              <div className="mt-2 text-sm text-slate-400">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-r from-sky-400/15 via-white/5 to-indigo-400/15 py-20">
        <div className="container-shell flex flex-col items-start justify-between gap-8 rounded-[32px] border border-white/10 bg-black/20 px-6 py-10 md:flex-row md:items-center">
          <div>
            <div className="text-3xl font-semibold tracking-tight text-white">
              AvOfis ile modern hukuk çalışma düzenine geçin.
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">
              Araştırma, üretim, kariyer, topluluk ve yönetim katmanlarını tek
              bir platformda birleştiren ölçeklenebilir hukuk altyapısını
              kullanın.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <a
              href="/auth/register"
              className="rounded-2xl bg-white px-6 py-4 text-sm font-semibold text-slate-950 hover:bg-slate-100"
            >
              Hesap Oluştur
            </a>
            <a
              href="/auth/login"
              className="rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-sm font-semibold text-white hover:bg-white/10"
            >
              Giriş Yap
            </a>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}