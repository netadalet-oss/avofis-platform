import type { ErrorRequestHandler, Express } from "express";
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


/**
 * Last middleware: Express's default HTML error handler can disclose
 * framework internals (especially under development NODE_ENV).
 * Return only fixed, non-reflective API codes after every application route.
 * Place this AFTER routes, never before authentication/authorization layers.
 */
export function installApiErrorResponses(app: Express): void {
  const handler: ErrorRequestHandler = (error, _request, response, _next) => {
    if (response.headersSent) {
      // The response is already committed; never send a second body.
      response.end();
      return;
    }
    const errorType = error && typeof error === "object" && "type" in error
      ? String(error.type) : "";
    const status = errorType === "entity.too.large" ? 413 :
      errorType === "entity.parse.failed" ? 400 : 500;
    const code = status === 413 ? "REQUEST_TOO_LARGE" :
      status === 400 ? "INVALID_JSON" : "REQUEST_FAILED";
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    response.status(status).json({ error: code });
  };
  app.use(handler);
}
