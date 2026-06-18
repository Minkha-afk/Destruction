import { Request, Response } from "express";
import { Enrollment } from "../models/Enrollment";
import { QuizAttempt } from "../models/QuizAttempt";
import { catalogService } from "../utils/catalogService";

// ============================================================================
// QUIZ CONTROLLER - LEARNING SERVICE
// Owns: Quiz attempts, answer submissions, scoring, level progression
// ============================================================================

/**
 * Start a quiz attempt.
 * Creates a new QuizAttempt record and returns quiz structure (without correct answers).
 */
export const startQuiz = async (req: Request, res: Response) => {
  try {
    const { quizId, userId, courseId, levelId } = req.body;

    if (!quizId || !userId) {
      return res.status(400).json({ error: "quizId and userId are required" });
    }

    // Verify user is enrolled in the course
    if (courseId) {
      const enrollment = await Enrollment.findOne({ userId, courseId });
      if (!enrollment) {
        return res.status(403).json({ error: "User is not enrolled in this course" });
      }

      // Verify level is unlocked
      if (levelId) {
        const levelProgress = enrollment.levelProgress.find((lp: any) => lp.levelId === levelId);
        if (!levelProgress?.isUnlocked) {
          return res.status(403).json({ error: "Level is not unlocked yet" });
        }
      }
    }

    // Check for existing in-progress attempt
    const existingAttempt = await QuizAttempt.findOne({
      userId,
      quizId,
      status: "in_progress"
    });

    if (existingAttempt) {
      // Return existing attempt
      const quiz = await catalogService.getQuiz(quizId);
      return res.status(200).json({
        message: "Resuming existing attempt",
        attempt: existingAttempt,
        quiz
      });
    }

    // Get quiz from catalog to calculate maxPoints
    const quiz = await catalogService.getQuiz(quizId);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found in catalog" });
    }

    // Calculate max points
    const maxPoints = quiz.questions?.reduce((sum: number, q: any) => sum + (q.points || 1), 0) || 0;

    // Create new attempt
    const attempt = await QuizAttempt.create({
      userId,
      quizId,
      courseId: courseId || quiz.courseId,
      levelId: levelId || quiz.levelId,
      maxPoints,
      totalPoints: 0,
      status: "in_progress"
    });

    res.status(201).json({
      message: "Quiz started",
      attempt,
      quiz: {
        id: quiz.id,
        title: quiz.title,
        description: quiz.description,
        timeLimit: quiz.timeLimit,
        totalQuestions: quiz.totalQuestions,
        questions: quiz.questions // Options without isCorrect flag
      }
    });

  } catch (error) {
    console.error("[startQuiz] Error:", error);
    res.status(500).json({ error: "Failed to start quiz" });
  }
};

/**
 * Submit quiz answers and calculate score.
 * Fetches correct answers from catalog, grades, and triggers level progression.
 */
export const submitQuiz = async (req: Request, res: Response) => {
  try {
    const { attemptId, answers } = req.body;

    if (!attemptId || !Array.isArray(answers)) {
      return res.status(400).json({ error: "attemptId and answers[] are required" });
    }

    // Get the attempt
    const attempt = await QuizAttempt.findById(attemptId);

    if (!attempt) {
      return res.status(404).json({ error: "Quiz attempt not found" });
    }

    if (attempt.status === "completed") {
      return res.status(400).json({ error: "Quiz already completed" });
    }

    // Get quiz with correct answers from catalog (internal grading endpoint)
    const quizForGrading = await catalogService.getQuizForGrading(attempt.quizId);
    if (!quizForGrading) {
      return res.status(500).json({ error: "Failed to fetch quiz for grading" });
    }

    // Build a lookup map for correct answers
    const correctAnswerMap = new Map<string, { correctOptionId: string; points: number }>();
    quizForGrading.questions?.forEach((q: any) => {
      const correctOption = q.options?.find((o: any) => o.isCorrect);
      if (correctOption) {
        correctAnswerMap.set(q.id, {
          correctOptionId: correctOption.id,
          points: q.points || 1
        });
      }
    });

    // Grade each answer
    let totalPoints = 0;
    let correctCount = 0;
    const gradedAnswers: any[] = [];
    const seenQuestions = new Set<string>(); // ignore duplicate answers per question

    for (const answer of answers) {
      const { questionId, optionId } = answer;
      const correctAnswer = correctAnswerMap.get(questionId);

      if (!correctAnswer) continue;
      if (seenQuestions.has(questionId)) continue; // only the first answer counts
      seenQuestions.add(questionId);

      const isCorrect = optionId === correctAnswer.correctOptionId;
      const pointsEarned = isCorrect ? correctAnswer.points : 0;

      if (isCorrect) {
        totalPoints += pointsEarned;
        correctCount++;
      }

      gradedAnswers.push({
        questionId,
        optionId,
        isCorrect,
        pointsEarned
      });
    }

    // Calculate score percentage
    const score = attempt.maxPoints > 0 ? (totalPoints / attempt.maxPoints) * 100 : 0;
    const passingScore = quizForGrading.passingScore || 70;
    const passed = score >= passingScore;

    // Persist graded answers + attempt state (no transaction)
    attempt.answers = gradedAnswers;
    attempt.status = "completed";
    attempt.completedAt = new Date();
    attempt.score = Math.round(score * 100) / 100;
    attempt.totalPoints = totalPoints;
    attempt.passed = passed;
    attempt.timeTaken = Math.floor((Date.now() - attempt.startedAt.getTime()) / 1000);

    await attempt.save();

    // If passed, unlock next level
    if (passed) {
      await unlockNextLevel(attempt.userId, attempt.courseId, attempt.levelId);
    }

    res.json({
      message: passed ? "Quiz passed! Next level unlocked." : "Quiz completed. Try again to unlock next level.",
      attempt,
      results: {
        score: Math.round(score * 100) / 100,
        totalPoints,
        maxPoints: attempt.maxPoints,
        correctAnswers: correctCount,
        totalQuestions: correctAnswerMap.size,
        passed,
        requiredScore: passingScore
      }
    });

  } catch (error) {
    console.error("[submitQuiz] Error:", error);
    res.status(500).json({ error: "Failed to submit quiz" });
  }
};

/**
 * Internal helper to unlock the next level after passing a quiz.
 */
async function unlockNextLevel(userId: string, courseId: string, currentLevelId: string) {
  const enrollment = await Enrollment.findOne({ userId, courseId });
  if (!enrollment) return;

  // Get current level progress
  const currentLevelProgress = enrollment.levelProgress.find(
    (lp: any) => lp.levelId === currentLevelId
  );

  if (!currentLevelProgress) return;

  // Mark current level as completed
  currentLevelProgress.isCompleted = true;
  currentLevelProgress.completedAt = new Date();

  // Find and unlock next level
  const nextLevelProgress = enrollment.levelProgress.find(
    (lp: any) => lp.levelOrder === currentLevelProgress.levelOrder + 1
  );

  if (nextLevelProgress && !nextLevelProgress.isUnlocked) {
    nextLevelProgress.isUnlocked = true;
  }

  // Update overall enrollment progress
  const allLevelProgress = enrollment.levelProgress;
  const completedCount = allLevelProgress.filter((lp: any) => lp.isCompleted).length;
  const totalCount = allLevelProgress.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  enrollment.progress = progressPercent;
  enrollment.status = progressPercent === 100 ? "completed" : "active";

  await enrollment.save();
}

/**
 * Get quiz results for an attempt.
 */
export const getQuizResults = async (req: Request, res: Response) => {
  try {
    const { attemptId } = req.params;

    const attempt = await QuizAttempt.findById(attemptId);

    if (!attempt) {
      return res.status(404).json({ error: "Quiz attempt not found" });
    }

    // Get quiz info from catalog
    const quiz = await catalogService.getQuiz(attempt.quizId);

    res.json({
      attempt,
      quiz: quiz ? { id: quiz.id, title: quiz.title } : null
    });

  } catch (error) {
    console.error("[getQuizResults] Error:", error);
    res.status(500).json({ error: "Failed to fetch quiz results" });
  }
};

/**
 * Get user's quiz history.
 */
export const getUserQuizHistory = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { courseId } = req.query;

    const filter: any = { userId };
    if (courseId) filter.courseId = courseId;

    const attempts = await QuizAttempt.find(filter).sort({ startedAt: -1 });

    // Hydrate with quiz titles
    const hydratedAttempts = await Promise.all(
      attempts.map(async (attempt) => {
        const quiz = await catalogService.getQuiz(attempt.quizId);
        return {
          ...attempt.toJSON(),
          quizTitle: quiz?.title || "Unknown Quiz"
        };
      })
    );

    res.json(hydratedAttempts);

  } catch (error) {
    console.error("[getUserQuizHistory] Error:", error);
    res.status(500).json({ error: "Failed to fetch quiz history" });
  }
};

/**
 * Get quiz statistics (pass rate, avg score, etc.)
 */
export const getQuizStats = async (req: Request, res: Response) => {
  try {
    const { quizId } = req.params;

    const attempts = await QuizAttempt.find({ quizId, status: "completed" });

    const totalAttempts = attempts.length;
    const passedAttempts = attempts.filter((a: any) => a.passed).length;
    const avgScore = totalAttempts > 0
      ? attempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0) / totalAttempts
      : 0;

    res.json({
      quizId,
      totalAttempts,
      passedAttempts,
      passRate: totalAttempts > 0 ? Math.round((passedAttempts / totalAttempts) * 100) : 0,
      averageScore: Math.round(avgScore * 100) / 100
    });

  } catch (error) {
    console.error("[getQuizStats] Error:", error);
    res.status(500).json({ error: "Failed to fetch quiz statistics" });
  }
};

/**
 * Get a specific quiz (read-only, proxied from catalog).
 * Kept for backward compatibility but reads from catalog.
 */
export const getQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const quiz = await catalogService.getQuiz(id);

    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    res.json(quiz);

  } catch (error) {
    console.error("[getQuiz] Error:", error);
    res.status(500).json({ error: "Failed to fetch quiz" });
  }
};
