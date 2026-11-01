import { Router } from "express";
import { unavailableModuleMetadata } from "../../security/module-availability";

export const notificationsRouter = Router();

notificationsRouter.get("/", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json(unavailableModuleMetadata("notifications", ["list", "mark-read", "preferences", "templates"]));
});
