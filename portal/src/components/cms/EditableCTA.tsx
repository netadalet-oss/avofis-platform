"use client";

import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useEditMode } from "@/components/providers/EditModeProvider";
import { useUser } from "@/hooks/useUser";

export type EditableCTAButton = {
  label: string;
  href: string;
};

export type EditableCTAData = {
  title: string;
  text: string;
  buttons: EditableCTAButton[];
};

type Props = {
  value: EditableCTAData;
  className?: string;
  titleClassName?: string;
  textClassName?: string;
  buttonClassName?: string;
  onSave: (next: EditableCTAData) => Promise<void> | void;
};

export function EditableCTA({
  value,
  className = "",
  titleClassName = "",
  textClassName = "",
  buttonClassName = "",
  onSave,
}: Props) {
  const { session, loading } = useUser();
  const { editMode } = useEditMode();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<EditableCTAData>(value);
  const [saving, setSaving] = useState(false);

  const role = useMemo(() => {
    const rawRole = session?.user?.user_metadata?.role;
    return typeof rawRole === "string" ? rawRole.toLowerCase() : "";
  }, [session]);

  const isAdmin = role === "admin" || role === "super_admin";
  const canEdit = isAdmin && !loading && editMode;

  useEffect(() => {
    if (!isEditing) {
      setDraft(value);
    }
  }, [value, isEditing]);

  useEffect(() => {
    if (!editMode) {
      setIsEditing(false);
    }
  }, [editMode]);

  function updateField(key: keyof EditableCTAData, val: any) {
    setDraft({
      ...draft,
      [key]: val,
    });
  }

  function updateButton(index: number, key: keyof EditableCTAButton, val: string) {
    const next = [...draft.buttons];
    next[index] = { ...next[index], [key]: val };
    setDraft({ ...draft, buttons: next });
  }

  function addButton() {
    setDraft({
      ...draft,
      buttons: [...draft.buttons, { label: "", href: "" }],
    });
  }

  function removeButton(index: number) {
    setDraft({
      ...draft,
      buttons: draft.buttons.filter((_, i) => i !== index),
    });
  }

  async function handleSave() {
    try {
      setSaving(true);

      const cleaned: EditableCTAData = {
        title: draft.title.trim(),
        text: draft.text.trim(),
        buttons: draft.buttons
          .map((b) => ({
            label: b.label.trim(),
            href: b.href.trim(),
          }))
          .filter((b) => b.label || b.href),
      };

      await onSave(cleaned);
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setDraft(value);
    setIsEditing(false);
  }

  // VIEW MODE
  if (!canEdit) {
    return (
      <div className={className}>
        <div className={titleClassName}>{value.title}</div>
        <p className={textClassName}>{value.text}</p>

        <div className="flex flex-wrap gap-3 mt-4">
          {value.buttons.map((btn, i) => (
            <a key={i} href={btn.href} className={buttonClassName}>
              {btn.label}
            </a>
          ))}
        </div>
      </div>
    );
  }

  // EDIT MODE
  if (isEditing) {
    return (
      <div className="space-y-4">
        <input
          value={draft.title}
          onChange={(e) => updateField("title", e.target.value)}
          placeholder="CTA başlık"
          className="w-full rounded-xl border border-amber-400/30 bg-white/5 px-3 py-3 text-white"
        />

        <textarea
          value={draft.text}
          onChange={(e) => updateField("text", e.target.value)}
          rows={4}
          placeholder="CTA açıklama"
          className="w-full rounded-xl border border-amber-400/30 bg-white/5 px-3 py-3 text-white"
        />

        <div className="space-y-3">
          {draft.buttons.map((btn, index) => (
            <div key={index} className="flex gap-2">
              <input
                value={btn.label}
                onChange={(e) => updateButton(index, "label", e.target.value)}
                placeholder="Buton metni"
                className="w-1/2 rounded-xl border border-amber-400/30 bg-white/5 px-3 py-2 text-white"
              />
              <input
                value={btn.href}
                onChange={(e) => updateButton(index, "href", e.target.value)}
                placeholder="Link"
                className="w-1/2 rounded-xl border border-amber-400/30 bg-white/5 px-3 py-2 text-white"
              />
              <button onClick={() => removeButton(index)}>
                <Trash2 className="h-4 w-4 text-red-400" />
              </button>
            </div>
          ))}
        </div>

        <button onClick={addButton} className="text-sm text-sky-300">
          + Buton ekle
        </button>

        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="bg-white text-black px-4 py-2 rounded-xl"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>

          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-xl border"
          >
            Vazgeç
          </button>
        </div>
      </div>
    );
  }

  // HOVER EDIT
  return (
    <div className="group relative">
      <div className={className}>
        <div className={titleClassName}>{value.title}</div>
        <p className={textClassName}>{value.text}</p>

        <div className="flex flex-wrap gap-3 mt-4">
          {value.buttons.map((btn, i) => (
            <a key={i} href={btn.href} className={buttonClassName}>
              {btn.label}
            </a>
          ))}
        </div>
      </div>

      <button
        onClick={() => setIsEditing(true)}
        className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100"
      >
        <Pencil className="h-4 w-4 text-amber-300" />
      </button>
    </div>
  );
}