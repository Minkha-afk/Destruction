import { Request, Response } from "express";
import Course from "../models/Course";

// ============================================================================
// QUIZ CONTROLLER - CATALOG SERVICE (READ-ONLY)
// Quizzes are embedded inside the Course content tree:
//   Course -> levels[] -> quizzes[] -> questions[] -> options[]
// This service only serves quiz content. All attempts/scoring is in
// learning-service.
// ============================================================================

/**
 * Find the quiz with the given id within the course tree. Returns the PLAIN
 * (toJSON'd) quiz object, or null if no course contains it.
 */
async function findQuizById(id: string): Promise<any | null> {
  const course = await Course.findOne({ "levels.quizzes._id": id });
  if (!course) return null;

  const plain = course.toJSON();
  for (const level of plain.levels || []) {
    for (const quiz of level.quizzes || []) {
      if (quiz.id === id) return quiz;
    }
  }
  return null;
}

/**
 * Get quiz by ID with questions and options.
 * Options are sanitized - isCorrect flag is HIDDEN for security.
 */
export const getQuiz = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const quiz = await findQuizById(id);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Remove correct answer indicators for security (user-facing).
    for (const question of quiz.questions || []) {
      for (const option of question.options || []) {
        delete option.isCorrect;
      }
    }

    res.json(quiz);
  } catch (error) {
    console.error("[getQuiz] Error:", error);
    res.status(500).json({
      error: "Failed to fetch quiz",
      details: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined,
    });
  }
};

/**
 * Get quiz WITH correct answers for grading.
 * INTERNAL USE ONLY - called by learning-service for grading submissions.
 * Guarded by the shared internal secret (see route).
 */
export const getQuizForGrading = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const quiz = await findQuizById(id);
    if (!quiz) {
      return res.status(404).json({ error: "Quiz not found" });
    }

    // Return full quiz with isCorrect flags for grading.
    res.json(quiz);
  } catch (error) {
    console.error("[getQuizForGrading] Error:", error);
    res.status(500).json({
      error: "Failed to fetch quiz for grading",
      details: process.env.NODE_ENV === "development" && error instanceof Error ? error.message : undefined,
    });
  }
};
