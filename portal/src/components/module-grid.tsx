"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";
import { useUser } from "@/hooks/useUser";
import { modules as defaultModules, type ModuleItem } from "@/lib/site";
import { SectionTitle } from "@/components/section-title";
import { supabase } from "@/lib/supabase";

type CmsModuleItem = {
  title: string;
  text: string;
};

export function ModuleGrid() {
  const { session, loading: authLoading } = useUser();

  const [moduleItems, setModuleItems] = useState<ModuleItem[]>(defaultModules);
  const [editMode, setEditMode] = useState(false);
  const [moduleDraft, setModuleDraft] = useState<CmsModuleItem[]>(
    defaultModules.map((item) => ({
      title: item.title,
      text: item.text,
    })),
  );
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const role = useMemo(() => {
    const rawRole = session?.user?.user_metadata?.role;
    return typeof rawRole === "string" ? rawRole.toLowerCase() : "";
  }, [session]);

  const isAdmin = role === "admin" || role === "super_admin";

  useEffect(() => {
    let mounted = true;

    async function loadModules() {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "modules")
        .single();

      if (!mounted) return;

      if (error || !data?.value || !Array.isArray(data.value)) {
        setModuleDraft(
          defaultModules.map((item) => ({
            title: item.title,
            text: item.text,
          })),
        );
        return;
      }

      const cmsModules = (data.value as CmsModuleItem[]).filter(
        (item) =>
          item &&
          typeof item.title === "string" &&
          item.title.trim() &&
          typeof item.text === "string" &&
          item.text.trim(),
      );

      if (cmsModules.length === 0) {
        setModuleDraft(
          defaultModules.map((item) => ({
            title: item.title,
            text: item.text,
          })),
        );
        return;
      }

      const mergedModules: ModuleItem[] = cmsModules.map((cmsItem) => {
        const matchedDefault =
          defaultModules.find((item) => item.title === cmsItem.title) ??
          defaultModules.find((item) =>
            item.title.toLowerCase().includes(cmsItem.title.toLowerCase()),
          ) ??
          defaultModules.find((item) =>
            cmsItem.title.toLowerCase().includes(item.title.toLowerCase()),
          ) ??
          defaultModules[0];

        return {
          icon: matchedDefault.icon,
          title: cmsItem.title,
          text: cmsItem.text,
        };
      });

      setModuleItems(mergedModules);
      setModuleDraft(
        cmsModules.map((item) => ({
          title: item.title,
          text: item.text,
        })),
      );
    }

    loadModules();

    return () => {
      mounted = false;
    };
  }, []);

  function openEditMode() {
    setEditMode(true);
    setMessage("");
    setModuleDraft(
      moduleItems.map((item) => ({
        title: item.title,
        text: item.text,
      })),
    );
  }

  function cancelEditMode() {
    setEditMode(false);
    setMessage("");
    setModuleDraft(
      moduleItems.map((item) => ({
        title: item.title,
        text: item.text,
      })),
    );
  }

  function updateDraftItem(
    index: number,
    field: keyof CmsModuleItem,
    value: string,
  ) {
    setModuleDraft((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: value,
      };
      return copy;
    });
  }

  function addDraftItem() {
    setModuleDraft((prev) => [...prev, { title: "", text: "" }]);
  }

  function removeDraftItem(index: number) {
    setModuleDraft((prev) => prev.filter((_, i) => i !== index));
  }

  async function saveModulesInline() {
    try {
      setSaving(true);
      setMessage("");

      const normalizedModules = moduleDraft
        .map((item) => ({
          title: typeof item.title === "string" ? item.title.trim() : "",
          text: typeof item.text === "string" ? item.text.trim() : "",
        }))
        .filter((item) => item.title && item.text);

      if (normalizedModules.length === 0) {
        setMessage("En az bir geçerli modül gerekli.");
        return;
      }

      const { error } = await supabase.from("site_settings").upsert({
        key: "modules",
        value: normalizedModules,
      });

      if (error) {
        setMessage(`Modüller kaydedilemedi: ${error.message}`);
        return;
      }

      const mergedModules: ModuleItem[] = normalizedModules.map((cmsItem) => {
        const matchedDefault =
          defaultModules.find((item) => item.title === cmsItem.title) ??
          defaultModules.find((item) =>
            item.title.toLowerCase().includes(cmsItem.title.toLowerCase()),
          ) ??
          defaultModules.find((item) =>
            cmsItem.title.toLowerCase().includes(item.title.toLowerCase()),
          ) ??
          defaultModules[0];

        return {
          icon: matchedDefault.icon,
          title: cmsItem.title,
          text: cmsItem.text,
        };
      });

      setModuleItems(mergedModules);
      setModuleDraft(normalizedModules);
      setMessage("Modüller başarıyla kaydedildi.");
      setEditMode(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <section id="moduller" className="container-shell py-24">
      <SectionTitle
        eyebrow="Temel modüller"
        title="Araştırma, üretim, işbirliği ve kariyer aynı platform mimarisinde."
        text="AvOfis yalnızca bilgiye erişim sağlamaz; hukuk iş akışının üretim, eşleşme, moderasyon ve ekip koordinasyonu tarafını da merkezi hale getirir."
      />

      {isAdmin && !authLoading ? (
        <div className="mt-8 rounded-[24px] border border-amber-400/20 bg-amber-400/10 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-white">
                Modül Düzenleme
              </div>
              <div className="text-xs text-slate-300">
                Modül kartlarını doğrudan görünüm üzerinde düzenleyebilirsin.
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              {!editMode ? (
                <button
                  type="button"
                  onClick={openEditMode}
                  className="inline-flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2 text-sm font-medium text-amber-200"
                >
                  <Pencil className="h-4 w-4" />
                  Modülleri Düzenle
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={addDraftItem}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Modül Ekle
                  </button>

                  <button
                    type="button"
                    onClick={saveModulesInline}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Kaydediliyor..." : "Modülleri Kaydet"}
                  </button>

                  <button
                    type="button"
                    onClick={cancelEditMode}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
                  >
                    <X className="h-4 w-4" />
                    Vazgeç
                  </button>
                </>
              )}
            </div>
          </div>

          {message ? (
            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200">
              {message}
            </div>
          ) : null}
        </div>
      ) : null}

      {isAdmin && editMode ? (
        <div className="mt-8 space-y-4">
          {moduleDraft.map((item, index) => (
            <div
              key={`${index}-${item.title}`}
              className="grid gap-3 rounded-[24px] border border-white/10 bg-white/5 p-5 md:grid-cols-[1fr_1.5fr_auto]"
            >
              <input
                value={item.title}
                onChange={(e) =>
                  updateDraftItem(index, "title", e.target.value)
                }
                placeholder="Modül başlığı"
                className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none"
              />

              <textarea
                value={item.text}
                onChange={(e) =>
                  updateDraftItem(index, "text", e.target.value)
                }
                placeholder="Modül açıklaması"
                rows={3}
                className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none"
              />

              <button
                type="button"
                onClick={() => removeDraftItem(index)}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200"
              >
                <Trash2 className="h-4 w-4" />
                Sil
              </button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {moduleItems.map((item) => {
          const Icon = item.icon;

          return (
            <article
              key={item.title}
              className="group rounded-[26px] border border-white/10 bg-white/5 p-6 transition duration-300 hover:-translate-y-1 hover:border-sky-400/30 hover:bg-white/[0.08]"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/50">
                <Icon className="h-5 w-5 text-sky-300" />
              </div>

              <h3 className="mt-5 text-lg font-semibold text-white">
                {item.title}
              </h3>

              <p className="mt-3 text-sm leading-7 text-slate-300">
                {item.text}
              </p>

              <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-sky-300">
                Modülü incele
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
