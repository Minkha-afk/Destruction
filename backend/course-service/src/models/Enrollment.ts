import mongoose, { Schema } from "mongoose";
import { randomUUID } from "crypto";

// ============================================================================
// ENROLLMENT MODEL — learning-service
// Owns a user's enrollment in a course plus their per-level progress
// (embedded, since it's bounded by the course's level count and always loaded
// together). courseId / levelId are string refs into catalog-service.
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

const levelProgressSchema = new Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    levelId: { type: String, required: true },
    levelOrder: { type: Number, required: true },
    isUnlocked: { type: Boolean, default: false },
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
  },
  { _id: false, toJSON: idTransform, toObject: idTransform }
);

const enrollmentSchema = new Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    userId: { type: String, required: true },
    courseId: { type: String, required: true },
    enrolledAt: { type: Date, default: Date.now },
    status: { type: String, default: "active" }, // active, completed, dropped
    progress: { type: Number, default: 0 }, // 0-100
    levelProgress: { type: [levelProgressSchema], default: [] },
  },
  { timestamps: true, toJSON: idTransform, toObject: idTransform }
);

enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ courseId: 1 });

export const Enrollment =
  mongoose.models.Enrollment || mongoose.model("Enrollment", enrollmentSchema);
export default Enrollment;
