import "dotenv/config";
import app from "./app";
import { connectDB } from "./utils/db";

const PORT = process.env.PORT || 6100;

const start = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("[learning-service] Failed to start:", error);
    process.exit(1);
  }
};

start();
