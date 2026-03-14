import { Router } from "express";
import { homepageContent } from "./cms.seed";

export const cmsRouter = Router();

cmsRouter.get("/pages/home", (_req, res) => {
  res.json(homepageContent);
});

cmsRouter.get("/menus/main", (_req, res) => {
  res.json(homepageContent.menu);
});

cmsRouter.post("/pages/home", (req, res) => {
  res.json({
    message: "Homepage content update endpoint scaffold hazır.",
    received: req.body
  });
});
