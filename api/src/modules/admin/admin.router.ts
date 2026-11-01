import { Router } from "express";
import { unavailableModuleMetadata } from "../../security/module-availability";

export const adminRouter = Router();

adminRouter.get("/", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json(unavailableModuleMetadata("admin", ["dashboard", "users", "roles", "audit", "settings"]));
});
