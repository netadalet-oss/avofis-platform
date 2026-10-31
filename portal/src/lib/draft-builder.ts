export type DraftFields = {
  title: string;
  parties: string;
  facts: string;
  requests: string;
  evidence: string;
};
export type DraftVersion = { id: number; content: string };
export const FIELD_LIMIT = 10000;
export const MAX_VERSIONS = 12;
const plain = (value: string): string => value.trim();
export function validateDraft(draft: DraftFields): string | null {
  if (!plain(draft.title) || !plain(draft.facts) || !plain(draft.requests)) {
    return "Başlık, olaylar ve talepler zorunludur.";
  }
  if (Object.values(draft).some((value) => value.length > FIELD_LIMIT)) {
    return "Bir alan izin verilen uzunluğu aşıyor.";
  }
  return null;
}
export function renderDraft(draft: DraftFields): string {
  const problem = validateDraft(draft);
  if (problem) throw new Error(problem);
  const sections: Array<[string, string]> = [
    ["TASLAK BAŞLIĞI", plain(draft.title)],
    ["TARAFLAR / MUHATAPLAR", plain(draft.parties)],
    ["OLAYLAR", plain(draft.facts)],
    ["TALEPLER", plain(draft.requests)],
    ["DELİLLER / EKLER", plain(draft.evidence)]
  ];
  return [
    "AVOFİS - KULLANICI METNİNDEN OLUŞTURULMUŞ TASLAK",
    "Hukuki doğrulama yapılmamıştır. İmzaya veya sunuma hazır değildir.",
    "",
    ...sections.flatMap(([name, value]) => [name, value || "(Kullanıcı tarafından belirtilmedi)", ""])
  ].join("\n");
}
export function addVersion(
  previous: readonly DraftVersion[],
  nextId: number,
  content: string
): DraftVersion[] {
  if (!Number.isSafeInteger(nextId) || nextId < 1 || content.length > FIELD_LIMIT * 6 ||
      previous.some((entry) => entry.id === nextId)) return [...previous];
  return [...previous, { id: nextId, content }].slice(-MAX_VERSIONS);
}
export function safeTextFilename(title: string): string {
  const base = plain(title).replace(/[^\p{L}\p{N} _.-]+/gu, "_")
    .replace(/[. ]+$/g, "").slice(0, 65) || "hukuki-taslak";
  return base + ".txt";
}
