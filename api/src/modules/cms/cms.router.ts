import { Router } from "express";
import { homepageContent } from "./cms.seed";

export const cmsRouter = Router();

cmsRouter.get("/pages/home", (_req, res) => {
  res.json(homepageContent);
});

cmsRouter.get("/menus/main", (_req, res) => {
  res.json(homepageContent.menu);
});

cmsRouter.post("/pages/home", (_req, res) => {
  // The current scaffold has no persistence or authorization implementation.
  // Do not report success or echo potentially sensitive request bodies.
  res.status(501).json({
    code: "CMS_WRITE_NOT_IMPLEMENTED",
    message: "CMS sayfa güncelleme işlevi henüz uygulanmadı.",
    persisted: false,
  });
});
