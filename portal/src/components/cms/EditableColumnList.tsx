"use client";

import { Check, Pencil, Plus, Trash2, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useEditMode } from "@/components/providers/EditModeProvider";
import { useUser } from "@/hooks/useUser";

export type EditableColumnItem = {
  title: string;
  points: string[];
};

type Props = {
  items: EditableColumnItem[];
  className?: string;

  // ✅ YENİ: stil kontrolü
  columnClassName?: string;
  titleClassName?: string;
  pointClassName?: string;
  pointsWrapperClassName?: string;

  // ✅ YENİ: render override (en kritik kısım)
  renderColumn?: (column: EditableColumnItem, index: number) => React.ReactNode;

  onSave: (next: EditableColumnItem[]) => Promise<void> | void;
};

export function EditableColumnList({
  items,
  className = "",
  columnClassName = "",
  titleClassName = "",
  pointClassName = "",
  pointsWrapperClassName = "",
  renderColumn,
  onSave,
}: Props) {
  const { session, loading } = useUser();
  const { editMode } = useEditMode();

  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState<EditableColumnItem[]>(items || []);
  const [saving, setSaving] = useState(false);

  const role = useMemo(() => {
    const rawRole = session?.user?.user_metadata?.role;
    return typeof rawRole === "string" ? rawRole.toLowerCase() : "";
  }, [session]);

  const isAdmin = role === "admin" || role === "super_admin";
  const canEdit = isAdmin && !loading && editMode;

  useEffect(() => {
    if (!isEditing) setDraft(items || []);
  }, [items, isEditing]);

  useEffect(() => {
    if (!editMode) setIsEditing(false);
  }, [editMode]);

  function updateTitle(index: number, value: string) {
    const next = [...draft];
    next[index].title = value;
    setDraft(next);
  }

  function updatePoint(colIndex: number, pointIndex: number, value: string) {
    const next = [...draft];
    next[colIndex].points[pointIndex] = value;
    setDraft(next);
  }

  function addColumn() {
    setDraft([...draft, { title: "", points: [] }]);
  }

  function removeColumn(index: number) {
    setDraft(draft.filter((_, i) => i !== index));
  }

  function addPoint(colIndex: number) {
    const next = [...draft];
    next[colIndex].points.push("");
    setDraft(next);
  }

  function removePoint(colIndex: number, pointIndex: number) {
    const next = [...draft];
    next[colIndex].points = next[colIndex].points.filter((_, i) => i !== pointIndex);
    setDraft(next);
  }

  async function handleSave() {
    try {
      setSaving(true);

      const cleaned = draft.map((col) => ({
        title: col.title.trim(),
        points: col.points.map((p) => p.trim()).filter(Boolean),
      }));

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

  // ✅ VIEW MODE
  if (!canEdit) {
    return (
      <div className={className}>
        {items.map((col, i) =>
          renderColumn ? (
            <div key={i}>{renderColumn(col, i)}</div>
          ) : (
            <div key={i} className={columnClassName}>
              <div className={titleClassName}>{col.title}</div>
              <div className={pointsWrapperClassName}>
                {col.points.map((p, j) => (
                  <div key={j} className={pointClassName}>
                    {p}
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>
    );
  }

  // ✅ EDIT MODE
  if (isEditing) {
    return (
      <div className="space-y-6">
        {draft.map((col, colIndex) => (
          <div
            key={colIndex}
            className="rounded-2xl border border-white/10 bg-white/5 p-4"
          >
            <input
              value={col.title}
              onChange={(e) => updateTitle(colIndex, e.target.value)}
              placeholder="Kolon başlığı"
              className="w-full mb-3 rounded-xl border border-amber-400/30 bg-white/5 px-3 py-2 text-white"
            />

            <div className="space-y-2">
              {col.points.map((point, pIndex) => (
                <div key={pIndex} className="flex gap-2">
                  <input
                    value={point}
                    onChange={(e) =>
                      updatePoint(colIndex, pIndex, e.target.value)
                    }
                    placeholder="Madde"
                    className="w-full rounded-xl border border-amber-400/30 bg-white/5 px-3 py-2 text-white"
                  />
                  <button onClick={() => removePoint(colIndex, pIndex)}>
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => addPoint(colIndex)}
              className="mt-3 text-sm text-sky-300"
            >
              + Madde ekle
            </button>

            <button
              onClick={() => removeColumn(colIndex)}
              className="mt-3 ml-4 text-sm text-red-400"
            >
              Kolonu sil
            </button>
          </div>
        ))}

        <button onClick={addColumn} className="text-sm text-white">
          + Kolon ekle
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

  // ✅ HOVER EDIT BUTTON
  return (
    <div className="group relative">
      <div className={className}>
        {items.map((col, i) =>
          renderColumn ? (
            <div key={i}>{renderColumn(col, i)}</div>
          ) : (
            <div key={i} className={columnClassName}>
              <div className={titleClassName}>{col.title}</div>
              <div className={pointsWrapperClassName}>
                {col.points.map((p, j) => (
                  <div key={j} className={pointClassName}>
                    {p}
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>

      <button
        onClick={() => setIsEditing(true)}
        className="absolute top-0 right-0 opacity-0 group-hover:opacity-100"
      >
        <Pencil className="h-4 w-4 text-amber-300" />
      </button>
    </div>
  );
}