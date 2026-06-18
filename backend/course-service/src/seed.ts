import "dotenv/config";
import axios from "axios";
import mongoose from "mongoose";
import { connectDB } from "./utils/db";
import { Enrollment } from "./models/Enrollment";
import { QuizAttempt } from "./models/QuizAttempt";

type CatalogOption = { id: string; optionText: string; isCorrect?: boolean };
type CatalogQuestion = { id: string; points: number; options: CatalogOption[] };
type CatalogQuiz = {
  id: string;
  levelId: string;
  courseId: string;
  passingScore: number;
  questions: CatalogQuestion[];
};
type CatalogLevel = {
  id: string;
  order: number;
  title: string;
  quizzes: Array<{ id: string; levelId: string; courseId: string }>;
};
type CatalogCourse = {
  id: string;
  title: string;
  levels: CatalogLevel[];
};

const CATALOG_URL = process.env.CATALOG_SERVICE_URL || "http://localhost:7000";
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

async function getAllCatalogCourses(): Promise<CatalogCourse[]> {
  const { data } = await axios.get(`${CATALOG_URL}/courses`, {
    params: { page: 1, limit: 100 }
  });
  return (data?.courses || []) as CatalogCourse[];
}

async function getCatalogCourse(courseId: string): Promise<CatalogCourse | null> {
  try {
    const { data } = await axios.get(`${CATALOG_URL}/courses/${courseId}`);
    return data as CatalogCourse;
  } catch {
    return null;
  }
}

async function getQuizForGrading(quizId: string): Promise<CatalogQuiz | null> {
  try {
    const { data } = await axios.get(`${CATALOG_URL}/quizzes/${quizId}/grade`, {
      headers: INTERNAL_API_SECRET ? { "x-internal-secret": INTERNAL_API_SECRET } : undefined,
    });
    return data as CatalogQuiz;
  } catch {
    return null;
  }
}

function toProgressPercent(completed: number, total: number): number {
  if (!total) return 0;
  return Math.round((completed / total) * 100);
}

function daysAgo(days: number): Date {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date;
}

async function createEnrollmentWithProgress(params: {
  userId: string;
  course: CatalogCourse;
  completedLevels: number;
  unlockedLevels?: number;
  enrolledAtDaysAgo?: number;
}) {
  const { userId, course, completedLevels, unlockedLevels, enrolledAtDaysAgo = 10 } = params;
  const levels = [...(course.levels || [])].sort((a, b) => a.order - b.order);
  const total = levels.length;
  const completed = Math.min(completedLevels, total);
  const unlocked = Math.min(unlockedLevels ?? completed + 1, total);

  const levelProgress = levels.map((level, index) => {
    const isCompleted = index < completed;
    const isUnlocked = index < unlocked || index === 0;
    return {
      levelId: level.id,
      levelOrder: level.order,
      isUnlocked,
      isCompleted,
      completedAt: isCompleted ? daysAgo(Math.max(1, enrolledAtDaysAgo - index)) : null
    };
  });

  await Enrollment.create({
    userId,
    courseId: course.id,
    enrolledAt: daysAgo(enrolledAtDaysAgo),
    status: completed === total && total > 0 ? "completed" : "active",
    progress: toProgressPercent(completed, total),
    levelProgress
  });
}

async function createCompletedAttempt(params: {
  userId: string;
  courseId: string;
  levelId: string;
  quizId: string;
  pass: boolean;
  startedDaysAgo: number;
}) {
  const { userId, courseId, levelId, quizId, pass, startedDaysAgo } = params;
  const quiz = await getQuizForGrading(quizId);
  if (!quiz) return;

  const maxPoints = (quiz.questions || []).reduce((sum, question) => sum + (question.points || 1), 0);

  const gradedAnswers = (quiz.questions || []).map((question) => {
    const correct = question.options.find((option) => option.isCorrect);
    const incorrect = question.options.find((option) => !option.isCorrect);
    const selected = pass ? correct : (incorrect || correct);
    const isCorrect = !!selected && !!correct && selected.id === correct.id;
    return {
      questionId: question.id,
      optionId: selected?.id || question.options[0]?.id,
      isCorrect,
      pointsEarned: isCorrect ? (question.points || 1) : 0,
    };
  });

  const totalPoints = gradedAnswers.reduce((sum, answer) => sum + answer.pointsEarned, 0);
  const score = maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 10000) / 100 : 0;
  const startedAt = daysAgo(startedDaysAgo);
  const completedAt = new Date(startedAt.getTime() + 1000 * 60 * 8);

  await QuizAttempt.create({
    userId,
    quizId,
    courseId,
    levelId,
    startedAt,
    completedAt,
    timeTaken: 8 * 60,
    score,
    totalPoints,
    maxPoints,
    passed: pass,
    status: "completed",
    answers: gradedAnswers.map((answer) => ({
      questionId: answer.questionId,
      optionId: answer.optionId || "",
      isCorrect: answer.isCorrect,
      pointsEarned: answer.pointsEarned,
      answeredAt: completedAt,
    })),
  });
}

async function main() {
  console.log("🌱 Seeding learning-service (enrollment/progress/attempts)...");

  await connectDB();

  const catalogCourses = await getAllCatalogCourses();
  if (!catalogCourses.length) {
    throw new Error(
      "No catalog courses found. Seed and run search-service first (npm run seed, npm run dev in backend/search-service)."
    );
  }

  // Clear learning state
  await QuizAttempt.deleteMany({});
  await Enrollment.deleteMany({});

  // Fetch full course details with quizzes
  const detailedCourses: CatalogCourse[] = [];
  for (const course of catalogCourses) {
    const full = await getCatalogCourse(course.id);
    if (full) detailedCourses.push(full);
  }

  const courseById = new Map(detailedCourses.map((course) => [course.id, course]));

  // Mock users from auth-service IDs (string form)
  const USER_1 = "1";
  const USER_2 = "2";
  const USER_3 = "3";

  // Enrollment + progress states
  if (courseById.has("react-foundations")) {
    await createEnrollmentWithProgress({
      userId: USER_1,
      course: courseById.get("react-foundations")!,
      completedLevels: 2,
      unlockedLevels: 3,
      enrolledAtDaysAgo: 14,
    });
  }

  if (courseById.has("nextjs-app-router")) {
    await createEnrollmentWithProgress({
      userId: USER_1,
      course: courseById.get("nextjs-app-router")!,
      completedLevels: 1,
      unlockedLevels: 2,
      enrolledAtDaysAgo: 9,
    });
  }

  if (courseById.has("typescript-essentials")) {
    await createEnrollmentWithProgress({
      userId: USER_2,
      course: courseById.get("typescript-essentials")!,
      completedLevels: 2,
      unlockedLevels: 3,
      enrolledAtDaysAgo: 12,
    });
  }

  if (courseById.has("python-fundamentals")) {
    await createEnrollmentWithProgress({
      userId: USER_2,
      course: courseById.get("python-fundamentals")!,
      completedLevels: 0,
      unlockedLevels: 1,
      enrolledAtDaysAgo: 4,
    });
  }

  if (courseById.has("nodejs-backend")) {
    await createEnrollmentWithProgress({
      userId: USER_3,
      course: courseById.get("nodejs-backend")!,
      completedLevels: 1,
      unlockedLevels: 2,
      enrolledAtDaysAgo: 7,
    });
  }

  // Seed quiz attempts + answers across users/courses
  for (const [courseId, course] of courseById) {
    const sortedLevels = [...(course.levels || [])].sort((a, b) => a.order - b.order);
    const firstLevel = sortedLevels[0];
    const secondLevel = sortedLevels[1];

    if (courseId === "react-foundations") {
      if (firstLevel?.quizzes?.[0]) {
        await createCompletedAttempt({
          userId: USER_1,
          courseId,
          levelId: firstLevel.id,
          quizId: firstLevel.quizzes[0].id,
          pass: true,
          startedDaysAgo: 13,
        });
      }
      if (secondLevel?.quizzes?.[0]) {
        await createCompletedAttempt({
          userId: USER_1,
          courseId,
          levelId: secondLevel.id,
          quizId: secondLevel.quizzes[0].id,
          pass: false,
          startedDaysAgo: 8,
        });
        await createCompletedAttempt({
          userId: USER_1,
          courseId,
          levelId: secondLevel.id,
          quizId: secondLevel.quizzes[0].id,
          pass: true,
          startedDaysAgo: 6,
        });
      }
    }

    if (courseId === "typescript-essentials") {
      if (firstLevel?.quizzes?.[0]) {
        await createCompletedAttempt({
          userId: USER_2,
          courseId,
          levelId: firstLevel.id,
          quizId: firstLevel.quizzes[0].id,
          pass: true,
          startedDaysAgo: 11,
        });
      }
      if (secondLevel?.quizzes?.[0]) {
        await createCompletedAttempt({
          userId: USER_2,
          courseId,
          levelId: secondLevel.id,
          quizId: secondLevel.quizzes[0].id,
          pass: true,
          startedDaysAgo: 10,
        });
      }
    }

    if (courseId === "nodejs-backend" && firstLevel?.quizzes?.[0]) {
      await createCompletedAttempt({
        userId: USER_3,
        courseId,
        levelId: firstLevel.id,
        quizId: firstLevel.quizzes[0].id,
        pass: true,
        startedDaysAgo: 5,
      });
    }
  }

  const enrollmentCount = await Enrollment.countDocuments();
  const attemptCount = await QuizAttempt.countDocuments();

  console.log("\n✅ Learning-service seeded successfully");
  console.log(`👥 Enrollments: ${enrollmentCount}`);
  console.log(`🧪 Quiz Attempts: ${attemptCount}`);
}

main()
  .catch((error) => {
    console.error("❌ Learning-service seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
