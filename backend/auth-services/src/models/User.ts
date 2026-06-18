import mongoose, { Schema, InferSchemaType } from "mongoose";
import { randomUUID } from "crypto";

// ============================================================================
// USER MODEL — auth-service
// String _id (uuid) keeps user ids stable & portable as cross-service refs.
// toJSON maps _id -> id and strips password/__v so responses match the old
// Prisma shape the frontend expects.
// ============================================================================

const userSchema = new Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ["learner", "teacher"], default: "learner" },
    createdAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        delete ret.password;
        return ret;
      },
    },
  }
);

export type UserDoc = InferSchemaType<typeof userSchema> & { _id: string };

export const User = mongoose.models.User || mongoose.model("User", userSchema);
export default User;
