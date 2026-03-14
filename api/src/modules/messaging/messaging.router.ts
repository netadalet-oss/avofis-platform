import { Router } from "express";

export const messagingRouter = Router();

messagingRouter.get("/", (_req, res) => {
  res.json({ module: "messaging", actions: ["threads", "messages", "attachments", "status"] });
});
