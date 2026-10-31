import { Router } from "express";
import { unavailableModuleMetadata } from "../../security/module-availability";

export const forumRouter = Router();

forumRouter.get("/", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json(unavailableModuleMetadata("forum", ["categories", "topics", "posts", "votes", "best-answer", "reports"]));
});
