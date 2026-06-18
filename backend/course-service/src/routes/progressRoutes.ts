import { Router } from "express";
import * as progressController from "../controllers/progressController";

const router = Router();

// ============================================================================
// PROGRESS ROUTES - LEARNING SERVICE
// These endpoints own user progress tracking
// ============================================================================

// Get progress
router.get("/user/:userId", progressController.getProgress);
router.get("/user/:userId/course/:courseId", progressController.getCourseProgress);

// Admin/testing routes
router.post("/complete-level", progressController.completeLevel);
router.delete("/user/:userId/course/:courseId/reset", progressController.resetProgress);

export default router;
