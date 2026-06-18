import { Router } from "express";
import * as courseController from "../controllers/courseController";
import { authenticate, requireTeacher } from "../middleware/authMiddleware";

const router = Router();

// ============================================================================
// COURSE ROUTES - CATALOG SERVICE
// Browse/discovery is public. Authoring (create/update/delete/manage) requires
// a valid token so courses can't be created or deleted anonymously.
// ============================================================================

// Browse & Discovery (Public) — declare static paths before the `/:id` param
router.get("/", courseController.getAllCourses);
router.get("/featured", courseController.getFeaturedCourses);
router.get("/categories", courseController.getCategories);
router.get("/difficulties", courseController.getDifficulties);
router.get("/tags", courseController.getTags);
router.get("/search", courseController.searchCourses);

// Teacher: courses owned by the authenticated teacher (for the studio "My Courses")
router.get("/mine", authenticate, requireTeacher, courseController.getMyCourses);

// Admin: full content tree WITH correct answers (for the authoring UI)
router.get("/:id/manage", authenticate, requireTeacher, courseController.getCourseForManage);

// Single course details (Public, answers hidden)
router.get("/:id", courseController.getCourseById);

// Admin: Course Authoring
router.post("/", authenticate, requireTeacher, courseController.createCompleteCourse);
router.put("/:id", authenticate, requireTeacher, courseController.updateCompleteCourse);
router.delete("/:id", authenticate, requireTeacher, courseController.deleteCompleteCourse);

export default router;
