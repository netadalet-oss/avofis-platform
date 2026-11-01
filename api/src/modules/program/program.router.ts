import { Router } from "express";

/**
 * AVOfis Seviye 1 / AV-003, AV-007, AV-062..077, AV-097.
 * Public read-only technical module overview; never inspect user claims,
 * records, service credentials, project IDs or protected database state.
 */
export const programRouter = Router();

export const API_MAIN_MODULES = [
  "admin", "analytics", "auth", "cases", "cms", "messaging",
  "notifications", "statutes", "support", "workspace"
] as const;

export const STAGE_ONE_COUNTS = {
  avTasks: 101,
  rRequirements: 594,
  rSections: 33,
  services: 17,
  audiences: 14,
  problemJourneys: 12,
  staffModules: 16,
  apiModules: 10,
  indProcedures: 8,
  justiceTasks: 16,
  staffProtocols: 10,
  launchBlockers: 18,
  milestones: 13,
  languages: 6
} as const;

programRouter.get("/overview", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.status(200).json({
    product: "AVOfis",
    level: 1,
    totalLevels: 12,
    stageStatus: "IN_PROGRESS",
    independentRAccepted: 0,
    liveRAccepted: 0,
    scope: STAGE_ONE_COUNTS,
    apiModules: API_MAIN_MODULES.map((id) => ({
      id,
      availability: "SCAFFOLD_NOT_AUTHORIZED",
      enabledActions: []
    })),
    publicCustomerLoginEnabled: false,
    personalDataIntakeEnabled: false,
    cmsPublicationEnabled: false,
    paymentEnabled: false,
    officialSubmissionEnabled: false,
    note: "Module presence and passing tests do not establish real authorization, independent acceptance or production release."
  });
});
