import { Router } from "express";

export const connectRouter = Router();

connectRouter.get("/", (_req, res) => {
  res.json({ module: "connect", actions: ["wallet", "transactions", "earn", "spend", "pricing"] });
});
