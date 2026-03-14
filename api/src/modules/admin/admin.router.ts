import { Router } from "express";

export const adminRouter = Router();

adminRouter.get("/", (_req, res) => {
  res.json({ module: "admin", actions: ["dashboard", "users", "roles", "audit", "settings"] });
});
