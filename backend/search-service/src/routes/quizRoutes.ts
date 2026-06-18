import { Router } from "express";
import * as quizController from "../controllers/quizController";
import { internalOnly } from "../middleware/internalAuth";

const router = Router();

// ============================================================================
// QUIZ ROUTES - CATALOG SERVICE (READ-ONLY)
// Only serves quiz content. All attempts/scoring is handled by learning-service.
// ============================================================================

// Get quiz (sanitized - no isCorrect flags)
router.get("/:id", quizController.getQuiz);

// Internal grading endpoint (called by learning-service only).
// Returns correct answers, so it's guarded by a shared internal secret.
router.get("/:id/grade", internalOnly, quizController.getQuizForGrading);

export default router;
