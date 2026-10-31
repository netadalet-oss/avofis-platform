import { Router } from "express";
import { unavailableModuleMetadata } from "../../security/module-availability";

export const casesRouter = Router();

casesRouter.get("/", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json(unavailableModuleMetadata("cases", ["search", "detail", "filters", "related", "bookmark", "notes"]));
});
