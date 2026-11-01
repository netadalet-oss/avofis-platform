/** AV-097, Level 2: an explicitly closed entry/process/result topology. */
export const PROGRAM_FLOW_STAGES = [
  "ENTRY",
  "SYNTHETIC_PREPARATION",
  "HUMAN_REVIEW_REQUIRED",
  "CLOSED_NO_TRANSACTION"
] as const;

export function programFlowSkeleton(modules: readonly string[]) {
  if (modules.length !== 10 || new Set(modules).size !== 10 ||
      modules.some(module => !/^[a-z]{2,32}$/.test(module))) {
    throw new Error("INVALID_API_MODULE_FLOW_INVENTORY");
  }
  return modules.map(module => ({
    module,
    flow: [...PROGRAM_FLOW_STAGES],
    entry: "/api/program/overview",
    result: "SCAFFOLD_NOT_AUTHORIZED" as const,
    enabledOperations: [] as string[],
    requiresBeforeRelease: [
      "INDEPENDENT_STAGING",
      "SERVER_AUTH_AND_AAL2",
      "TENANT_RLS_VERIFICATION",
      "HUMAN_AND_LEGAL_APPROVAL"
    ] as const
  }));
}
