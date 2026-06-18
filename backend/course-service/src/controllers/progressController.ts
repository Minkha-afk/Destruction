import { Request, Response } from "express";
import { Enrollment } from "../models/Enrollment";
import { QuizAttempt } from "../models/QuizAttempt";
import { catalogService } from "../utils/catalogService";

// ============================================================================
// PROGRESS CONTROLLER - LEARNING SERVICE
// Owns: Level progress, unlock status, course completion tracking
// ============================================================================

/**
 * Get progress for a user across all enrolled courses.
 */
export const getProgress = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const enrollments = await Enrollment.find({ userId }).sort({ enrolledAt: -1 });

    // Hydrate with course details
    const progressData = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await catalogService.getCourse(enrollment.courseId);

        const sortedLevelProgress = [...enrollment.levelProgress].sort(
          (a: any, b: any) => a.levelOrder - b.levelOrder
        );

        const completedLevels = sortedLevelProgress.filter((lp: any) => lp.isCompleted).length;
        const totalLevels = sortedLevelProgress.length;

        return {
          courseId: enrollment.courseId,
          courseTitle: course?.title || "Unknown Course",
          enrolledAt: enrollment.enrolledAt,
          status: enrollment.status,
          progress: enrollment.progress,
          completedLevels,
          totalLevels,
          levelProgress: sortedLevelProgress.map((lp: any) => ({
            levelId: lp.levelId,
            levelOrder: lp.levelOrder,
            isUnlocked: lp.isUnlocked,
            isCompleted: lp.isCompleted,
            completedAt: lp.completedAt
          }))
        };
      })
    );

    res.json(progressData);

  } catch (error) {
    console.error("[getProgress] Error:", error);
    res.status(500).json({ error: "Failed to fetch progress" });
  }
};

/**
 * Get progress for a specific course.
 */
export const getCourseProgress = async (req: Request, res: Response) => {
  try {
    const { userId, courseId } = req.params;

    if (!userId || !courseId) {
      return res.status(400).json({ error: "userId and courseId are required" });
    }

    const enrollment = await Enrollment.findOne({ userId, courseId });

    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    const completedAttempts = await QuizAttempt.find({
      userId,
      courseId,
      status: "completed"
    }).sort({ completedAt: -1 });

    // Get course from catalog
    const course = await catalogService.getCourse(courseId);

    const sortedLevelProgress = [...enrollment.levelProgress].sort(
      (a: any, b: any) => a.levelOrder - b.levelOrder
    );

    // Build detailed progress per level
    const levelDetails = await Promise.all(
      sortedLevelProgress.map(async (lp: any) => {
        const level = course?.levels?.find((l: any) => l.id === lp.levelId);
        const levelAttempts = completedAttempts.filter((qa: any) => qa.levelId === lp.levelId);
        const bestAttempt = levelAttempts.reduce((best: any, curr: any) =>
          (!best || (curr.score || 0) > (best.score || 0)) ? curr : best, null);

        return {
          levelId: lp.levelId,
          levelTitle: level?.title || "Unknown Level",
          levelOrder: lp.levelOrder,
          isUnlocked: lp.isUnlocked,
          isCompleted: lp.isCompleted,
          completedAt: lp.completedAt,
          quizAttempts: levelAttempts.length,
          bestScore: bestAttempt?.score || null,
          passed: bestAttempt?.passed || false
        };
      })
    );

    res.json({
      courseId,
      courseTitle: course?.title || "Unknown Course",
      enrolledAt: enrollment.enrolledAt,
      status: enrollment.status,
      overallProgress: enrollment.progress,
      completedLevels: enrollment.levelProgress.filter((lp: any) => lp.isCompleted).length,
      totalLevels: enrollment.levelProgress.length,
      levels: levelDetails
    });

  } catch (error) {
    console.error("[getCourseProgress] Error:", error);
    res.status(500).json({ error: "Failed to fetch course progress" });
  }
};

/**
 * Manually mark a level as completed (admin/testing use).
 */
export const completeLevel = async (req: Request, res: Response) => {
  try {
    const { userId, courseId, levelId } = req.body;

    if (!userId || !courseId || !levelId) {
      return res.status(400).json({ error: "userId, courseId, and levelId are required" });
    }

    const enrollment = await Enrollment.findOne({ userId, courseId });

    if (!enrollment) {
      return res.status(404).json({ error: "Level progress not found" });
    }

    // Mark level as completed
    const levelProgress = enrollment.levelProgress.find((lp: any) => lp.levelId === levelId);

    if (!levelProgress) {
      return res.status(404).json({ error: "Level progress not found" });
    }

    levelProgress.isCompleted = true;
    levelProgress.completedAt = new Date();

    // Unlock next level
    const nextLevel = enrollment.levelProgress.find(
      (lp: any) => lp.levelOrder === levelProgress.levelOrder + 1
    );

    if (nextLevel && !nextLevel.isUnlocked) {
      nextLevel.isUnlocked = true;
    }

    // Update overall progress
    const allProgress = enrollment.levelProgress;
    const completedCount = allProgress.filter((lp: any) => lp.isCompleted).length;
    const totalCount = allProgress.length;
    const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

    enrollment.progress = progressPercent;
    enrollment.status = progressPercent === 100 ? "completed" : "active";

    await enrollment.save();

    res.json({
      message: "Level marked as completed",
      levelProgress,
      nextLevelUnlocked: !!nextLevel,
      progressPercent
    });

  } catch (error) {
    console.error("[completeLevel] Error:", error);
    res.status(500).json({ error: "Failed to complete level" });
  }
};

/**
 * Reset progress for a course (re-enroll).
 */
export const resetProgress = async (req: Request, res: Response) => {
  try {
    const { userId, courseId } = req.params;

    if (!userId || !courseId) {
      return res.status(400).json({ error: "userId and courseId are required" });
    }

    // Get course to reinitialize levels
    const course = await catalogService.getCourse(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    const enrollment = await Enrollment.findOne({ userId, courseId });
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    // Delete all quiz attempts for this course
    await QuizAttempt.deleteMany({ userId, courseId });

    // Recreate level progress (embedded)
    enrollment.levelProgress =
      course.levels && course.levels.length > 0
        ? [...course.levels]
            .sort((a: any, b: any) => a.order - b.order)
            .map((level: any, i: number) => ({
              levelId: level.id,
              levelOrder: level.order,
              isUnlocked: i === 0,
              isCompleted: false
            }))
        : [];

    // Reset enrollment progress
    enrollment.progress = 0;
    enrollment.status = "active";

    await enrollment.save();

    res.json({
      message: "Progress reset successfully",
      courseId
    });

  } catch (error) {
    console.error("[resetProgress] Error:", error);
    res.status(500).json({ error: "Failed to reset progress" });
  }
};
