import mongoose, { Schema } from "mongoose";
import { randomUUID } from "crypto";

// ============================================================================
// QUIZ ATTEMPT MODEL — learning-service
// One document per attempt; submitted answers are embedded. quizId / questionId
// / optionId are string refs into catalog-service content.
// ============================================================================

const idTransform = {
  virtuals: true,
  versionKey: false,
  transform: (_doc: any, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
};

const answerSchema = new Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    questionId: { type: String, required: true },
    optionId: { type: String, required: true },
    isCorrect: { type: Boolean, required: true },
    pointsEarned: { type: Number, default: 0 },
    answeredAt: { type: Date, default: Date.now },
  },
  { _id: false, toJSON: idTransform, toObject: idTransform }
);

const quizAttemptSchema = new Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    userId: { type: String, required: true },
    quizId: { type: String, required: true },
    courseId: { type: String, required: true },
    levelId: { type: String, required: true },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    timeTaken: { type: Number, default: null }, // seconds
    score: { type: Number, default: null }, // percentage 0-100
    totalPoints: { type: Number, default: 0 },
    maxPoints: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    status: { type: String, default: "in_progress" }, // in_progress, completed, abandoned
    answers: { type: [answerSchema], default: [] },
  },
  { timestamps: true, toJSON: idTransform, toObject: idTransform }
);

quizAttemptSchema.index({ userId: 1 });
quizAttemptSchema.index({ quizId: 1 });
quizAttemptSchema.index({ userId: 1, courseId: 1 });

export const QuizAttempt =
  mongoose.models.QuizAttempt || mongoose.model("QuizAttempt", quizAttemptSchema);
export default QuizAttempt;
