import "dotenv/config";
import app from "./app";
import { connectDB } from "./utils/db";

const PORT = process.env.PORT || 7000;

// Connect to MongoDB BEFORE accepting traffic. On failure, log and exit so the
// process doesn't serve requests against a dead DB connection.
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🔍 Course Search & Quiz Service running on http://localhost:${PORT}`);
      console.log(`📚 Course API: http://localhost:${PORT}/api/courses`);
      console.log(`🧠 Quiz API: http://localhost:${PORT}/api/quizzes`);
      console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    });
  })
  .catch((error) => {
    console.error("[catalog-service] Failed to connect to MongoDB:", error);
    process.exit(1);
  });
