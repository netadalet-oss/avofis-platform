import { Router } from "express";
import { unavailableModuleMetadata } from "../../security/module-availability";

export const messagingRouter = Router();

messagingRouter.get("/", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json(unavailableModuleMetadata("messaging", ["threads", "messages", "attachments", "status"]));
});
