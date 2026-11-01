import { Router } from "express";

export const authRouter = Router();

// AV-025 / Seviye 1: this is only a scaffold. The real Identity Provider,
// verified company and public onboarding consent are not yet approved.
// Never advertise disabled registration/login handlers as available actions.
authRouter.get("/", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.status(503).json({
    module: "auth",
    code: "PUBLIC_AUTH_UNAVAILABLE",
    registrationEnabled: false,
    loginEnabled: false,
    enabledActions: [],
    message: "Hesap işlemleri bağımsız güvenlik ve hukukî onay tamamlanana kadar kapalıdır."
  });
});
