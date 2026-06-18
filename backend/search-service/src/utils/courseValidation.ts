// ============================================================================
// COURSE CONTENT VALIDATION - CATALOG SERVICE
// Validates the nested course payload (levels -> quizzes -> questions -> options)
// used by create/update. The most important invariant is quiz gradeability:
// every question must have exactly one correct option, otherwise the learning
// service can never award those points and the level becomes impossible to pass.
// ============================================================================

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0;

export function validateCoursePayload(body: any, { requireCourseFields }: { requireCourseFields: boolean }): ValidationResult {
  const { courseData, levels } = body || {};

  if (requireCourseFields) {
    if (!isNonEmptyString(courseData?.title)) return { valid: false, error: "Course title is required" };
    if (!isNonEmptyString(courseData?.description)) return { valid: false, error: "Course description is required" };
    if (!isNonEmptyString(courseData?.instructor)) return { valid: false, error: "Course instructor is required" };
  }

  if (courseData?.price !== undefined && (typeof courseData.price !== "number" || courseData.price < 0)) {
    return { valid: false, error: "Course price must be a non-negative number" };
  }
  if (courseData?.duration !== undefined && (typeof courseData.duration !== "number" || courseData.duration < 0)) {
    return { valid: false, error: "Course duration must be a non-negative number" };
  }

  if (levels !== undefined) {
    if (!Array.isArray(levels)) return { valid: false, error: "levels must be an array" };

    for (let li = 0; li < levels.length; li++) {
      const level = levels[li];
      const levelLabel = `Level ${li + 1}`;

      if (!isNonEmptyString(level?.title)) {
        return { valid: false, error: `${levelLabel}: title is required` };
      }

      const quizzes = level?.quizzes;
      if (quizzes === undefined) continue;
      if (!Array.isArray(quizzes)) return { valid: false, error: `${levelLabel}: quizzes must be an array` };

      for (let qi = 0; qi < quizzes.length; qi++) {
        const quiz = quizzes[qi];
        const quizLabel = `${levelLabel} quiz ${qi + 1}`;

        if (!isNonEmptyString(quiz?.title)) {
          return { valid: false, error: `${quizLabel}: title is required` };
        }

        const questions = quiz?.questions;
        if (questions === undefined) continue;
        if (!Array.isArray(questions)) return { valid: false, error: `${quizLabel}: questions must be an array` };

        for (let qqi = 0; qqi < questions.length; qqi++) {
          const question = questions[qqi];
          const questionLabel = `${quizLabel}, question ${qqi + 1}`;

          if (!isNonEmptyString(question?.questionText)) {
            return { valid: false, error: `${questionLabel}: question text is required` };
          }

          const options = question?.options;
          if (!Array.isArray(options) || options.length < 2) {
            return { valid: false, error: `${questionLabel}: at least 2 options are required` };
          }

          const emptyOption = options.find((o: any) => !isNonEmptyString(o?.optionText));
          if (emptyOption) {
            return { valid: false, error: `${questionLabel}: every option needs text` };
          }

          const correctCount = options.filter((o: any) => o?.isCorrect === true).length;
          if (correctCount !== 1) {
            return {
              valid: false,
              error: `${questionLabel}: exactly one option must be marked correct (found ${correctCount})`,
            };
          }
        }
      }
    }
  }

  return { valid: true };
}
