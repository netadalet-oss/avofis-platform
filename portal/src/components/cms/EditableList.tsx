"use client";

import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useEditMode } from "@/components/providers/EditModeProvider";
import { useUser } from "@/hooks/useUser";

type EditableListProps = {
  items: string[];
  className?: string;
  itemClassName?: string;
  placeholder?: string;
  onSave: (nextItems: string[]) => Promise<void> | void;
};

export function EditableList({
  items,
  className = "",
  itemClassName = "",
  placeholder = "Yeni öğe",
  onSave,
}: EditableListProps) {
  const { session, loading } = useUser();
  const { editMode } = useEditMode();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<string[]>(items || []);
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

  function updateItem(index: number, value: string) {
    const next = [...draft];
    next[index] = value;
    setDraft(next);
  }

  function addItem() {
    setDraft([...draft, ""]);
  }

  function removeItem(index: number) {
    const next = draft.filter((_, i) => i !== index);
    setDraft(next);
  }

  async function handleSave() {
    try {
      setSaving(true);
      const cleaned = draft.map((i) => i.trim()).filter(Boolean);
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
        {items.map((item, i) => (
          <span key={i} className={itemClassName}>
            {item}
          </span>
        ))}
      </div>
    );
  }

  if (isEditing) {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          {draft.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <input
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                placeholder={placeholder}
                className="w-full rounded-xl border border-amber-400/30 bg-white/5 px-3 py-2 text-white outline-none"
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                className="rounded-lg border border-red-400/20 bg-red-400/10 p-2 text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={addItem}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-white"
        >
          <Plus className="h-4 w-4" />
          Yeni ekle
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
        {items.map((item, i) => (
          <span key={i} className={itemClassName}>
            {item}
          </span>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setIsEditing(true)}
        className="absolute -top-2 -right-2 inline-flex items-center gap-1 rounded-lg border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-xs text-amber-200 opacity-0 transition group-hover:opacity-100"
      >
        <Pencil className="h-3 w-3" />
        Düzenle
      </button>
    </div>
  );
}