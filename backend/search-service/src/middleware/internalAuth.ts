import { Request, Response, NextFunction } from "express";

// ============================================================================
// INTERNAL AUTH - CATALOG SERVICE
// Guards service-to-service endpoints (e.g. quiz grading, which exposes the
// correct answers). Only trusted backend services that know the shared secret
// may call these. Never expose the secret to the browser.
// ============================================================================

let warned = false;

export const internalOnly = (req: Request, res: Response, next: NextFunction) => {
  const expected = process.env.INTERNAL_API_SECRET;

  // If no secret is configured we allow the call but warn loudly once, so local
  // dev keeps working while signalling that the endpoint is unprotected.
  if (!expected) {
    if (!warned) {
      console.warn(
        "[catalog-service] INTERNAL_API_SECRET is not set — internal endpoints (e.g. quiz grading) are UNPROTECTED."
      );
      warned = true;
    }
    return next();
  }

  const provided = req.headers["x-internal-secret"];
  if (provided !== expected) {
    return res.status(403).json({ error: "Forbidden: internal endpoint" });
  }
  next();
};
