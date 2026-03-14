import { Router } from "express";

export const supportRouter = Router();

supportRouter.get("/", (_req, res) => {
  res.json({ module: "support", actions: ["tickets", "create", "reply", "status"] });
});
