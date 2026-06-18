import express from "express";
import cors from "cors";
import courseRoutes from "./routes/courseRoutes";
import progressRoutes from "./routes/progressRoutes";
import quizRoutes from "./routes/quizRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import insightsRoutes from "./routes/insightsRoutes";

const app = express();

// CORS — comma-separated allowlist (e.g. the Vercel URL) or "*" to reflect any origin.
const corsEnv = process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "*";
const corsOrigin = corsEnv === "*" ? true : corsEnv.split(",").map((s) => s.trim()).filter(Boolean);
app.use(cors({
  origin: corsOrigin,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Middleware
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use("/courses", courseRoutes);
app.use("/progress", progressRoutes);
app.use("/quiz", quizRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/insights", insightsRoutes);

// Health check route
app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "course-service" });
});

// 404 handler (after all routes, before the error handler)
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Centralized error handler (must be last, 4 args)
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("[course-service] Unhandled error:", err);
  res.status(500).json({
    error: "Internal server error",
    message: process.env.NODE_ENV === "development" ? err?.message : "Something went wrong"
  });
});

export default app;
