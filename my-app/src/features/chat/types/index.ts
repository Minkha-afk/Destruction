// Chat feature type definitions

export interface ChatMessage {
    id: string;
    courseId: string;
    senderId?: string;
    sender: string;
    text: string;
    timestamp: string;
    createdAt?: string;
    avatar?: string;
}

export interface BubbleMessage {
    id: string;
    sender: string;
    text: string;
    timestamp: string;
    avatar?: string;
    isCurrentUser?: boolean;
}

export interface OnlineUser {
    id: string;
    name: string;
    email?: string;
    lastSeen?: string;
    avatar?: string;
}

export interface ChatChannel {
    courseId: string;
    title: string;
    description?: string | null;
    thumbnail?: string | null;
    enrolledAt?: string;
}
