import mongoose, { Schema } from "mongoose";
import { randomUUID } from "crypto";

// ============================================================================
// MESSAGE MODEL — chat-service (collection: messages)
// ============================================================================

const messageSchema = new Schema(
  {
    _id: { type: String, default: () => randomUUID() },
    courseId: { type: String, default: "global" },
    senderId: { type: String, required: true },
    senderName: { type: String, required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  {
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc: any, ret: any) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  }
);

messageSchema.index({ courseId: 1, createdAt: 1 });

export const Message = mongoose.models.Message || mongoose.model("Message", messageSchema);
export default Message;
