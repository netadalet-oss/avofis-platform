"use client";

import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useEditMode } from "@/components/providers/EditModeProvider";
import { useUser } from "@/hooks/useUser";

export type EditableMetaCardItem = {
  title: string;
  meta: string;
  text: string;
};

type EditableMetaCardGridProps = {
  items: EditableMetaCardItem[];
  className?: string;
  cardClassName?: string;
  titleClassName?: string;
  metaClassName?: string;
  textClassName?: string;
  titlePlaceholder?: string;
  metaPlaceholder?: string;
  textPlaceholder?: string;
  onSave: (nextItems: EditableMetaCardItem[]) => Promise<void> | void;
};

export function EditableMetaCardGrid({
  items,
  className = "",
  cardClassName = "",
  titleClassName = "",
  metaClassName = "",
  textClassName = "",
  titlePlaceholder = "Kart başlığı",
  metaPlaceholder = "Meta bilgi",
  textPlaceholder = "Kart açıklaması",
  onSave,
}: EditableMetaCardGridProps) {
  const { session, loading } = useUser();
  const { editMode } = useEditMode();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<EditableMetaCardItem[]>(items || []);
  const [saving, setSaving] = useState(false);

  const role = useMemo(() => {
    const rawRole = session?.user?.user_metadata?.role;
    return typeof rawRole === "string" ? rawRole.toLowerCase() : "";
  }, [session]);

  const isAdmin = role === "admin" || role === "super_admin";
  const canEdit = isAdmin && !loading && editMode;

  useEffect(() => {
    if (!isEditing) {
      setDraft(items || []);
    }
  }, [items, isEditing]);

  useEffect(() => {
    if (!editMode) {
      setIsEditing(false);
    }
  }, [editMode]);

  function updateItem(index: number, key: keyof EditableMetaCardItem, value: string) {
    const next = [...draft];
    next[index] = {
      ...next[index],
      [key]: value,
    };
    setDraft(next);
  }

  function addItem() {
    setDraft([
      ...draft,
      {
        title: "",
        meta: "",
        text: "",
      },
    ]);
  }

  function removeItem(index: number) {
    setDraft(draft.filter((_, i) => i !== index));
  }

  async function handleSave() {
    try {
      setSaving(true);

      const cleaned = draft
        .map((item) => ({
          title: item.title.trim(),
          meta: item.meta.trim(),
          text: item.text.trim(),
        }))
        .filter((item) => item.title || item.meta || item.text);

      await onSave(cleaned);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setDraft(items || []);
    setIsEditing(false);
  }

  if (!canEdit) {
    return (
      <div className={className}>
        {items.map((item, index) => (
          <article key={`${item.title}-${index}`} className={cardClassName}>
            <div className="flex items-center justify-between gap-3">
              <div className={titleClassName}>{item.title}</div>
              <div className={metaClassName}>{item.meta}</div>
            </div>
            <p className={textClassName}>{item.text}</p>
          </article>
        ))}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="space-y-4">
          {draft.map((item, index) => (
            <div
              key={index}
              className="rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <div className="space-y-3">
                <input
                  value={item.title}
                  onChange={(e) => updateItem(index, "title", e.target.value)}
                  placeholder={titlePlaceholder}
                  className="w-full rounded-xl border border-amber-400/30 bg-white/5 px-3 py-2 text-white outline-none"
                />

                <input
                  value={item.meta}
                  onChange={(e) => updateItem(index, "meta", e.target.value)}
                  placeholder={metaPlaceholder}
                  className="w-full rounded-xl border border-amber-400/30 bg-white/5 px-3 py-2 text-white outline-none"
                />

                <textarea
                  value={item.text}
                  onChange={(e) => updateItem(index, "text", e.target.value)}
                  rows={4}
                  placeholder={textPlaceholder}
                  className="w-full rounded-xl border border-amber-400/30 bg-white/5 px-3 py-3 text-white outline-none"
                />

                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-400/20 bg-red-400/10 px-3 py-2 text-sm text-red-300"
                >
                  <Trash2 className="h-4 w-4" />
                  Kartı sil
                </button>
              </div>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
        >
          <Plus className="h-4 w-4" />
          Kart ekle
        </button>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-950 disabled:opacity-60"
          >
            <Check className="h-4 w-4" />
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white disabled:opacity-60"
          >
            <X className="h-4 w-4" />
            Vazgeç
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="group relative">
      <div className={className}>
        {items.map((item, index) => (
          <article key={`${item.title}-${index}`} className={cardClassName}>
            <div className="flex items-center justify-between gap-3">
              <div className={titleClassName}>{item.title}</div>
              <div className={metaClassName}>{item.meta}</div>
            </div>
            <p className={textClassName}>{item.text}</p>
          </article>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="absolute -right-2 -top-2 inline-flex items-center gap-1 rounded-lg border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-xs text-amber-200 opacity-0 transition group-hover:opacity-100"
      >
        <Pencil className="h-3 w-3" />
        Düzenle
      </button>
    </div>
  );
}
