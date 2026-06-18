import { Router } from "express";
import * as insightsController from "../controllers/insightsController";

const router = Router();

// ============================================================================
// INSIGHTS ROUTES - LEARNING SERVICE
// Analytics for teacher studio (enrollments, completions, quiz performance).
// ============================================================================

router.post("/courses", insightsController.getCourseInsights);

export default router;
