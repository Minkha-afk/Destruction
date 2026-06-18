import { Request, Response } from "express";
import { randomUUID } from "crypto";
import Course from "../models/Course";
import { withLocalCourseImage } from "../utils/courseImages";
import { validateCoursePayload } from "../utils/courseValidation";

// ============================================================================
// COURSE CONTROLLER - CATALOG SERVICE (content owner)
// Serves the public catalog (read-only) and owns course authoring (admin CRUD).
// All user state (enrollment, progress, attempts) lives in learning-service.
//
// The whole content tree (levels -> quizzes -> questions -> options) is embedded
// in a single Course document. Mongoose docs are NOT plain objects: we call
// `.toJSON()` (which maps _id -> id and drops __v) before spreading/reshaping.
// ============================================================================

/**
 * Walk a PLAIN course object (already toJSON'd) and remove every
 * `option.isCorrect` so the public/learner view never leaks answers.
 */
function stripAnswers(course: any): any {
  if (!course || !Array.isArray(course.levels)) return course;
  for (const level of course.levels) {
    if (!Array.isArray(level.quizzes)) continue;
    for (const quiz of level.quizzes) {
      if (!Array.isArray(quiz.questions)) continue;
      for (const question of quiz.questions) {
        if (!Array.isArray(question.options)) continue;
        for (const option of question.options) {
          delete option.isCorrect;
        }
      }
    }
  }
  return course;
}

/**
 * Whether the authenticated user may manage this course. Owners only; legacy
 * courses with no instructorId are treated as manageable (back-compat).
 */
function canManage(course: any, req: Request): boolean {
  const authUser = (req as any).user as { id?: string } | undefined;
  if (!course?.instructorId) return true;
  return !!authUser?.id && course.instructorId === authUser.id;
}

const SORTABLE = new Set(["rating", "createdAt", "price", "totalStudents", "duration", "title"]);

/**
 * Get all courses with filtering, search, and pagination.
 * PUBLIC endpoint — answers (option.isCorrect) are stripped from the tree.
 */
export const getAllCourses = async (req: Request, res: Response) => {
  try {
    const {
      search,
      category,
      difficulty,
      minPrice,
      maxPrice,
      sortBy = "rating",
      order = "desc",
      page = 1,
      limit = 12,
    } = req.query;

    // Clamp pagination to sane bounds so a caller can't request a huge page.
    const pageNum = Math.max(1, Number(page) || 1);
    const limitNum = Math.min(100, Math.max(1, Number(limit) || 12));
    const skip = (pageNum - 1) * limitNum;

    // Whitelist sortable columns to avoid arbitrary-field sorting.
    const sortColumn = SORTABLE.has(String(sortBy)) ? String(sortBy) : "rating";
    const sortDir = String(order) === "asc" ? 1 : -1;

    const filter: any = {};

    if (search) {
      const rx = new RegExp(String(search), "i");
      filter.$or = [{ title: rx }, { description: rx }, { instructor: rx }];
    }

    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (minPrice !== undefined) filter.price = { $gte: Number(minPrice) };
    if (maxPrice !== undefined) filter.price = { ...filter.price, $lte: Number(maxPrice) };

    const [courses, total] = await Promise.all([
      Course.find(filter)
        .sort({ [sortColumn]: sortDir })
        .skip(skip)
        .limit(limitNum),
      Course.countDocuments(filter),
    ]);

    res.json({
      courses: courses.map((c: any) => withLocalCourseImage(stripAnswers(c.toJSON()))),
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    console.error("[getAllCourses] Error:", error);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
};

/**
 * Get course by ID with full details (levels, quizzes, tags).
 * Options are returned WITHOUT the isCorrect flag (public/learner view).
 */
export const getCourseById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }

    res.json(withLocalCourseImage(stripAnswers(course.toJSON())));
  } catch (error) {
    console.error("[getCourseById] Error:", error);
    res.status(500).json({ error: "Failed to fetch course" });
  }
};

/**
 * Get course by ID for ADMIN editing — includes the isCorrect flag so the
 * authoring UI can pre-select the right answers. Protected by `authenticate`.
 */
export const getCourseForManage = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    if (!canManage(course, req)) {
      return res.status(403).json({ error: "You can only edit your own courses" });
    }

    res.json(withLocalCourseImage(course.toJSON()));
  } catch (error) {
    console.error("[getCourseForManage] Error:", error);
    res.status(500).json({ error: "Failed to fetch course for editing" });
  }
};

/**
 * Get the courses OWNED by the authenticated teacher (instructorId == token user).
 * Powers the teacher studio "My Courses" view. Protected by `authenticate`.
 */
export const getMyCourses = async (req: Request, res: Response) => {
  try {
    const authUser = (req as any).user as { id?: string } | undefined;
    if (!authUser?.id) return res.status(401).json({ error: "Authentication required" });

    const courses = await Course.find({ instructorId: authUser.id }).sort({ createdAt: -1 });
    res.json(courses.map((c: any) => withLocalCourseImage(stripAnswers(c.toJSON()))));
  } catch (error) {
    console.error("[getMyCourses] Error:", error);
    res.status(500).json({ error: "Failed to fetch your courses" });
  }
};

/**
 * Search courses by title.
 */
export const searchCourses = async (req: Request, res: Response) => {
  try {
    const { title } = req.query;
    if (!title) {
      return res.status(400).json({ error: "Title query is required" });
    }

    const courses = await Course.find({ title: new RegExp(String(title), "i") });

    res.json(courses.map((c: any) => withLocalCourseImage(stripAnswers(c.toJSON()))));
  } catch (error) {
    console.error("[searchCourses] Error:", error);
    res.status(500).json({ error: "Error searching courses" });
  }
};

/**
 * Get all unique categories.
 */
export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await Course.distinct("category");
    res.json(categories);
  } catch (error) {
    console.error("[getCategories] Error:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
};

/**
 * Get all unique difficulties.
 */
export const getDifficulties = async (_req: Request, res: Response) => {
  try {
    const difficulties = await Course.distinct("difficulty");
    res.json(difficulties);
  } catch (error) {
    console.error("[getDifficulties] Error:", error);
    res.status(500).json({ error: "Failed to fetch difficulties" });
  }
};

/**
 * Get all tags (distinct across all courses' embedded tag arrays).
 */
export const getTags = async (_req: Request, res: Response) => {
  try {
    const courses = await Course.find({}, { tags: 1 });

    const byName = new Map<string, { id: string; name: string; color: string }>();
    for (const course of courses) {
      const plain = course.toJSON();
      for (const tag of plain.tags || []) {
        if (!tag?.name) continue;
        if (!byName.has(tag.name)) {
          byName.set(tag.name, {
            id: tag.name,
            name: tag.name,
            color: tag.color || "#3B82F6",
          });
        }
      }
    }

    const tags = Array.from(byName.values()).sort((a, b) => a.name.localeCompare(b.name));
    res.json(tags);
  } catch (error) {
    console.error("[getTags] Error:", error);
    res.status(500).json({ error: "Failed to fetch tags" });
  }
};

/**
 * Get featured courses (top rated).
 */
export const getFeaturedCourses = async (_req: Request, res: Response) => {
  try {
    const courses = await Course.find({ rating: { $gte: 4.0 } })
      .sort({ rating: -1 })
      .limit(6);

    res.json(courses.map((c: any) => withLocalCourseImage(stripAnswers(c.toJSON()))));
  } catch (error) {
    console.error("[getFeaturedCourses] Error:", error);
    res.status(500).json({ error: "Failed to fetch featured courses" });
  }
};

// ============================================================================
// ADMIN: Course Authoring (Create, Update, Delete)
// ============================================================================

/**
 * Normalize incoming tags (array of names or {name,color} objects) into the
 * embedded tag shape. Tag ids are stable on the tag name.
 */
function buildTags(tags: any[]): Array<{ _id: string; name: string; color: string }> {
  const byName = new Map<string, { _id: string; name: string; color: string }>();
  for (const raw of tags) {
    const name = typeof raw === "string" ? raw.trim() : String(raw?.name || "").trim();
    if (!name) continue;
    if (!byName.has(name)) {
      const color = typeof raw === "object" && raw?.color ? String(raw.color) : "#3B82F6";
      byName.set(name, { _id: name, name, color });
    }
  }
  return Array.from(byName.values());
}

/**
 * Build the embedded quiz subtree, generating ids explicitly so courseId/levelId
 * can be wired before insert and preserved across edits.
 */
function buildQuiz(courseId: string, levelId: string, quizData: any) {
  const questionsIn = Array.isArray(quizData.questions) ? quizData.questions : [];

  const questions = questionsIn.map((q: any) => ({
    _id: typeof q.id === "string" && q.id ? q.id : randomUUID(),
    questionText: q.questionText,
    questionType: q.questionType || "multiple_choice",
    points: Number(q.points) || 1,
    options: (Array.isArray(q.options) ? q.options : []).map((o: any) => ({
      _id: typeof o.id === "string" && o.id ? o.id : randomUUID(),
      optionText: o.optionText,
      isCorrect: o.isCorrect === true,
    })),
  }));

  return {
    _id: typeof quizData.id === "string" && quizData.id ? quizData.id : randomUUID(),
    title: quizData.title,
    description: quizData.description || "",
    levelId,
    courseId,
    timeLimit: Number(quizData.timeLimit) || 30,
    passingScore: Number(quizData.passingScore) || 70,
    totalQuestions: questions.length,
    isActive: quizData.isActive !== false,
    questions,
  };
}

/**
 * Build a complete embedded level subtree (with quizzes/questions/options).
 */
function buildLevel(courseId: string, levelData: any, index: number) {
  const levelId =
    typeof levelData.id === "string" && levelData.id ? levelData.id : randomUUID();

  const quizzes = (Array.isArray(levelData.quizzes) ? levelData.quizzes : []).map((q: any) =>
    buildQuiz(courseId, levelId, q)
  );

  return {
    _id: levelId,
    title: levelData.title,
    description: levelData.description || "",
    videoUrl: levelData.videoUrl ?? null,
    content: levelData.content || "",
    order: Number(levelData.order) || index + 1,
    duration: Number(levelData.duration) || 0,
    isUnlocked: index === 0, // first level open by default
    requiredScore: Number(levelData.requiredScore) || 70,
    quizzes,
  };
}

/**
 * Create a complete course with levels, quizzes, questions, and options.
 */
export const createCompleteCourse = async (req: Request, res: Response) => {
  try {
    const validation = validateCoursePayload(req.body, { requireCourseFields: true });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const { courseData, levels, tags } = req.body;

    // Owning teacher — taken from the authenticated token, never the client body.
    const authUser = (req as any).user as { id?: string; username?: string } | undefined;

    // Allow an optional human-friendly slug id (e.g. "react-foundations").
    const courseId =
      typeof courseData.id === "string" && courseData.id.trim()
        ? courseData.id.trim()
        : randomUUID();

    const doc: any = {
      _id: courseId,
      title: courseData.title.trim(),
      description: courseData.description.trim(),
      difficulty: courseData.difficulty || "beginner",
      category: courseData.category || "general",
      duration: Number(courseData.duration) || 0,
      price: Number(courseData.price) || 0,
      imageUrl: courseData.imageUrl || null,
      instructor: courseData.instructor.trim(),
      instructorId: authUser?.id || null,
      rating: 0.0,
      totalStudents: 0,
      tags: Array.isArray(tags) ? buildTags(tags) : [],
      levels: Array.isArray(levels)
        ? levels.map((l: any, i: number) => buildLevel(courseId, l, i))
        : [],
    };

    const created = await Course.create(doc);

    res.status(201).json({
      message: "Course created successfully",
      course: withLocalCourseImage(created.toJSON()),
    });
  } catch (error) {
    console.error("[createCompleteCourse] Error:", error);
    res.status(500).json({
      error: "Failed to create course",
      details:
        process.env.NODE_ENV === "development" && error instanceof Error
          ? error.message
          : undefined,
    });
  }
};

/**
 * Rebuild a level's quiz subtree while preserving ids. Quizzes are matched to
 * the existing ones by id, falling back to position (so the common
 * single-quiz-per-level case keeps its id and learner attempts stay valid).
 */
function rebuildLevelQuizzes(courseId: string, levelId: string, existingLevel: any, incomingQuizzes: any[]) {
  const existing = Array.isArray(existingLevel?.quizzes) ? existingLevel.quizzes : [];
  const used = new Set<string>();

  return incomingQuizzes.map((incoming: any, idx: number) => {
    let match: any;
    if (incoming.id) {
      match = existing.find((q: any) => String(q._id) === String(incoming.id));
    }
    if (!match) {
      match = existing.find((q: any, i: number) => i === idx && !used.has(String(q._id)));
    }
    if (match) used.add(String(match._id));

    const quizId = match ? String(match._id) : randomUUID();

    const existingQuestions = match && Array.isArray(match.questions) ? match.questions : [];
    const questionsIn = Array.isArray(incoming.questions) ? incoming.questions : [];

    const questions = questionsIn.map((q: any, qi: number) => {
      let qMatch: any;
      if (q.id) qMatch = existingQuestions.find((eq: any) => String(eq._id) === String(q.id));
      if (!qMatch) qMatch = existingQuestions[qi];
      const questionId = qMatch ? String(qMatch._id) : q.id ? String(q.id) : randomUUID();

      const existingOptions = qMatch && Array.isArray(qMatch.options) ? qMatch.options : [];
      const optionsIn = Array.isArray(q.options) ? q.options : [];

      const options = optionsIn.map((o: any, oi: number) => {
        let oMatch: any;
        if (o.id) oMatch = existingOptions.find((eo: any) => String(eo._id) === String(o.id));
        if (!oMatch) oMatch = existingOptions[oi];
        const optionId = oMatch ? String(oMatch._id) : o.id ? String(o.id) : randomUUID();
        return {
          _id: optionId,
          optionText: o.optionText,
          isCorrect: o.isCorrect === true,
        };
      });

      return {
        _id: questionId,
        questionText: q.questionText,
        questionType: q.questionType || "multiple_choice",
        points: Number(q.points) || 1,
        options,
      };
    });

    return {
      _id: quizId,
      title: incoming.title,
      description: incoming.description ?? "",
      levelId,
      courseId,
      timeLimit: Number(incoming.timeLimit) || 30,
      passingScore: Number(incoming.passingScore) || 70,
      totalQuestions: questions.length,
      isActive: incoming.isActive !== false,
      questions,
    };
  });
}

/**
 * Update a course AND its full content tree (levels, quizzes, questions,
 * options). `levels` and `tags` are only touched when provided, so partial
 * updates (e.g. just course metadata) are safe. Level/quiz ids are preserved
 * so learning-service progress (keyed by levelId/quizId) stays valid.
 */
export const updateCompleteCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { courseData, levels, tags } = req.body;

    const validation = validateCoursePayload(req.body, { requireCourseFields: false });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    if (!canManage(course, req)) {
      return res.status(403).json({ error: "You can only edit your own courses" });
    }

    // Update only the scalar fields that were provided.
    if (courseData) {
      if (courseData.title !== undefined) course.title = String(courseData.title).trim();
      if (courseData.description !== undefined)
        course.description = String(courseData.description).trim();
      if (courseData.difficulty !== undefined) course.difficulty = courseData.difficulty;
      if (courseData.category !== undefined) course.category = courseData.category;
      if (courseData.duration !== undefined) course.duration = Number(courseData.duration);
      if (courseData.price !== undefined) course.price = Number(courseData.price);
      if (courseData.imageUrl !== undefined) course.imageUrl = courseData.imageUrl;
      if (courseData.instructor !== undefined)
        course.instructor = String(courseData.instructor).trim();
    }

    if (Array.isArray(tags)) {
      course.tags = buildTags(tags);
    }

    if (Array.isArray(levels)) {
      // Snapshot existing levels (plain) so we can match by id/position.
      const existingLevels = course.toJSON().levels || [];
      const existingById = new Map<string, any>(
        existingLevels.map((l: any) => [String(l.id), l])
      );

      course.levels = levels.map((incoming: any, i: number) => {
        const levelId =
          incoming.id && existingById.has(String(incoming.id))
            ? String(incoming.id)
            : typeof incoming.id === "string" && incoming.id
            ? String(incoming.id)
            : randomUUID();

        const existingLevel = existingById.get(levelId);
        const incomingQuizzes = Array.isArray(incoming.quizzes) ? incoming.quizzes : [];

        return {
          _id: levelId,
          title: incoming.title,
          description: incoming.description ?? "",
          videoUrl: incoming.videoUrl ?? null,
          content: incoming.content ?? "",
          order: Number(incoming.order) || i + 1,
          duration: Number(incoming.duration) || 0,
          isUnlocked: existingLevel ? existingLevel.isUnlocked : i === 0,
          requiredScore: Number(incoming.requiredScore) || 70,
          quizzes: rebuildLevelQuizzes(String(id), levelId, existingLevel, incomingQuizzes),
        };
      }) as any;
    }

    const updated = await course.save();

    res.json({
      message: "Course updated successfully",
      course: withLocalCourseImage(updated.toJSON()),
    });
  } catch (error) {
    console.error("[updateCompleteCourse] Error:", error);
    res.status(500).json({
      error: "Failed to update course",
      details:
        process.env.NODE_ENV === "development" && error instanceof Error
          ? error.message
          : undefined,
    });
  }
};

/**
 * Delete a course and all related content (the whole tree is embedded).
 */
export const deleteCompleteCourse = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({ error: "Course not found" });
    }
    if (!canManage(course, req)) {
      return res.status(403).json({ error: "You can only delete your own courses" });
    }

    await Course.findByIdAndDelete(id);
    res.json({ message: "Course deleted successfully" });
  } catch (error) {
    console.error("[deleteCompleteCourse] Error:", error);
    res.status(500).json({ error: "Failed to delete course" });
  }
};
