import { Router } from "express";

export const forumRouter = Router();

forumRouter.get("/", (_req, res) => {
  res.json({ module: "forum", actions: ["categories", "topics", "posts", "votes", "best-answer", "reports"] });
});
