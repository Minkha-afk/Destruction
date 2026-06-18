import "dotenv/config"; // load .env BEFORE any other module reads process.env
import app from "./app";
import { connectDB } from "./utils/db";

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Auth Service running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("[auth-service] Failed to connect to MongoDB:", err.message);
    process.exit(1);
  });
