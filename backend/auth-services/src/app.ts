import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes";

dotenv.config();
const app = express();

// CORS allowlist — comma-separated origins (e.g. the Vercel URL), or "*" to reflect any.
const corsEnv = process.env.CORS_ORIGIN || "*";
const corsOrigin = corsEnv === "*" ? true : corsEnv.split(",").map((s) => s.trim()).filter(Boolean);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(helmet());

 
app.use((req, _res, next) => {
	console.log(`[REQ] ${req.method} ${req.originalUrl}`);
	next();
});

app.get("/health", (_req, res) => {
	res.json({ status: "ok", service: "auth-service" });
});

app.use("/auth", authRoutes);

export default app;
