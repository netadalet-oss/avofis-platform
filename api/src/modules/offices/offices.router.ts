import { Router } from "express";

export const officesRouter = Router();

officesRouter.get("/", (_req, res) => {
  res.json({ module: "offices", actions: ["profiles", "members", "listings", "verification"] });
});
