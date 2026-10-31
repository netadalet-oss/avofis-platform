import { Router } from "express";
import { homepageContent } from "./cms.seed";
import { rejectUnverifiedCmsMutation } from "../../lib/cms-write-gate";

export const cmsRouter = Router();

// Public, static, non-personal content remains readable.
cmsRouter.get("/pages/home", (_req, res) => {
  res.json(homepageContent);
});

cmsRouter.get("/menus/main", (_req, res) => {
  res.json(homepageContent.menu);
});

// Never infer write authority from client metadata, request body, or a CMS UI.
// Keep *all* write methods closed until a verified server-side publication
// workflow exists. A 503 is not a fake update or accepted draft.
cmsRouter.post("/pages/home", rejectUnverifiedCmsMutation);
cmsRouter.put("/pages/home", rejectUnverifiedCmsMutation);
cmsRouter.patch("/pages/home", rejectUnverifiedCmsMutation);
cmsRouter.delete("/pages/home", rejectUnverifiedCmsMutation);
