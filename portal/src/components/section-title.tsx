"use client";

import { Sparkles } from "lucide-react";
import { EditableText } from "@/components/cms/EditableText";
import { useEditMode } from "@/components/providers/EditModeProvider";
import { useUser } from "@/hooks/useUser";

type SectionTitleProps = {
  eyebrow: string;
  title: string;
  text: string;
  eyebrowClassName?: string;
  titleClassName?: string;
  textClassName?: string;
  editable?: boolean;
  onSaveEyebrow?: (nextValue: string) => Promise<void> | void;
  onSaveTitle?: (nextValue: string) => Promise<void> | void;
  onSaveText?: (nextValue: string) => Promise<void> | void;
};

export function SectionTitle({
  eyebrow,
  title,
  text,
  eyebrowClassName = "",
  titleClassName = "",
  textClassName = "",
  editable = false,
  onSaveEyebrow,
  onSaveTitle,
  onSaveText,
}: SectionTitleProps) {
  const { editMode } = useEditMode();
  const { session, loading } = useUser();

  const rawRole = session?.user?.user_metadata?.role;
  const role = typeof rawRole === "string" ? rawRole.toLowerCase() : "";
  const isAdmin = role === "admin" || role === "super_admin";
  const canEdit = editable && editMode && !loading && isAdmin;

  return (
    <div className="max-w-3xl">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
        <Sparkles className="h-3.5 w-3.5" />

        {canEdit && onSaveEyebrow ? (
          <EditableText
            tag="span"
            value={eyebrow}
            className={eyebrowClassName}
            onSave={onSaveEyebrow}
          />
        ) : (
          <span className={eyebrowClassName}>{eyebrow}</span>
        )}
      </div>

      {canEdit && onSaveTitle ? (
        <EditableText
          tag="h2"
          value={title}
          className={
            titleClassName ||
            "text-3xl font-semibold tracking-tight text-white md:text-4xl"
          }
          onSave={onSaveTitle}
        />
      ) : (
        <h2
          className={
            titleClassName ||
            "text-3xl font-semibold tracking-tight text-white md:text-4xl"
          }
        >
          {title}
        </h2>
      )}

      {canEdit && onSaveText ? (
        <EditableText
          tag="p"
          value={text}
          multiline
          rows={4}
          className={
            textClassName ||
            "mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base"
          }
          onSave={onSaveText}
        />
      ) : (
        <p
          className={
            textClassName ||
            "mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base"
          }
        >
          {text}
        </p>
      )}
    </div>
  );
}