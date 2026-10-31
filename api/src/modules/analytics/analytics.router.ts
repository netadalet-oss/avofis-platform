import { Router } from "express";
import { unavailableModuleMetadata } from "../../security/module-availability";

export const analyticsRouter = Router();

analyticsRouter.get("/", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json(unavailableModuleMetadata("analytics", ["overview", "content", "careers", "forum", "conversion"]));
});
