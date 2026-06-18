import { Server, Socket } from "socket.io";
import jwt from "jsonwebtoken";
import { saveMessage, MAX_MESSAGE_LENGTH } from "../models/messageModel";
import {
  addOnlineUser,
  getOnlineUsers,
  getOnlineUsersCount,
  removeOnlineUser,
  removeOnlineUserFromAllCourses,
  updateUserLastSeen,
} from "../models/onlineUserModel";
import { isUserEnrolledInCourse } from "../services/courseMembershipService";

type SocketUser = { userId: string; username: string; email: string };

type MessageAck =
  | ((response: { ok: true; message: unknown } | { ok: false; error: string }) => void)
  | undefined;

type JoinAck =
  | ((response: { ok: true } | { ok: false; error: string }) => void)
  | undefined;

type ClientMessagePayload = {
  courseId?: string;
  content?: string;
};

const roomForCourse = (courseId: string) => `course:${courseId}`;

const getSocketUser = (socket: Socket) => (socket as Socket & { user?: SocketUser }).user;

const serializeOnlineUsers = (courseId: string) => ({
  courseId,
  users: getOnlineUsers(courseId).map((user) => ({
    userId: user.userId,
    username: user.username,
    email: user.email,
    lastSeen: user.lastSeen,
  })),
  count: getOnlineUsersCount(courseId),
});

const emitOnlineUsers = (io: Server, courseId: string) => {
  io.to(roomForCourse(courseId)).emit("onlineUsers", serializeOnlineUsers(courseId));
};

const leaveCourse = (io: Server, socket: Socket, courseId: string) => {
  const removedUser = removeOnlineUser(socket.id, courseId);
  socket.leave(roomForCourse(courseId));

  if (removedUser) {
    io.to(roomForCourse(courseId)).emit("userLeft", {
      courseId,
      userId: removedUser.userId,
      username: removedUser.username,
      email: removedUser.email,
      timestamp: new Date(),
    });
    emitOnlineUsers(io, courseId);
  }
};

export const chatSocket = (io: Server) => {
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("No token provided"));

    const secret = process.env.JWT_SECRET;
    if (!secret) return next(new Error("Server misconfiguration"));

    try {
      const decoded = jwt.verify(token, secret) as {
        id?: string;
        userId?: string;
        email: string;
        username?: string;
      };

      const userId = (decoded.id || decoded.userId)?.toString();
      const username = decoded.username || decoded.email?.split("@")[0];

      if (!userId || !username) {
        return next(new Error("Invalid token payload"));
      }

      (socket as Socket & { user: SocketUser }).user = {
        userId,
        username,
        email: decoded.email || `${username}@unknown`,
      };
      next();
    } catch (err) {
      return next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const user = getSocketUser(socket);
    console.log("User connected:", user);

    socket.on("joinCourseChannel", async (courseId: string, ack: JoinAck) => {
      try {
        if (!user) {
          ack?.({ ok: false, error: "Unauthorized" });
          return;
        }

        const normalizedCourseId = typeof courseId === "string" ? courseId.trim() : "";
        if (!normalizedCourseId) {
          ack?.({ ok: false, error: "courseId is required" });
          return;
        }

        const hasAccess = await isUserEnrolledInCourse(user.userId, normalizedCourseId);
        if (!hasAccess) {
          ack?.({ ok: false, error: "Join this course before using its chat channel" });
          return;
        }

        Array.from(socket.rooms)
          .filter((room) => room.startsWith("course:"))
          .forEach((room) => leaveCourse(io, socket, room.replace("course:", "")));

        socket.join(roomForCourse(normalizedCourseId));
        addOnlineUser({
          userId: user.userId,
          username: user.username,
          email: user.email,
          socketId: socket.id,
          courseId: normalizedCourseId,
          lastSeen: new Date(),
          isOnline: true,
        });

        io.to(roomForCourse(normalizedCourseId)).emit("userJoined", {
          courseId: normalizedCourseId,
          userId: user.userId,
          username: user.username,
          email: user.email,
          timestamp: new Date(),
        });
        emitOnlineUsers(io, normalizedCourseId);
        ack?.({ ok: true });
      } catch (err) {
        console.error("Failed to join course chat:", err);
        ack?.({ ok: false, error: "Failed to join chat channel" });
      }
    });

    socket.on("leaveCourseChannel", (courseId: string) => {
      const normalizedCourseId = typeof courseId === "string" ? courseId.trim() : "";
      if (normalizedCourseId) leaveCourse(io, socket, normalizedCourseId);
    });

    socket.on("chatMessage", async (payload: ClientMessagePayload, ack: MessageAck) => {
      try {
        if (!user) {
          ack?.({ ok: false, error: "Unauthorized" });
          return;
        }

        const courseId = typeof payload?.courseId === "string" ? payload.courseId.trim() : "";
        const content = typeof payload?.content === "string" ? payload.content.trim() : "";

        if (!courseId) {
          ack?.({ ok: false, error: "courseId is required" });
          return;
        }

        if (!content) {
          ack?.({ ok: false, error: "Message content required" });
          return;
        }

        if (content.length > MAX_MESSAGE_LENGTH) {
          ack?.({ ok: false, error: `Message too long (max ${MAX_MESSAGE_LENGTH} characters)` });
          return;
        }

        const hasAccess = await isUserEnrolledInCourse(user.userId, courseId);
        if (!hasAccess) {
          ack?.({ ok: false, error: "Join this course before using its chat channel" });
          return;
        }

        const message = await saveMessage(courseId, user.userId, user.username, content);
        io.to(roomForCourse(courseId)).emit("chatMessage", message);
        ack?.({ ok: true, message });
      } catch (err) {
        console.error("Failed to save chat message:", err);
        ack?.({ ok: false, error: "Failed to send message" });
      }
    });

    socket.on("typing", (payload: { courseId?: string; isTyping?: boolean }) => {
      if (!user || !payload?.courseId) return;

      socket.to(roomForCourse(payload.courseId)).emit("userTyping", {
        courseId: payload.courseId,
        userId: user.userId,
        username: user.username,
        isTyping: Boolean(payload.isTyping),
      });
    });

    socket.on("heartbeat", (courseId?: string) => {
      updateUserLastSeen(socket.id, typeof courseId === "string" ? courseId : undefined);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", user);

      const removedUsers = removeOnlineUserFromAllCourses(socket.id);
      const affectedCourseIds = Array.from(new Set(removedUsers.map((removedUser) => removedUser.courseId)));

      affectedCourseIds.forEach((courseId) => {
        io.to(roomForCourse(courseId)).emit("userLeft", {
          courseId,
          userId: user?.userId,
          username: user?.username,
          email: user?.email,
          timestamp: new Date(),
        });
        emitOnlineUsers(io, courseId);
      });
    });
  });
};
