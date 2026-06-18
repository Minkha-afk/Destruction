import { Router } from "express";
import * as courseController from "../controllers/courseController";

const router = Router();

// ============================================================================
// COURSE ROUTES - LEARNING SERVICE
// These endpoints own user enrollment and course access
// ============================================================================

// Enrollment routes
router.post("/enroll", courseController.enrollUser);
router.get("/user/:userId", courseController.getUserCourses);
router.get("/user/:userId/course/:courseId", courseController.getEnrolledCourseDetails);
router.get("/user/:userId/course/:courseId/levels/unlocked", courseController.getUnlockedLevels);
router.delete("/user/:userId/course/:courseId", courseController.unenrollUser);

// Quick enrollment check
router.get("/user/:userId/course/:courseId/status", courseController.checkEnrollment);

export default router;
