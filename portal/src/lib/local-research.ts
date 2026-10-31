export type LocalText = Readonly<{
  id: string;
  title: string;
  body: string;
}>;

export const MAX_LOCAL_TEXTS = 20;
export const MAX_TEXT_LENGTH = 15000;

export function tidy(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

export function createLocalText(
  existing: readonly LocalText[],
  id: string,
  title: string,
  body: string
): { item: LocalText | null; error: string | null } {
  const normalizedTitle = tidy(title);
  const normalizedBody = body.trim();
  if (!id.trim() || existing.some((item) => item.id === id)) {
    return { item: null, error: "Kayıt kimliği geçersiz veya tekrarlanmış." };
  }
  if (!normalizedTitle || !normalizedBody) {
    return { item: null, error: "Başlık ve metin boş bırakılamaz." };
  }
  if (normalizedTitle.length > 160 || normalizedBody.length > MAX_TEXT_LENGTH) {
    return { item: null, error: "Başlık veya metin izin verilen uzunluğu aşıyor." };
  }
  if (existing.length >= MAX_LOCAL_TEXTS) {
    return { item: null, error: "Bu oturumda en fazla 20 metin incelenebilir." };
  }
  return { item: { id, title: normalizedTitle, body: normalizedBody }, error: null };
}

export function filterLocalTexts(items: readonly LocalText[], phrase: string): LocalText[] {
  const search = tidy(phrase).toLocaleLowerCase("tr-TR");
  if (!search) return [...items];
  return items.filter((item) =>
    [item.title, item.body].some((part) =>
      part.toLocaleLowerCase("tr-TR").includes(search)
    )
  );
}

export function removeLocalText(items: readonly LocalText[], id: string): LocalText[] {
  return items.filter((item) => item.id !== id);
}

export function excerpt(text: string, phrase: string, maxLength = 230): string {
  const collapsed = text.replace(/\s+/g, " ").trim();
  const search = tidy(phrase).toLocaleLowerCase("tr-TR");
  const index = search ? collapsed.toLocaleLowerCase("tr-TR").indexOf(search) : -1;
  const start = index > 65 ? index - 65 : 0;
  const end = Math.min(collapsed.length, start + Math.max(60, maxLength));
  return (start ? "…" : "") + collapsed.slice(start, end) + (end < collapsed.length ? "…" : "");
}
