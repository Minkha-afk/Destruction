import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chatRoutes";
import dotenv from "dotenv";

dotenv.config();

const app = express();

// CORS allowlist — comma-separated origins (e.g. the Vercel URL), or "*" to reflect any.
const corsEnv = process.env.CORS_ORIGIN || "*";
const corsOrigin = corsEnv === "*" ? true : corsEnv.split(",").map((s) => s.trim()).filter(Boolean);

if (!process.env.JWT_SECRET) {
	console.warn("[WARN] JWT_SECRET not set. Authenticated routes will fail until it's provided.");
}

app.use(cors({ origin: corsOrigin, credentials: true }));
app.use(express.json());

app.use("/chat", chatRoutes);

app.get("/health", (_req, res) => res.json({ ok: true, service: "chat-service" }));

export default app;
