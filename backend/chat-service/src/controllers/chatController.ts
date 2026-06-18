import { Response } from "express";
import { getCourseMessages, saveMessage, MAX_MESSAGE_LENGTH } from "../models/messageModel";
import { getOnlineUsers as getOnlineUsersFromModel, getOnlineUsersCount } from "../models/onlineUserModel";
import { AuthRequest } from "../middleware/authMiddleware";
import { getUserCourseChannels, isUserEnrolledInCourse } from "../services/courseMembershipService";

const requireCourseAccess = async (req: AuthRequest, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  const { courseId } = req.params;
  if (!courseId) {
    res.status(400).json({ error: "courseId is required" });
    return null;
  }

  const hasAccess = await isUserEnrolledInCourse(req.user.userId, courseId);
  if (!hasAccess) {
    res.status(403).json({ error: "Join this course before using its chat channel" });
    return null;
  }

  return { user: req.user, courseId };
};

export const getChannels = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: "Unauthorized" });

    const channels = await getUserCourseChannels(req.user.userId);
    res.json({ channels, total: channels.length });
  } catch (err) {
    console.error("[getChannels] Error:", err);
    res.status(500).json({ error: "Failed to fetch chat channels" });
  }
};

export const fetchMessages = async (req: AuthRequest, res: Response) => {
  try {
    const access = await requireCourseAccess(req, res);
    if (!access) return;

    const messages = await getCourseMessages(access.courseId);
    res.json(messages);
  } catch (err) {
    console.error("[fetchMessages] Error:", err);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
};

export const postMessage = async (req: AuthRequest, res: Response) => {
  try {
    const access = await requireCourseAccess(req, res);
    if (!access) return;

    const content = typeof req.body?.content === "string" ? req.body.content.trim() : "";
    if (!content) return res.status(400).json({ error: "Message content required" });
    if (content.length > MAX_MESSAGE_LENGTH) {
      return res.status(400).json({ error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)` });
    }

    const message = await saveMessage(
      access.courseId,
      access.user.userId,
      access.user.username,
      content
    );

    res.status(201).json(message);
  } catch (err) {
    console.error("[postMessage] Error:", err);
    res.status(500).json({ error: "Failed to save message" });
  }
};

export const getOnlineUsers = async (req: AuthRequest, res: Response) => {
  try {
    const access = await requireCourseAccess(req, res);
    if (!access) return;

    const onlineUsers = getOnlineUsersFromModel(access.courseId);
    const onlineCount = getOnlineUsersCount(access.courseId);

    res.json({
      courseId: access.courseId,
      users: onlineUsers.map((user) => ({
        userId: user.userId,
        username: user.username,
        email: user.email,
        lastSeen: user.lastSeen,
      })),
      count: onlineCount,
      timestamp: new Date(),
    });
  } catch (err) {
    console.error("[getOnlineUsers] Error:", err);
    res.status(500).json({ error: "Failed to fetch online users" });
  }
};
