// Online users are stored in-memory; Prisma is not needed here.

export interface OnlineUser {
  userId: string;
  username: string;
  email: string;
  socketId: string;
  courseId: string;
  lastSeen: Date;
  isOnline: boolean;
}

const onlineUsers = new Map<string, OnlineUser>();

const keyFor = (courseId: string, socketId: string) => `${courseId}:${socketId}`;

export const addOnlineUser = (user: OnlineUser) => {
  onlineUsers.set(keyFor(user.courseId, user.socketId), user);
  return user;
};

export const removeOnlineUser = (socketId: string, courseId: string) => {
  const key = keyFor(courseId, socketId);
  const user = onlineUsers.get(key);

  if (user) {
    onlineUsers.delete(key);
    return user;
  }

  return null;
};

export const removeOnlineUserFromAllCourses = (socketId: string) => {
  const removedUsers: OnlineUser[] = [];

  for (const [key, user] of onlineUsers.entries()) {
    if (user.socketId === socketId) {
      onlineUsers.delete(key);
      removedUsers.push(user);
    }
  }

  return removedUsers;
};

export const getOnlineUsers = (courseId: string): OnlineUser[] => {
  const dedupedUsers = new Map<string, OnlineUser>();

  Array.from(onlineUsers.values())
    .filter((user) => user.courseId === courseId && user.isOnline)
    .forEach((user) => {
      const existing = dedupedUsers.get(user.userId);
      if (!existing || existing.lastSeen < user.lastSeen) {
        dedupedUsers.set(user.userId, user);
      }
    });

  return Array.from(dedupedUsers.values());
};

export const updateUserLastSeen = (socketId: string, courseId?: string) => {
  const users = Array.from(onlineUsers.values()).filter((user) => {
    return user.socketId === socketId && (!courseId || user.courseId === courseId);
  });

  users.forEach((user) => {
    user.lastSeen = new Date();
  });

  return users;
};

export const getOnlineUsersCount = (courseId: string): number => {
  return getOnlineUsers(courseId).length;
};
