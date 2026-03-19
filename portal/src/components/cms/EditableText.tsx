"use client";

import { Check, Pencil, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useEditMode } from "@/components/providers/EditModeProvider";
import { useUser } from "@/hooks/useUser";

type EditableTextProps = {
  value: string;
  defaultValue?: string;
  tag?: "div" | "p" | "span" | "h1" | "h2" | "h3";
  multiline?: boolean;
  rows?: number;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  onSave: (nextValue: string) => Promise<void> | void;
};

export function EditableText({
  value,
  defaultValue = "",
  tag = "div",
  multiline = false,
  rows = 4,
  className = "",
  inputClassName = "",
  placeholder = "",
  onSave,
}: EditableTextProps) {
  const { session, loading } = useUser();
  const { editMode } = useEditMode();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(value || defaultValue);
  const [saving, setSaving] = useState(false);

  const role = useMemo(() => {
    const rawRole = session?.user?.user_metadata?.role;
    return typeof rawRole === "string" ? rawRole.toLowerCase() : "";
  }, [session]);

  const isAdmin = role === "admin" || role === "super_admin";
  const canEdit = isAdmin && !loading && editMode;

  useEffect(() => {
    if (!isEditing) {
      setDraft(value || defaultValue);
    }
  }, [value, defaultValue, isEditing]);

  useEffect(() => {
    if (!editMode) {
      setIsEditing(false);
    }
  }, [editMode]);

  async function handleSave() {
    try {
      setSaving(true);
      await onSave(draft);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setDraft(value || defaultValue);
    setIsEditing(false);
  }

  const content = value || defaultValue;
  const Tag = tag;

  if (!canEdit) {
    return <Tag className={className}>{content}</Tag>;
  }

  if (isEditing) {
    return (
      <div className="space-y-3">
        {multiline ? (
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={rows}
            placeholder={placeholder}
            className={
              inputClassName ||
              "w-full rounded-2xl border border-amber-400/30 bg-white/5 px-4 py-3 text-white outline-none"
            }
          />
        ) : (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder={placeholder}
            className={
              inputClassName ||
              "w-full rounded-2xl border border-amber-400/30 bg-white/5 px-4 py-3 text-white outline-none"
            }
          />
        )}

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
      <Tag className={className}>{content}</Tag>

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