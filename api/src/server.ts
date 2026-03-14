import express from "express";
import cors from "cors";
import { cmsRouter } from "./modules/cms/cms.router";
import { authRouter } from "./modules/auth/auth.router";
import { casesRouter } from "./modules/cases/cases.router";
import { statutesRouter } from "./modules/statutes/statutes.router";
import { forumRouter } from "./modules/forum/forum.router";
import { careersRouter } from "./modules/careers/careers.router";
import { officesRouter } from "./modules/offices/offices.router";
import { workspaceRouter } from "./modules/workspace/workspace.router";
import { notificationsRouter } from "./modules/notifications/notifications.router";
import { messagingRouter } from "./modules/messaging/messaging.router";
import { connectRouter } from "./modules/connect/connect.router";
import { analyticsRouter } from "./modules/analytics/analytics.router";
import { supportRouter } from "./modules/support/support.router";
import { adminRouter } from "./modules/admin/admin.router";

const app = express();
app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json({ limit: "10mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "avofis-api" });
});

app.use("/api/auth", authRouter);
app.use("/api/cms", cmsRouter);
app.use("/api/cases", casesRouter);
app.use("/api/statutes", statutesRouter);
app.use("/api/forum", forumRouter);
app.use("/api/careers", careersRouter);
app.use("/api/offices", officesRouter);
app.use("/api/workspace", workspaceRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/messaging", messagingRouter);
app.use("/api/connect", connectRouter);
app.use("/api/analytics", analyticsRouter);
app.use("/api/support", supportRouter);
app.use("/api/admin", adminRouter);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`API running on http://localhost:${port}`);
});
