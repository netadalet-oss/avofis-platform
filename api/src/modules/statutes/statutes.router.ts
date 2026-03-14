import { Router } from "express";

export const statutesRouter = Router();

statutesRouter.get("/", (_req, res) => {
  res.json({ module: "statutes", actions: ["search", "detail", "article", "history", "related-cases", "bookmark"] });
});
