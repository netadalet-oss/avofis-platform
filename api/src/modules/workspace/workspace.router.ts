import { Router } from "express";

export const workspaceRouter = Router();

workspaceRouter.get("/", (_req, res) => {
  res.json({ module: "workspace", actions: ["files", "tasks", "notes", "members", "versions"] });
});
