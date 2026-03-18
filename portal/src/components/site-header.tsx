"use client";

import Link from "next/link";
import { Gavel, Menu, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useEditMode } from "@/components/providers/EditModeProvider";
import { useUser } from "@/hooks/useUser";
import {
  navigation as defaultNavigation,
  type NavigationItem,
} from "@/lib/site";
import { supabase } from "@/lib/supabase";

type NavigationSettingRow = {
  value?: NavigationItem[];
};

export function SiteHeader() {
  const { session, loading: authLoading } = useUser();
  const { editMode, setEditMode } = useEditMode();

  const [open, setOpen] = useState(false);
  const [menuItems, setMenuItems] = useState<NavigationItem[]>(defaultNavigation);
  const [menuDraft, setMenuDraft] = useState<NavigationItem[]>(defaultNavigation);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  const role = useMemo(() => {
    const rawRole = session?.user?.user_metadata?.role;
    return typeof rawRole === "string" ? rawRole.toLowerCase() : "";
  }, [session]);

  const isAdmin = role === "admin" || role === "super_admin";

  useEffect(() => {
    let mounted = true;

    async function loadNavigation() {
      const { data, error } = await supabase
        .from("site_settings")
        .select("value")
        .eq("key", "navigation")
        .single();

      if (!mounted) return;

      if (error || !data?.value || !Array.isArray(data.value)) {
        setMenuDraft(defaultNavigation);
        return;
      }

      const normalizedItems = (data.value as NavigationItem[]).filter(
        (item) =>
          item &&
          typeof item.label === "string" &&
          item.label.trim() &&
          typeof item.href === "string" &&
          item.href.trim(),
      );

      if (normalizedItems.length > 0) {
        setMenuItems(normalizedItems);
        setMenuDraft(normalizedItems);
      } else {
        setMenuDraft(defaultNavigation);
      }
    }

    loadNavigation();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!editMode) {
      setMessage("");
      setMenuDraft(menuItems.length > 0 ? menuItems : defaultNavigation);
    }
  }, [editMode, menuItems]);

  function openEditMode() {
    setMessage("");
    setMenuDraft(menuItems.length > 0 ? menuItems : defaultNavigation);
    setEditMode(true);
  }

  function cancelEditMode() {
    setMessage("");
    setMenuDraft(menuItems.length > 0 ? menuItems : defaultNavigation);
    setEditMode(false);
  }

  function updateDraftItem(
    index: number,
    field: keyof NavigationItem,
    value: string,
  ) {
    setMenuDraft((prev) => {
      const copy = [...prev];
      copy[index] = {
        ...copy[index],
        [field]: value,
      };
      return copy;
    });
  }

  function addDraftItem() {
    setMenuDraft((prev) => [...prev, { label: "", href: "" }]);
  }

  function removeDraftItem(index: number) {
    setMenuDraft((prev) => prev.filter((_, i) => i !== index));
  }

  async function saveMenuInline() {
    try {
      setSaving(true);
      setMessage("");

      const normalizedItems = menuDraft
        .map((item) => ({
          label: typeof item.label === "string" ? item.label.trim() : "",
          href: typeof item.href === "string" ? item.href.trim() : "",
        }))
        .filter((item) => item.label && item.href);

      if (normalizedItems.length === 0) {
        setMessage("En az bir geçerli menü öğesi gerekli.");
        return;
      }

      const { error } = await supabase.from("site_settings").upsert({
        key: "navigation",
        value: normalizedItems,
      });

      if (error) {
        setMessage(`Menü kaydedilemedi: ${error.message}`);
        return;
      }

      setMenuItems(normalizedItems);
      setMenuDraft(normalizedItems);
      setMessage("Menü başarıyla kaydedildi.");
      setEditMode(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#07111f]/80 backdrop-blur-xl">
      <div className="container-shell flex h-20 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-sky-400/30 bg-gradient-to-br from-sky-400/20 to-blue-600/20 shadow-glow">
            <Gavel className="h-5 w-5 text-sky-300" />
          </div>
          <div>
            <div className="text-lg font-semibold tracking-tight">AvOfis</div>
            <div className="text-xs text-slate-400">Hukuk çalışma platformu</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-slate-300 lg:flex">
          {menuItems.map((item) => (
            <a
              key={`${item.label}-${item.href}`}
              href={item.href}
              className="hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isAdmin && !authLoading ? (
            <button
              type="button"
              onClick={() => {
                if (editMode) {
                  cancelEditMode();
                } else {
                  openEditMode();
                }
              }}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-400/30 bg-amber-400/10 px-4 py-2.5 text-sm font-medium text-amber-200 hover:bg-amber-400/15"
            >
              {editMode ? <X className="h-4 w-4" /> : <Pencil className="h-4 w-4" />}
              {editMode ? "Düzenleme Modunu Kapat" : "Düzenleme Modu"}
            </button>
          ) : null}

          <a
            href="/auth/login"
            className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-medium text-slate-200 hover:border-white/20 hover:bg-white/5"
          >
            Giriş Yap
          </a>
          <a
            href="/auth/register"
            className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-slate-100"
          >
            Hesap Oluştur
          </a>
        </div>

        <button
          aria-label="Menü"
          className="inline-flex rounded-xl border border-white/10 p-2 text-slate-200 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isAdmin && editMode ? (
        <div className="border-t border-white/10 bg-[#081321]">
          <div className="container-shell py-5">
            <div className="rounded-[24px] border border-amber-400/20 bg-amber-400/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-white">
                    Menü Düzenleme Modu
                  </div>
                  <div className="text-xs text-slate-300">
                    Menü öğelerini burada düzenleyip aynı anda gerçek görünümde önizleyebilirsin.
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={addDraftItem}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
                  >
                    <Plus className="h-4 w-4" />
                    Menü Ekle
                  </button>

                  <button
                    type="button"
                    onClick={saveMenuInline}
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
                  >
                    <Save className="h-4 w-4" />
                    {saving ? "Kaydediliyor..." : "Menüyü Kaydet"}
                  </button>

                  <button
                    type="button"
                    onClick={cancelEditMode}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white"
                  >
                    <X className="h-4 w-4" />
                    Vazgeç
                  </button>
                </div>
              </div>

              {message ? (
                <div className="mt-4 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-slate-200">
                  {message}
                </div>
              ) : null}

              <div className="mt-4 space-y-3">
                {menuDraft.map((item, index) => (
                  <div
                    key={`${index}-${item.label}-${item.href}`}
                    className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-[1fr_1fr_auto]"
                  >
                    <input
                      value={item.label}
                      onChange={(e) =>
                        updateDraftItem(index, "label", e.target.value)
                      }
                      placeholder="Menü başlığı"
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
                    />

                    <input
                      value={item.href}
                      onChange={(e) =>
                        updateDraftItem(index, "href", e.target.value)
                      }
                      placeholder="Link / bölüm bağlantısı"
                      className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none"
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
            </div>
          </div>
        </div>
      ) : null}

      {open && (
        <div className="border-t border-white/10 bg-[#081321] md:hidden">
          <div className="container-shell flex flex-col gap-3 py-4">
            {menuItems.map((item) => (
              <a
                key={`${item.label}-${item.href}`}
                href={item.href}
                className="rounded-xl px-3 py-2 text-sm text-slate-200 hover:bg-white/5"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <div className="mt-2 grid grid-cols-2 gap-3">
              <a
                href="/auth/login"
                className="rounded-xl border border-white/10 px-4 py-3 text-center text-sm font-medium text-slate-100"
              >
                Giriş Yap
              </a>
              <a
                href="/auth/register"
                className="rounded-xl bg-white px-4 py-3 text-center text-sm font-semibold text-slate-950"
              >
                Hesap Oluştur
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
