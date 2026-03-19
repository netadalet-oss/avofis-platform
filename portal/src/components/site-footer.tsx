"use client";

import { useEffect, useMemo, useState } from "react";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useEditMode } from "@/components/providers/EditModeProvider";
import { useUser } from "@/hooks/useUser";
import {
  footerColumns as defaultFooterColumns,
  type FooterColumn,
} from "@/lib/site";
import { supabase } from "@/lib/supabase";

export function SiteFooter() {
  const { session, loading: authLoading } = useUser();
  const { editMode, setEditMode } = useEditMode();

  const [columns, setColumns] = useState<FooterColumn[]>(defaultFooterColumns);
  const [footerDraft, setFooterDraft] =
    useState<FooterColumn[]>(defaultFooterColumns);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const role = useMemo(() => {
    const rawRole = session?.user?.user_metadata?.role;
    return typeof rawRole === "string" ? rawRole.toLowerCase() : "";
  }, [session]);

  const isAdmin = role === "admin" || role === "super_admin";

  useEffect(() => {
    let mounted = true;

    async function loadFooter() {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "footer")
        .single();

      if (!mounted) return;

      if (error || !data?.value || !Array.isArray(data.value)) {
        setFooterDraft(defaultFooterColumns);
        return;
      }

      const normalized = (data.value as FooterColumn[]).filter(
        (col) =>
          col &&
          typeof col.title === "string" &&
          col.title.trim() &&
          Array.isArray(col.links),
      );

      if (normalized.length > 0) {
        setColumns(normalized);
        setFooterDraft(normalized);
      } else {
        setFooterDraft(defaultFooterColumns);
      }
    }

    loadFooter();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!editMode) {
      setMessage("");
      setFooterDraft(columns.length > 0 ? columns : defaultFooterColumns);
    }
  }, [editMode, columns]);

  function openEditMode() {
    setEditMode(true);
    setMessage("");
    setFooterDraft(columns.length > 0 ? columns : defaultFooterColumns);
  }

  function cancelEditMode() {
    setEditMode(false);
    setMessage("");
    setFooterDraft(columns.length > 0 ? columns : defaultFooterColumns);
  }

  function updateColumnTitle(index: number, value: string) {
    setFooterDraft((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        title: value,
      };
      return copy;
    });
  }

  function updateColumnLinks(index: number, value: string) {
    setFooterDraft((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        links: value
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
      };
      return copy;
    });
  }

  function addColumn() {
    setFooterDraft((prev) => [...prev, { title: "", links: [] }]);
  }

  function removeColumn(index: number) {
    setFooterDraft((prev) => prev.filter((_, i) => i !== index));
  }

  async function saveFooterInline() {
    try {
      setSaving(true);
      setMessage("");

      const normalized = footerDraft
        .map((col) => ({
          title: typeof col.title === "string" ? col.title.trim() : "",
          links: Array.isArray(col.links)
            ? col.links
                .map((link) =>
                  typeof link === "string" ? link.trim() : "",
                )
                .filter(Boolean)
            : [],
        }))
        .filter((col) => col.title && col.links.length > 0);

      if (normalized.length === 0) {
        setMessage("En az bir geçerli footer kolonu gerekli.");
        return;
      }

      const { error } = await supabase.from("site_settings").upsert({
        key: "footer",
        value: normalized,
      });

      if (error) {
        setMessage(`Footer kaydedilemedi: ${error.message}`);
        return;
      }

      setColumns(normalized);
      setFooterDraft(normalized);
      setMessage("Footer başarıyla kaydedildi.");
      setEditMode(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <footer className="border-t border-white/10 bg-black/30">
      {isAdmin && !authLoading ? (
        <div className="container-shell pt-6">
          <div className="rounded-[24px] border border-amber-400/20 bg-amber-400/10 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-white">
                  Footer Düzenleme
                </div>
                <div className="text-xs text-slate-300">
                  Footer kolonlarını doğrudan görünüm üzerinde
                  düzenleyebilirsin.
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
                    Footer Düzenle
                  </button>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={addColumn}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
                    >
                      <Plus className="h-4 w-4" />
                      Kolon Ekle
                    </button>

                    <button
                      type="button"
                      onClick={saveFooterInline}
                      disabled={saving}
                      className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
                    >
                      <Save className="h-4 w-4" />
                      {saving ? "Kaydediliyor..." : "Footer Kaydet"}
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
        </div>
      ) : null}

      <div className="container-shell grid gap-10 py-16 md:grid-cols-4">
        <div>
          <div className="text-lg font-semibold">AvOfis</div>
          <p className="mt-3 text-sm leading-7 text-slate-400">
            Modern, ölçeklenebilir ve yönetilebilir hukuk araştırma ve çalışma
            platformu.
          </p>
        </div>

        {columns.map((column) => (
          <div key={column.title}>
            <div className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-300">
              {column.title}
            </div>

            <ul className="mt-4 space-y-3 text-sm text-slate-400">
              {column.links.map((link) => (
                <li key={link}>{link}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {isAdmin && editMode ? (
        <div className="container-shell pb-8">
          <div className="space-y-4">
            {footerDraft.map((column, index) => (
              <div
                key={`${index}-${column.title}`}
                className="rounded-[24px] border border-white/10 bg-white/5 p-5"
              >
                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <input
                    value={column.title}
                    onChange={(e) =>
                      updateColumnTitle(index, e.target.value)
                    }
                    placeholder="Kolon başlığı"
                    className="rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none"
                  />

                  <button
                    type="button"
                    onClick={() => removeColumn(index)}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200"
                  >
                    <Trash2 className="h-4 w-4" />
                    Sil
                  </button>
                </div>

                <div className="mt-4">
                  <label className="mb-2 block text-sm text-slate-300">
                    Linkler (her satıra bir link)
                  </label>
                  <textarea
                    value={column.links.join("\n")}
                    onChange={(e) =>
                      updateColumnLinks(index, e.target.value)
                    }
                    rows={5}
                    className="w-full rounded-xl border border-white/10 bg-slate-950/50 px-4 py-3 text-sm text-white outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </footer>
  );
}