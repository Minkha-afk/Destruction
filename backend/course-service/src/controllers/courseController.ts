import { Request, Response } from "express";
import { Enrollment } from "../models/Enrollment";
import { QuizAttempt } from "../models/QuizAttempt";
import { catalogService } from "../utils/catalogService";

// ============================================================================
// COURSE CONTROLLER - LEARNING SERVICE
// Owns: Enrollment, Progress, User's learning journey
// ============================================================================

/**
 * Enroll a user in a course.
 * Creates enrollment record and initializes progress for Level 1.
 */
export const enrollUser = async (req: Request, res: Response) => {
  try {
    const { userId, courseId } = req.body;

    if (!userId || !courseId) {
      return res.status(400).json({ error: "Missing required fields: userId and courseId" });
    }

    // Check if course exists in catalog
    const course = await catalogService.getCourse(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found in catalog" });
    }

    // Check if already enrolled
    const existing = await Enrollment.findOne({ userId, courseId });

    if (existing) {
      return res.status(200).json({
        status: "already_enrolled",
        enrollment: existing,
        message: "User is already enrolled in this course"
      });
    }

    // Build level progress (embedded) from the catalog course levels
    const levelProgress =
      course.levels && course.levels.length > 0
        ? [...course.levels]
            .sort((a: any, b: any) => a.order - b.order)
            .map((level: any, i: number) => ({
              levelId: level.id,
              levelOrder: level.order,
              isUnlocked: i === 0, // Only first level is unlocked initially
              isCompleted: false
            }))
        : [];

    // Create enrollment with embedded level progress
    const enrollment = await Enrollment.create({
      userId,
      courseId,
      status: "active",
      progress: 0,
      levelProgress
    });

    // Return enrollment with hydrated course data
    res.status(201).json({
      status: "enrolled",
      enrollment,
      course: course,
      message: "Successfully enrolled in course"
    });

  } catch (error) {
    console.error("[enrollUser] Error:", error);
    res.status(500).json({ error: "Failed to enroll user in course" });
  }
};

/**
 * Unenroll a user from a course.
 * Deletes enrollment and all related progress/attempts.
 */
export const unenrollUser = async (req: Request, res: Response) => {
  try {
    const { userId, courseId } = req.params;

    if (!userId || !courseId) {
      return res.status(400).json({ error: "userId and courseId are required" });
    }

    // Check if enrolled (and delete in one step)
    const enrollment = await Enrollment.findOneAndDelete({ userId, courseId });

    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    // Remove related quiz attempts (separate collection)
    await QuizAttempt.deleteMany({ userId, courseId });

    res.status(200).json({
      status: "unenrolled",
      message: "Successfully unenrolled from course"
    });

  } catch (error) {
    console.error("[unenrollUser] Error:", error);
    res.status(500).json({ error: "Failed to unenroll user from course" });
  }
};

/**
 * Get all courses a user is enrolled in.
 * Hydrates with course content from catalog-service.
 */
export const getUserCourses = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    // Get all enrollments
    const enrollments = await Enrollment.find({ userId }).sort({ enrolledAt: -1 });

    if (enrollments.length === 0) {
      return res.json({ enrollments: [], totalEnrolled: 0 });
    }

    // Hydrate with course content from catalog
    const hydratedEnrollments = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = await catalogService.getCourse(enrollment.courseId);

        const sortedLevelProgress = [...enrollment.levelProgress].sort(
          (a: any, b: any) => a.levelOrder - b.levelOrder
        );

        // Calculate detailed progress
        const completedLevels = sortedLevelProgress.filter((lp: any) => lp.isCompleted).length;
        const totalLevels = sortedLevelProgress.length;
        const currentLevel = sortedLevelProgress.find((lp: any) => lp.isUnlocked && !lp.isCompleted);

        return {
          ...enrollment.toJSON(),
          course,
          progressDetails: {
            completedLevels,
            totalLevels,
            percentComplete: totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0,
            currentLevelId: currentLevel?.levelId || null
          }
        };
      })
    );

    res.json({
      enrollments: hydratedEnrollments,
      totalEnrolled: enrollments.length
    });

  } catch (error) {
    console.error("[getUserCourses] Error:", error);
    res.status(500).json({ error: "Failed to fetch user courses" });
  }
};

/**
 * Get detailed progress for a specific enrollment.
 * Returns course content with user's progress overlaid.
 */
export const getEnrolledCourseDetails = async (req: Request, res: Response) => {
  try {
    const { userId, courseId } = req.params;

    if (!userId || !courseId) {
      return res.status(400).json({ error: "userId and courseId are required" });
    }

    // Get enrollment
    const enrollment = await Enrollment.findOne({ userId, courseId });

    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found" });
    }

    // Get quiz attempts (separate collection)
    const quizAttempts = await QuizAttempt.find({ userId, courseId }).sort({ startedAt: -1 });

    // Get course content from catalog
    const course = await catalogService.getCourse(courseId);
    if (!course) {
      return res.status(404).json({ error: "Course not found in catalog" });
    }

    const levelProgress = enrollment.levelProgress;

    // Merge progress into course levels
    const levelsWithProgress = course.levels?.map((level: any) => {
      const progress = levelProgress.find((lp: any) => lp.levelId === level.id);
      const attempts = quizAttempts.filter((qa: any) => qa.levelId === level.id);
      const bestAttempt = attempts.find((a: any) => a.passed) || attempts[0];

      return {
        ...level,
        userProgress: {
          isUnlocked: progress?.isUnlocked || false,
          isCompleted: progress?.isCompleted || false,
          completedAt: progress?.completedAt || null,
          quizAttempts: attempts.length,
          bestScore: bestAttempt?.score || null,
          passed: bestAttempt?.passed || false
        }
      };
    }) || [];

    // Calculate overall progress
    const completedLevels = levelProgress.filter((lp: any) => lp.isCompleted).length;
    const totalLevels = levelProgress.length;

    res.json({
      enrollment: {
        id: enrollment.id,
        enrolledAt: enrollment.enrolledAt,
        status: enrollment.status,
        progress: enrollment.progress
      },
      course: {
        ...course,
        levels: levelsWithProgress
      },
      progressSummary: {
        completedLevels,
        totalLevels,
        percentComplete: totalLevels > 0 ? Math.round((completedLevels / totalLevels) * 100) : 0,
        isCompleted: completedLevels === totalLevels && totalLevels > 0
      }
    });

  } catch (error) {
    console.error("[getEnrolledCourseDetails] Error:", error);
    res.status(500).json({ error: "Failed to fetch enrolled course details" });
  }
};

/**
 * Get unlocked levels for a user in a course.
 */
export const getUnlockedLevels = async (req: Request, res: Response) => {
  try {
    const { userId, courseId } = req.params;

    if (!userId || !courseId) {
      return res.status(400).json({ error: "userId and courseId are required" });
    }

    const enrollment = await Enrollment.findOne({ userId, courseId });

    const levelProgress = enrollment
      ? [...enrollment.levelProgress]
          .filter((lp: any) => lp.isUnlocked)
          .sort((a: any, b: any) => a.levelOrder - b.levelOrder)
      : [];

    // Hydrate with level content
    const course = await catalogService.getCourse(courseId);
    const unlockedLevels = levelProgress.map((lp: any) => {
      const level = course?.levels?.find((l: any) => l.id === lp.levelId);
      return {
        ...lp.toJSON(),
        level
      };
    });

    res.json(unlockedLevels);

  } catch (error) {
    console.error("[getUnlockedLevels] Error:", error);
    res.status(500).json({ error: "Failed to fetch unlocked levels" });
  }
};

/**
 * Check enrollment status for a user+course.
 */
export const checkEnrollment = async (req: Request, res: Response) => {
  try {
    const { userId, courseId } = req.params;

    const enrollment = await Enrollment.findOne({ userId, courseId });

    res.json({
      isEnrolled: !!enrollment,
      enrollment: enrollment || null
    });

  } catch (error) {
    console.error("[checkEnrollment] Error:", error);
    res.status(500).json({ error: "Failed to check enrollment status" });
  }
};
