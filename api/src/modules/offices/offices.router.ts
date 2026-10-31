import { Router } from "express";
import { unavailableModuleMetadata } from "../../security/module-availability";

export const officesRouter = Router();

officesRouter.get("/", (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  res.json(unavailableModuleMetadata("offices", ["profiles", "members", "listings", "verification"]));
});
