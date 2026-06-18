import mongoose, { Schema } from "mongoose";
import { randomUUID } from "crypto";

// ============================================================================
// COURSE MODEL — catalog-service
// The whole content tree is embedded in one Course document:
//   Course -> levels[] -> quizzes[] -> questions[] -> options[]
// Every node has a stable String _id (uuid or slug) so cross-service refs
// (quizId / levelId / courseId used by learning-service) stay valid.
// toJSON maps _id -> id and drops __v on every level so responses match the
// shape the frontend already consumes.
// ============================================================================

const uuid = () => randomUUID();

const idTransform = {
  virtuals: true,
  versionKey: false,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
};

const optionSchema = new Schema(
  {
    _id: { type: String, default: uuid },
    optionText: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: false, toJSON: idTransform, toObject: idTransform }
);

const questionSchema = new Schema(
  {
    _id: { type: String, default: uuid },
    questionText: { type: String, required: true },
    questionType: { type: String, default: "multiple_choice" },
    points: { type: Number, default: 1 },
    options: [optionSchema],
  },
  { _id: false, toJSON: idTransform, toObject: idTransform }
);

const quizSchema = new Schema(
  {
    _id: { type: String, default: uuid },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    levelId: { type: String },
    courseId: { type: String },
    timeLimit: { type: Number, default: 30 },
    passingScore: { type: Number, default: 70 },
    totalQuestions: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    questions: [questionSchema],
  },
  { _id: false, toJSON: idTransform, toObject: idTransform }
);

const levelSchema = new Schema(
  {
    _id: { type: String, default: uuid },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    videoUrl: { type: String, default: null },
    content: { type: String, default: "" },
    order: { type: Number, required: true },
    duration: { type: Number, default: 0 },
    isUnlocked: { type: Boolean, default: false },
    requiredScore: { type: Number, default: 70 },
    quizzes: [quizSchema],
  },
  { _id: false, toJSON: idTransform, toObject: idTransform }
);

const tagSchema = new Schema(
  {
    _id: { type: String, default: uuid },
    name: { type: String, required: true },
    color: { type: String, default: "#3B82F6" },
  },
  { _id: false, toJSON: idTransform, toObject: idTransform }
);

const courseSchema = new Schema(
  {
    _id: { type: String, default: uuid },
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: { type: String, default: "beginner" },
    category: { type: String, default: "general" },
    duration: { type: Number, default: 0 },
    price: { type: Number, default: 0 },
    imageUrl: { type: String, default: null },
    instructor: { type: String, required: true }, // display name
    instructorId: { type: String, default: null, index: true }, // owning teacher's userId
    rating: { type: Number, default: 0 },
    totalStudents: { type: Number, default: 0 },
    tags: [tagSchema],
    levels: [levelSchema],
  },
  { timestamps: true, toJSON: idTransform, toObject: idTransform }
);

courseSchema.index({ category: 1 });
courseSchema.index({ difficulty: 1 });
courseSchema.index({ rating: -1 });

export const Course = mongoose.models.Course || mongoose.model("Course", courseSchema);
export default Course;
