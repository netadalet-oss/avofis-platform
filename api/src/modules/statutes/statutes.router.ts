import { Router } from "express";
import { unavailableModuleMetadata } from "../../security/module-availability";

export const statutesRouter = Router();

statutesRouter.get("/", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json(unavailableModuleMetadata("statutes", ["search", "detail", "article", "history", "related-cases", "bookmark"]));
});
