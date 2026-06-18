import { API_BASE_URLS, apiFetch } from "@/lib/api-config";

export interface ChatApiMessage {
  id: number | string;
  courseId: string;
  senderId: string;
  senderName: string;
  content: string;
  createdAt: string;
}

export interface ChatApiChannel {
  courseId: string;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  enrolledAt?: string;
}

export interface ChatApiOnlineUser {
  userId: string;
  username: string;
  email?: string;
  lastSeen?: string;
}

export interface ChatApiOnlineUsersResponse {
  courseId: string;
  users: ChatApiOnlineUser[];
  count: number;
  timestamp?: string;
}

export const chatAPI = {
  getChannels: () =>
    apiFetch<{ channels: ChatApiChannel[]; total: number }>(
      "/chat/channels",
      { method: "GET" },
      API_BASE_URLS.chat
    ),

  getMessages: (courseId: string) =>
    apiFetch<ChatApiMessage[]>(
      `/chat/${encodeURIComponent(courseId)}/messages`,
      { method: "GET" },
      API_BASE_URLS.chat
    ),

  sendMessage: (courseId: string, content: string) =>
    apiFetch<ChatApiMessage>(
      `/chat/${encodeURIComponent(courseId)}/messages`,
      {
        method: "POST",
        body: JSON.stringify({ content }),
      },
      API_BASE_URLS.chat
    ),

  getOnlineUsers: (courseId: string) =>
    apiFetch<ChatApiOnlineUsersResponse>(
      `/chat/${encodeURIComponent(courseId)}/online-users`,
      { method: "GET" },
      API_BASE_URLS.chat
    ),
};
