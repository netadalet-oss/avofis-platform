/**
 * AVOfis Seviye 1: code scaffolds are not functional endpoints.
 * A list of intended actions must never be presented as enabled capabilities.
 */
export function unavailableModuleMetadata(module: string, plannedActions: readonly string[]) {
  if (!/^[a-z-]{2,32}$/.test(module) || plannedActions.some(action=>!/^[a-z-]{2,48}$/.test(action))) {
    throw new Error("INVALID_MODULE_SCAFFOLD");
  }
  return {
    module,
    stage: 1,
    availability: "SCAFFOLD_NOT_AUTHORIZED",
    enabledActions: [] as string[],
    plannedActions: [...plannedActions],
    note: "Planned items are not callable operations, account authority, production acceptance or customer data access."
  };
}
