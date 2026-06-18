// Chat feature public API
// Components
export { default as ChatWindow } from './components/ChatWindow';
export { default as MessageBubble } from './components/MessageBubble';
export { default as MessageInput } from './components/MessageInput';
export { default as OnlineUsersBar } from './components/OnlineUsersBar';

// Composables
export { useChat, useOnlineUsers } from './composables/useChat';

// Types
export type { ChatChannel, ChatMessage, BubbleMessage, OnlineUser } from './types';
