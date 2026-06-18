import { Router } from "express";
import * as quizController from "../controllers/quizController";

const router = Router();

// ============================================================================
// QUIZ ROUTES - LEARNING SERVICE
// These endpoints own quiz attempts, grading, and progression
// ============================================================================

// Quiz attempt lifecycle
router.post("/start", quizController.startQuiz);
router.post("/submit", quizController.submitQuiz);

// Results and history
router.get("/results/:attemptId", quizController.getQuizResults);
router.get("/user/:userId/history", quizController.getUserQuizHistory);

// Statistics
router.get("/:quizId/stats", quizController.getQuizStats);

// Get quiz (reads from catalog, kept for convenience)
router.get("/:id", quizController.getQuiz);

export default router;
