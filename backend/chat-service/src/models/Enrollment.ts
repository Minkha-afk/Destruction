import mongoose, { Schema } from "mongoose";

// ============================================================================
// ENROLLMENT (read model) — chat-service
// Read-only view of the shared `enrollments` collection owned by
// learning-service, used to gate course chat channels by enrollment.
// strict:false so it tolerates the full document shape it doesn't model.
// ============================================================================

const enrollmentSchema = new Schema(
  {
    _id: { type: String },
    userId: { type: String },
    courseId: { type: String },
    status: { type: String },
    enrolledAt: { type: Date },
  },
  { strict: false, collection: "enrollments" }
);

export const Enrollment =
  mongoose.models.Enrollment || mongoose.model("Enrollment", enrollmentSchema);
export default Enrollment;
