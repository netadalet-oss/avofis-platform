import { Router } from "express";

export const analyticsRouter = Router();

analyticsRouter.get("/", (_req, res) => {
  res.json({ module: "analytics", actions: ["overview", "content", "careers", "forum", "conversion"] });
});
