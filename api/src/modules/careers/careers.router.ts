import { Router } from "express";

export const careersRouter = Router();

careersRouter.get("/", (_req, res) => {
  res.json({ module: "careers", actions: ["internships", "jobs", "applications", "pipeline", "matches"] });
});
