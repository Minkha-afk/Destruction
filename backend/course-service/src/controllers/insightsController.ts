import { Request, Response } from "express";
import { Enrollment } from "../models/Enrollment";
import { QuizAttempt } from "../models/QuizAttempt";

// ============================================================================
// INSIGHTS CONTROLLER - LEARNING SERVICE
// Aggregates enrollment + quiz-attempt analytics for a set of courses.
// Used by the teacher studio to show insights into the teacher's own courses.
// ============================================================================

const round = (n: number) => Math.round((n || 0) * 10) / 10;

/**
 * POST /insights/courses  { courseIds: string[] }
 * Returns per-course stats plus rolled-up totals.
 */
export const getCourseInsights = async (req: Request, res: Response) => {
  try {
    const courseIds: string[] = Array.isArray(req.body?.courseIds)
      ? req.body.courseIds.filter((id: any) => typeof id === "string" && id)
      : [];

    if (courseIds.length === 0) {
      return res.json({
        totals: {
          courses: 0,
          totalEnrollments: 0,
          activeLearners: 0,
          completions: 0,
          avgProgress: 0,
          totalAttempts: 0,
          passedAttempts: 0,
          passRate: 0,
          avgScore: 0,
        },
        perCourse: [],
      });
    }

    const [enrollAgg, attemptAgg] = await Promise.all([
      Enrollment.aggregate([
        { $match: { courseId: { $in: courseIds } } },
        {
          $group: {
            _id: "$courseId",
            enrollments: { $sum: 1 },
            avgProgress: { $avg: "$progress" },
            completions: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
            },
            activeLearners: {
              $sum: {
                $cond: [
                  { $and: [{ $gt: ["$progress", 0] }, { $lt: ["$progress", 100] }] },
                  1,
                  0,
                ],
              },
            },
          },
        },
      ]),
      QuizAttempt.aggregate([
        { $match: { courseId: { $in: courseIds }, status: "completed" } },
        {
          $group: {
            _id: "$courseId",
            attempts: { $sum: 1 },
            passed: { $sum: { $cond: ["$passed", 1, 0] } },
            avgScore: { $avg: "$score" },
          },
        },
      ]),
    ]);

    const enrollById = new Map<string, any>(enrollAgg.map((e: any) => [e._id, e]));
    const attemptById = new Map<string, any>(attemptAgg.map((a: any) => [a._id, a]));

    const perCourse = courseIds.map((courseId) => {
      const e = enrollById.get(courseId) || {};
      const a = attemptById.get(courseId) || {};
      const enrollments = e.enrollments || 0;
      const attempts = a.attempts || 0;
      const passed = a.passed || 0;
      return {
        courseId,
        enrollments,
        activeLearners: e.activeLearners || 0,
        completions: e.completions || 0,
        avgProgress: round(e.avgProgress || 0),
        attempts,
        passedAttempts: passed,
        passRate: attempts > 0 ? Math.round((passed / attempts) * 100) : 0,
        avgScore: round(a.avgScore || 0),
      };
    });

    const totalEnrollments = perCourse.reduce((s, c) => s + c.enrollments, 0);
    const completions = perCourse.reduce((s, c) => s + c.completions, 0);
    const activeLearners = perCourse.reduce((s, c) => s + c.activeLearners, 0);
    const totalAttempts = perCourse.reduce((s, c) => s + c.attempts, 0);
    const passedAttempts = perCourse.reduce((s, c) => s + c.passedAttempts, 0);
    const avgProgress = perCourse.length
      ? round(perCourse.reduce((s, c) => s + c.avgProgress, 0) / perCourse.length)
      : 0;
    const avgScore = totalAttempts
      ? round(
          perCourse.reduce((s, c) => s + c.avgScore * c.attempts, 0) / totalAttempts
        )
      : 0;

    res.json({
      totals: {
        courses: courseIds.length,
        totalEnrollments,
        activeLearners,
        completions,
        avgProgress,
        totalAttempts,
        passedAttempts,
        passRate: totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0,
        avgScore,
      },
      perCourse,
    });
  } catch (error) {
    console.error("[getCourseInsights] Error:", error);
    res.status(500).json({ error: "Failed to fetch course insights" });
  }
};
