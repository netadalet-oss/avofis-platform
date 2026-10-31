import type { Express } from "express";
import cors from "cors";
import express from "express";
import { configuredCorsOrigins } from "./cors-origin";

/**
 * AV-019 / Seviye 1: centralize transport controls for every API route.
 * The limit bounds only parsed JSON, not file uploads or network traffic.
 * These controls do not establish user authorization, CSRF protection or RLS.
 */
export const API_JSON_BODY_LIMIT = "64kb";

export function configureApiHttpSecurity(
  app: Express,
  allowedOrigins = process.env.CORS_ORIGIN
): void {
  app.disable("x-powered-by");
  app.use((_request, response, next) => {
    response.setHeader("X-Content-Type-Options", "nosniff");
    next();
  });
  app.use(cors({ origin: configuredCorsOrigins(allowedOrigins), credentials: false }));
  app.use(express.json({ limit: API_JSON_BODY_LIMIT, strict: true }));
}
