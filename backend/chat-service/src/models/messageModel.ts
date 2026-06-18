import Message from "./Message";

// Maximum allowed chat message length. Enforced at the API/socket boundary and
// as a final safety net here so an oversized message can never hit the DB.
export const MAX_MESSAGE_LENGTH = 2000;

export const saveMessage = async (courseId: string, senderId: string, senderName: string, content: string) => {
  const trimmed = content.trim().slice(0, MAX_MESSAGE_LENGTH);
  return Message.create({ courseId, senderId, senderName, content: trimmed });
};

export const getCourseMessages = async (courseId: string) => {
  return Message.find({ courseId }).sort({ createdAt: 1 });
};
