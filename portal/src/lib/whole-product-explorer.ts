/**
 * Stage-one local selection navigation for known public information routes.
 * Never generate external URL or a customer submission address from user input.
 */
export function previewInternalHref(
  kind: "service" | "journey",
  selectedId: string,
  allowedIds: readonly string[]
): string {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(selectedId) ||
      !allowedIds.includes(selectedId)) {
    return "/seviye-1-onizleme";
  }
  return kind === "service"
    ? "/hizmetler/" + selectedId
    : "/islemler#" + selectedId;
}

export function previewSelectionExists(
  selectedId: string,
  rows: readonly { id: string }[]
): boolean {
  return rows.some(row => row.id === selectedId);
}
