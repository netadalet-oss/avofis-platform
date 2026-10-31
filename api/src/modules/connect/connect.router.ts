import { Router } from "express";
import { unavailableModuleMetadata } from "../../security/module-availability";

export const connectRouter = Router();

connectRouter.get("/", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json(unavailableModuleMetadata("connect", ["wallet", "transactions", "earn", "spend", "pricing"]));
});
