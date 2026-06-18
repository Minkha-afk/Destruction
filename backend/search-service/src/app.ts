import "dotenv/config";
import express from "express";
import cors from "cors";
import courseRoutes from "./routes/courseRoutes";
import quizRoutes from "./routes/quizRoutes";

const app = express();

// CORS — comma-separated allowlist (e.g. the Vercel URL) or "*" to reflect any origin.
const corsEnv = process.env.CORS_ORIGIN || "*";
const corsOrigin = corsEnv === "*" ? true : corsEnv.split(",").map((s) => s.trim()).filter(Boolean);
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json({ limit: "1mb" }));

// Lightweight request logging
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/courses", courseRoutes);
app.use("/quizzes", quizRoutes);

// Health check
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "course-search-service",
    includes: ["courses", "quizzes"]
  });
});

// 404 handler (after all routes)
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Centralized error handler (must be last, 4 args)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[catalog-service] Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    details: process.env.NODE_ENV === "development" && err instanceof Error ? err.message : undefined,
  });
});

export default app;
