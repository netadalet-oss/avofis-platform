import { Router } from "express";

export const authRouter = Router();

authRouter.get("/", (_req, res) => {
  res.json({ module: "auth", actions: ["register", "login", "logout", "refresh", "forgot-password", "verify-email"] });
});
