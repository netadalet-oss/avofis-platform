import { Router } from "express";

export const notificationsRouter = Router();

notificationsRouter.get("/", (_req, res) => {
  res.json({ module: "notifications", actions: ["list", "mark-read", "preferences", "templates"] });
});
