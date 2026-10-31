import { Router } from "express";
import { unavailableModuleMetadata } from "../../security/module-availability";

export const careersRouter = Router();

careersRouter.get("/", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json(unavailableModuleMetadata("careers", ["internships", "jobs", "applications", "pipeline", "matches"]));
});
