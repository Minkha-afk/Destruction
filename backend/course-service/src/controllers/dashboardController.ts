import { Request, Response } from "express";
import { Enrollment } from "../models/Enrollment";
import { QuizAttempt } from "../models/QuizAttempt";
import { catalogService } from "../utils/catalogService";

type ActivityEvent = {
  type: "quiz" | "level" | "enroll";
  title: string;
  occurredAt: Date;
  score?: number;
  status?: "Passed" | "Failed";
};

const formatActivityTimestamp = (date: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);

const courseImage = (course: any) => course?.imageUrl || "";

const findLevel = (course: any, levelId: string) =>
  course?.levels?.find((level: any) => level.id === levelId);

const findQuiz = (course: any, quizId: string) => {
  for (const level of course?.levels || []) {
    const quiz = level.quizzes?.find((item: any) => item.id === quizId);
    if (quiz) return quiz;
  }

  return null;
};

/**
 * Build the dashboard from learning state plus catalog metadata.
 */
export const getUserDashboard = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const enrollments = await Enrollment.find({ userId }).sort({ enrolledAt: -1 });

    // Embedded levelProgress sorted by levelOrder (mirrors orderBy: levelOrder asc)
    enrollments.forEach((enrollment) => {
      enrollment.levelProgress.sort((a: any, b: any) => a.levelOrder - b.levelOrder);
    });

    const completedAttempts = await QuizAttempt.find({
      userId,
      status: "completed",
    }).sort({ completedAt: -1, startedAt: -1 });

    const courseIds = Array.from(
      new Set([
        ...enrollments.map((enrollment) => enrollment.courseId),
        ...completedAttempts.map((attempt) => attempt.courseId),
      ])
    );

    const coursesResponse = await catalogService.getAllCourses({ page: 1, limit: 100 });
    const catalogCourses = ((coursesResponse?.courses || []) as any[]);
    const coursesById = new Map<string, any>();

    catalogCourses.forEach((course) => {
      if (courseIds.includes(course.id)) {
        coursesById.set(course.id, course);
      }
    });

    const missingCourseIds = courseIds.filter((courseId) => !coursesById.has(courseId));
    await Promise.all(
      missingCourseIds.map(async (courseId) => {
        const course = await catalogService.getCourse(courseId);
        if (course) coursesById.set(courseId, course);
      })
    );

    const averageProgress = enrollments.length
      ? Math.round(enrollments.reduce((sum, enrollment) => sum + (enrollment.progress || 0), 0) / enrollments.length)
      : 0;

    const passedAttempts = completedAttempts.filter((attempt) => attempt.passed);
    const failedAttempts = completedAttempts.filter((attempt) => !attempt.passed);
    const averageScore = completedAttempts.length
      ? Math.round(completedAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / completedAttempts.length)
      : 0;

    const activeEnrollment =
      enrollments.find((enrollment) => enrollment.progress > 0 && enrollment.progress < 100) ||
      enrollments.find((enrollment) => enrollment.progress < 100) ||
      enrollments[0];

    const nextLesson = activeEnrollment
      ? (() => {
          const course = coursesById.get(activeEnrollment.courseId);
          const nextLevel =
            activeEnrollment.levelProgress.find((level: any) => level.isUnlocked && !level.isCompleted) ||
            activeEnrollment.levelProgress.find((level: any) => !level.isCompleted) ||
            activeEnrollment.levelProgress[activeEnrollment.levelProgress.length - 1];
          const level = nextLevel ? findLevel(course, nextLevel.levelId) : null;

          return {
            courseId: activeEnrollment.courseId,
            levelId: nextLevel?.levelId || null,
            course: course?.title || "Your Course",
            levelTitle: level?.title || (nextLevel ? `Level ${nextLevel.levelOrder}` : "Course Overview"),
            thumbnail: courseImage(course),
            progress: activeEnrollment.progress || 0,
            href: nextLevel
              ? `/courses/${activeEnrollment.courseId}/${nextLevel.levelId}`
              : `/courses/${activeEnrollment.courseId}`,
            actionLabel: activeEnrollment.progress > 0 ? "Resume Course" : "Start Course",
          };
        })()
      : null;

    const activityEvents: ActivityEvent[] = [];

    completedAttempts.forEach((attempt) => {
      const course = coursesById.get(attempt.courseId);
      const quiz = findQuiz(course, attempt.quizId);
      const occurredAt = attempt.completedAt || attempt.updatedAt || attempt.startedAt;

      activityEvents.push({
        type: "quiz",
        title: `Quiz: ${quiz?.title || "Assessment"}`,
        occurredAt,
        score: Math.round(attempt.score || 0),
        status: attempt.passed ? "Passed" : "Failed",
      });
    });

    enrollments.forEach((enrollment) => {
      const course = coursesById.get(enrollment.courseId);

      activityEvents.push({
        type: "enroll",
        title: `Enrolled in "${course?.title || enrollment.courseId}"`,
        occurredAt: enrollment.enrolledAt,
      });

      enrollment.levelProgress
        .filter((levelProgress: any) => levelProgress.isCompleted && levelProgress.completedAt)
        .forEach((levelProgress: any) => {
          const level = findLevel(course, levelProgress.levelId);

          activityEvents.push({
            type: "level",
            title: `Completed ${level?.title || `Level ${levelProgress.levelOrder}`} in "${course?.title || enrollment.courseId}"`,
            occurredAt: levelProgress.completedAt as Date,
          });
        });
    });

    const activities = activityEvents
      .sort((a, b) => b.occurredAt.getTime() - a.occurredAt.getTime())
      .slice(0, 7)
      .map((activity) => ({
        type: activity.type,
        title: activity.title,
        timestamp: formatActivityTimestamp(activity.occurredAt),
        occurredAt: activity.occurredAt.toISOString(),
        ...(activity.type === "quiz"
          ? { score: activity.score || 0, status: activity.status || "Failed" }
          : {}),
      }));

    const enrolledCourseIds = new Set(enrollments.map((enrollment) => enrollment.courseId));
    const recommendations = catalogCourses
      .filter((course) => !enrolledCourseIds.has(course.id))
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 5)
      .map((course) => ({
        id: course.id,
        title: course.title,
        instructor: course.instructor || "",
        category: course.category || "",
        thumbnail: course.imageUrl || "",
      }));

    const featuredCourses = catalogCourses
      .filter((course) => (course.rating || 0) >= 4)
      .sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 6)
      .map((course) => ({
        id: course.id,
        title: course.title,
        imageUrl: course.imageUrl || "",
        rating: course.rating ?? null,
        duration: course.duration ?? null,
        totalStudents: course.totalStudents ?? null,
        difficulty: course.difficulty ?? null,
      }));

    const badges = [
      ...(completedAttempts.length >= 1 ? [{ id: "ace", label: "Quiz Ace", icon: "sparkles" }] : []),
      ...(enrollments.length >= 1 ? [{ id: "sprinter", label: "Speed Learner", icon: "zap" }] : []),
      ...(passedAttempts.length >= 5 ? [{ id: "streak", label: "Top Scorer", icon: "flame" }] : []),
    ];

    const certificates = [
      ...enrollments
        .filter((enrollment) => enrollment.status === "completed" || enrollment.progress >= 100)
        .map((enrollment) => {
          const course = coursesById.get(enrollment.courseId);
          return {
            id: enrollment.courseId,
            title: course?.title || enrollment.courseId,
            date: formatActivityTimestamp(enrollment.enrolledAt),
          };
        }),
      ...(passedAttempts.length > 0
        ? [{ id: "first-quiz", title: "First Quiz Passed", date: formatActivityTimestamp(passedAttempts[0].completedAt || passedAttempts[0].startedAt) }]
        : []),
    ].slice(0, 6);

    res.json({
      stats: {
        courses: enrollments.length,
        progress: averageProgress,
        quizAttempts: completedAttempts.length,
      },
      progressStats: {
        attempts: completedAttempts.length,
        avgScore: averageScore,
        passed: passedAttempts.length,
        failed: failedAttempts.length,
      },
      nextLesson,
      activities,
      enrolledCourseIds: Array.from(enrolledCourseIds),
      recommendations,
      featuredCourses,
      badges,
      certificates,
    });
  } catch (error) {
    console.error("[getUserDashboard] Error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard" });
  }
};
