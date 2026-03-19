import { Sparkles } from "lucide-react";
import { EditableText } from "@/components/cms/EditableText";
import { useEditMode } from "@/components/providers/EditModeProvider";

type SectionTitleProps = {
  eyebrow: string;
  title: string;
  text: string;
  editable?: boolean;
  pageSlug?: string;
  eyebrowPath?: string;
  titlePath?: string;
  textPath?: string;
};

export function SectionTitle({
  eyebrow,
  title,
  text,
  editable = false,
  pageSlug = "home",
  eyebrowPath,
  titlePath,
  textPath,
}: SectionTitleProps) {
  const { editMode } = useEditMode();

  const eyebrowNode =
    editable && editMode && eyebrowPath ? (
      <EditableText value={eyebrow} pageSlug={pageSlug} path={eyebrowPath} />
    ) : (
      eyebrow
    );

  const titleNode =
    editable && editMode && titlePath ? (
      <EditableText value={title} pageSlug={pageSlug} path={titlePath} />
    ) : (
      title
    );

  const textNode =
    editable && editMode && textPath ? (
      <EditableText value={text} pageSlug={pageSlug} path={textPath} multiline />
    ) : (
      text
    );

  return (
    <div className="max-w-3xl">
      <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-sky-300">
        <Sparkles className="h-3.5 w-3.5" />
        {eyebrowNode}
      </div>
      <h2 className="text-3xl font-semibold tracking-tight text-white md:text-4xl">{titleNode}</h2>
      <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 md:text-base">{textNode}</p>
    </div>
  );
}