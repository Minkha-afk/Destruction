import "dotenv/config"; // load .env BEFORE any other module reads process.env
import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app";
import { chatSocket } from "./socket/chatSocket";
import { connectDB } from "./utils/db";

const PORT = process.env.PORT || 5000;

// CORS allowlist for socket.io — comma-separated origins or "*" to reflect any.
const corsEnv = process.env.CORS_ORIGIN || "*";
const corsOrigin = corsEnv === "*" ? true : corsEnv.split(",").map((s) => s.trim()).filter(Boolean);

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { origin: corsOrigin, credentials: true },
});

chatSocket(io);

const start = async () => {
  try {
    await connectDB();
    httpServer.listen(PORT, () => {
      console.log(`Chat service running on port ${PORT}`);
    });
  } catch (error) {
    console.error("[chat-service] Failed to start", error);
    process.exit(1);
  }
};

start();
