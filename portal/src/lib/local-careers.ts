export type ApplicationStage = "saved" | "applied" | "interview" | "closed";
export type CareerItem = Readonly<{
  id: string;
  organization: string;
  position: string;
  sourceUrl: string;
  stage: ApplicationStage;
}>;
export const MAX_TRACKED = 30;

export function validatedSourceUrl(input: string): string | null {
  const value = input.trim();
  if (!value) return "";
  if (value.length > 1000) return null;
  try {
    const parsed = new URL(value);
    if (!["https:", "http:"].includes(parsed.protocol) ||
        !parsed.hostname || parsed.username || parsed.password) return null;
    return parsed.toString();
  } catch {
    return null;
  }
}
export function createCareerItem(
  items: readonly CareerItem[], id: string, organization: string,
  position: string, sourceUrl: string
): CareerItem | null {
  const org = organization.trim(), role = position.trim(), url = validatedSourceUrl(sourceUrl);
  if (!id || items.some((x) => x.id === id) || items.length >= MAX_TRACKED ||
      !org || !role || org.length > 140 || role.length > 140 || url === null) return null;
  return { id, organization: org, position: role, sourceUrl: url, stage: "saved" };
}
export function updateCareerStage(
  items: readonly CareerItem[], id: string, next: ApplicationStage
): CareerItem[] {
  if (!["saved", "applied", "interview", "closed"].includes(next)) return [...items];
  return items.map((item) => item.id === id ? { ...item, stage: next } : item);
}
export function filterCareerItems(
  items: readonly CareerItem[], search: string, stage: ApplicationStage | "all"
): CareerItem[] {
  const term = search.trim().toLocaleLowerCase("tr-TR");
  return items.filter((item) =>
    (stage === "all" || item.stage === stage) &&
    (!term || (item.position + " " + item.organization).toLocaleLowerCase("tr-TR").includes(term))
  );
}
export function removeCareerItem(items: readonly CareerItem[], id: string): CareerItem[] {
  return items.filter((item) => item.id !== id);
}
