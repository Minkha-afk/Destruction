import "dotenv/config";
import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import { randomUUID } from "crypto";
import Course from "./models/Course";
import { seedCourses } from "./seed-data";

// ============================================================================
// MASTER SEED — populates the shared `elevana` MongoDB with production-grade
// content (catalog), demo accounts (auth), and sample learning state
// (enrollments + progress + quiz attempts) so dashboards aren't empty.
//
// Run from backend/search-service:  npm run seed
// Requires MONGODB_URI in the environment and the cluster IP allowlisted.
// ============================================================================

// ── Inline models for the collections owned by the other services ───────────
// (We write directly to the same DB; collection names match the live models:
//  User -> users, Enrollment -> enrollments, QuizAttempt -> quizattempts.)

const userSchema = new Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    name: String,
    email: { type: String, unique: true, lowercase: true, trim: true },
    password: String,
    role: { type: String, enum: ["learner", "teacher"], default: "learner" },
    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);
const User = mongoose.models.User || mongoose.model("User", userSchema);

const levelProgressSchema = new Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    levelId: String,
    levelOrder: Number,
    isUnlocked: Boolean,
    isCompleted: Boolean,
    completedAt: { type: Date, default: null },
  },
  { _id: false }
);
const enrollmentSchema = new Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    userId: String,
    courseId: String,
    enrolledAt: { type: Date, default: Date.now },
    status: { type: String, default: "active" },
    progress: { type: Number, default: 0 },
    levelProgress: [levelProgressSchema],
  },
  { timestamps: true, versionKey: false }
);
const Enrollment = mongoose.models.Enrollment || mongoose.model("Enrollment", enrollmentSchema);

const answerSchema = new Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    questionId: String,
    optionId: String,
    isCorrect: Boolean,
    pointsEarned: Number,
    answeredAt: { type: Date, default: Date.now },
  },
  { _id: false }
);
const quizAttemptSchema = new Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    userId: String,
    quizId: String,
    courseId: String,
    levelId: String,
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    timeTaken: Number,
    score: Number,
    totalPoints: Number,
    maxPoints: Number,
    passed: Boolean,
    status: { type: String, default: "in_progress" },
    answers: [answerSchema],
  },
  { timestamps: true, versionKey: false }
);
const QuizAttempt = mongoose.models.QuizAttempt || mongoose.model("QuizAttempt", quizAttemptSchema);

// ── Helpers ─────────────────────────────────────────────────────────────────

const TAG_COLORS: Record<string, string> = {
  Frontend: "#3B82F6", Backend: "#10B981", Fullstack: "#8B5CF6", Programming: "#F59E0B",
  JavaScript: "#EAB308", TypeScript: "#6366F1", Python: "#059669", React: "#06B6D4",
  "Data Science": "#EC4899", Design: "#F472B6", DevOps: "#EF4444", Mobile: "#14B8A6",
  AI: "#A855F7", "Machine Learning": "#A855F7", Cloud: "#0EA5E9", Node: "#22C55E",
};
const colorFor = (name: string) => TAG_COLORS[name] || "#3B82F6";

const daysAgo = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
};

// Build a full Course document (with all embedded ids assigned) from seed data.
// `owner` is the teacher who owns the course (powers the studio "My Courses").
function buildCourseDoc(c: any, owner: { _id: string; name: string }) {
  return {
    _id: c.id,
    title: c.title,
    description: c.description,
    difficulty: c.difficulty,
    category: c.category,
    duration: c.duration,
    price: c.price ?? 0,
    imageUrl: c.imageUrl ?? null,
    instructor: owner.name,
    instructorId: owner._id,
    rating: c.rating ?? 4.5,
    totalStudents: c.totalStudents ?? 0,
    tags: (c.tags || []).map((name: string) => ({ _id: randomUUID(), name, color: colorFor(name) })),
    levels: (c.levels || []).map((l: any, i: number) => {
      const levelId = l.id || `${c.id}-level-${i + 1}`;
      const quizzes = l.quiz
        ? [
            {
              _id: randomUUID(),
              title: l.quiz.title || `Level ${i + 1} Quiz`,
              description: l.quiz.description || "",
              courseId: c.id,
              levelId,
              timeLimit: l.quiz.timeLimit ?? 10,
              passingScore: l.quiz.passingScore ?? 70,
              totalQuestions: (l.quiz.questions || []).length,
              isActive: true,
              questions: (l.quiz.questions || []).map((q: any) => ({
                _id: randomUUID(),
                questionText: q.questionText,
                questionType: "multiple_choice",
                points: q.points ?? 1,
                options: (q.options || []).map((o: any) => ({
                  _id: randomUUID(),
                  optionText: o.optionText,
                  isCorrect: !!o.isCorrect,
                })),
              })),
            },
          ]
        : [];
      return {
        _id: levelId,
        title: l.title,
        description: l.description,
        videoUrl: l.videoUrl ?? null,
        content: l.content,
        order: l.order ?? i + 1,
        duration: l.duration ?? 30,
        isUnlocked: i === 0,
        requiredScore: l.requiredScore ?? 70,
        quizzes,
      };
    }),
  };
}

// Create an enrollment + passing quiz attempts for completed levels.
async function enrollWithProgress(opts: {
  userId: string;
  course: any; // built course doc
  completedLevels: number;
  enrolledDaysAgo: number;
}) {
  const { userId, course, completedLevels, enrolledDaysAgo } = opts;
  const levels = [...course.levels].sort((a: any, b: any) => a.order - b.order);
  const total = levels.length;
  const completed = Math.min(completedLevels, total);

  const levelProgress = levels.map((level: any, i: number) => ({
    levelId: level._id,
    levelOrder: level.order,
    isUnlocked: i <= completed, // completed levels + the next one
    isCompleted: i < completed,
    completedAt: i < completed ? daysAgo(enrolledDaysAgo - i) : null,
  }));

  const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

  await Enrollment.create({
    userId,
    courseId: course._id,
    enrolledAt: daysAgo(enrolledDaysAgo),
    status: completed === total && total > 0 ? "completed" : "active",
    progress,
    levelProgress,
  });

  for (let i = 0; i < completed; i++) {
    const level = levels[i];
    const quiz = level.quizzes?.[0];
    if (!quiz) continue;

    const maxPoints = quiz.questions.reduce((s: number, q: any) => s + (q.points || 1), 0);
    const answers = quiz.questions.map((q: any) => {
      const correct = q.options.find((o: any) => o.isCorrect) || q.options[0];
      return {
        questionId: q._id,
        optionId: correct?._id || "",
        isCorrect: true,
        pointsEarned: q.points || 1,
        answeredAt: daysAgo(enrolledDaysAgo - i),
      };
    });

    const startedAt = daysAgo(enrolledDaysAgo - i);
    await QuizAttempt.create({
      userId,
      quizId: quiz._id,
      courseId: course._id,
      levelId: level._id,
      startedAt,
      completedAt: new Date(startedAt.getTime() + 7 * 60 * 1000),
      timeTaken: 7 * 60,
      score: 100,
      totalPoints: maxPoints,
      maxPoints,
      passed: true,
      status: "completed",
      answers,
    });
  }
}

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) throw new Error("MONGODB_URI is not set");

  console.log("🌱 Connecting to MongoDB...");
  await mongoose.connect(uri);
  console.log(`✅ Connected (${mongoose.connection.name})`);

  console.log("🧹 Clearing existing data...");
  await Promise.all([
    Course.deleteMany({}),
    User.deleteMany({}),
    Enrollment.deleteMany({}),
    QuizAttempt.deleteMany({}),
  ]);

  console.log("👥 Creating demo accounts...");
  const passwordHash = await bcrypt.hash("password123", 10);

  const teachers = [
    { name: "Dr. Sarah Chen", email: "sarah@elevana.dev" },
    { name: "Marcus Reed", email: "marcus@elevana.dev" },
  ];
  const learners = [
    { name: "Alex Johnson", email: "alex@elevana.dev" },
    { name: "Jamie Rivera", email: "jamie@elevana.dev" },
    { name: "Priya Sharma", email: "priya@elevana.dev" },
  ];

  const teacherDocs = await User.insertMany(
    teachers.map((t) => ({ ...t, password: passwordHash, role: "teacher" }))
  );
  const learnerDocs = await User.insertMany(
    learners.map((l) => ({ ...l, password: passwordHash, role: "learner" }))
  );

  // Distribute courses across the demo teachers so each studio has real data.
  console.log(`📚 Inserting ${seedCourses.length} courses...`);
  const courseDocs = seedCourses.map((c, i) =>
    buildCourseDoc(c, teacherDocs[i % teacherDocs.length])
  );
  await Course.insertMany(courseDocs);

  console.log("📈 Creating sample enrollments & progress...");
  const byId = new Map(courseDocs.map((c) => [c._id, c]));
  const [alex, jamie, priya] = learnerDocs;
  const plan = [
    { user: alex, courseId: "react-foundations", completed: 2, daysAgo: 14 },
    { user: alex, courseId: "typescript-essentials", completed: 1, daysAgo: 9 },
    { user: jamie, courseId: "nextjs-app-router", completed: 2, daysAgo: 12 },
    { user: jamie, courseId: "python-fundamentals", completed: 1, daysAgo: 5 },
    { user: priya, courseId: "nodejs-backend", completed: 3, daysAgo: 20 },
  ];

  for (const p of plan) {
    const course = byId.get(p.courseId);
    if (!course) continue;
    await enrollWithProgress({
      userId: p.user._id,
      course,
      completedLevels: p.completed,
      enrolledDaysAgo: p.daysAgo,
    });
  }

  const [courses, users, enrollments, attempts] = await Promise.all([
    Course.countDocuments(),
    User.countDocuments(),
    Enrollment.countDocuments(),
    QuizAttempt.countDocuments(),
  ]);

  console.log("\n✅ Seed complete");
  console.log(`   📚 Courses:       ${courses}`);
  console.log(`   👥 Users:         ${users}`);
  console.log(`   🎟️  Enrollments:   ${enrollments}`);
  console.log(`   🧪 Quiz attempts: ${attempts}`);
  console.log("\n🔑 Demo logins (password: password123):");
  console.log("   Teacher: sarah@elevana.dev");
  console.log("   Teacher: marcus@elevana.dev");
  console.log("   Learner: alex@elevana.dev");
  console.log("   Learner: jamie@elevana.dev");
  console.log("   Learner: priya@elevana.dev");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
