import { Router } from "express";
import { unavailableModuleMetadata } from "../../security/module-availability";

export const supportRouter = Router();

supportRouter.get("/", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json(unavailableModuleMetadata("support", ["tickets", "create", "reply", "status"]));
});
