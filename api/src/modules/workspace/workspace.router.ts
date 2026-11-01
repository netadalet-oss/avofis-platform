import { Router } from "express";
import { unavailableModuleMetadata } from "../../security/module-availability";

export const workspaceRouter = Router();

workspaceRouter.get("/", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json(unavailableModuleMetadata("workspace", ["files", "tasks", "notes", "members", "versions"]));
});
