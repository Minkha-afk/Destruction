"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { io, type Socket } from "socket.io-client"
import {
    chatAPI,
    type ChatApiChannel,
    type ChatApiMessage,
    type ChatApiOnlineUser,
    type ChatApiOnlineUsersResponse,
} from "@/api/chat-api"
import { API_BASE_URLS } from "@/lib/api-config"
import { getAuthToken } from "@/lib/token"
import type { ChatChannel, ChatMessage, OnlineUser } from "../types"

type ChatAck =
    | { ok: true; message: ChatApiMessage }
    | { ok: false; error: string }

type JoinAck =
    | { ok: true }
    | { ok: false; error: string }

const formatTimestamp = (value?: string) => {
    const date = value ? new Date(value) : new Date()
    if (Number.isNaN(date.getTime())) return ""

    return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
    })
}

const mapChannel = (channel: ChatApiChannel): ChatChannel => ({
    courseId: channel.courseId,
    title: channel.title || channel.courseId,
    description: channel.description,
    thumbnail: channel.thumbnail,
    enrolledAt: channel.enrolledAt,
})

const mapMessage = (message: ChatApiMessage): ChatMessage => ({
    id: String(message.id),
    courseId: String(message.courseId),
    senderId: String(message.senderId),
    sender: message.senderName || "Unknown",
    text: message.content,
    timestamp: formatTimestamp(message.createdAt),
    createdAt: message.createdAt,
})

const mapOnlineUsers = (users: ChatApiOnlineUser[]): OnlineUser[] => {
    const byUserId = new Map<string, OnlineUser>()

    users.forEach((user) => {
        byUserId.set(String(user.userId), {
            id: String(user.userId),
            name: user.username || user.email || "User",
            email: user.email,
            lastSeen: user.lastSeen,
        })
    })

    return Array.from(byUserId.values())
}

const mergeMessage = (messages: ChatMessage[], nextMessage: ChatMessage) => {
    const existingIndex = messages.findIndex((message) => message.id === nextMessage.id)

    if (existingIndex === -1) {
        return [...messages, nextMessage]
    }

    const nextMessages = [...messages]
    nextMessages[existingIndex] = nextMessage
    return nextMessages
}

const joinCourseChannel = (socket: Socket, courseId: string) =>
    new Promise<void>((resolve, reject) => {
        const timeout = window.setTimeout(() => {
            reject(new Error("Chat channel join timed out."))
        }, 7000)

        socket.emit("joinCourseChannel", courseId, (response: JoinAck) => {
            window.clearTimeout(timeout)

            if (response?.ok) {
                resolve()
                return
            }

            reject(new Error(response?.error || "Failed to join chat channel."))
        })
    })

export function useChat(currentUserName: string = "You") {
    const [channels, setChannels] = useState<ChatChannel[]>([])
    const [activeChannelId, setActiveChannelId] = useState<string | null>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([])
    const [channelsLoading, setChannelsLoading] = useState(true)
    const [messagesLoading, setMessagesLoading] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [isConnected, setIsConnected] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const socketRef = useRef<Socket | null>(null)

    const activeChannel = useMemo(
        () => channels.find((channel) => channel.courseId === activeChannelId) || null,
        [activeChannelId, channels]
    )

    useEffect(() => {
        const token = getAuthToken()

        if (!token) {
            setChannels([])
            setActiveChannelId(null)
            setMessages([])
            setOnlineUsers([])
            setIsConnected(false)
            setChannelsLoading(false)
            setError("Please sign in to use chat.")
            return
        }

        let isMounted = true
        setChannelsLoading(true)
        setError(null)

        chatAPI
            .getChannels()
            .then((payload) => {
                if (!isMounted) return

                const nextChannels = (payload.channels || []).map(mapChannel)
                setChannels(nextChannels)
                setActiveChannelId((current) => {
                    if (current && nextChannels.some((channel) => channel.courseId === current)) {
                        return current
                    }

                    return nextChannels[0]?.courseId || null
                })
            })
            .catch((err) => {
                if (!isMounted) return
                setError(err instanceof Error ? err.message : "Failed to load chat channels.")
            })
            .finally(() => {
                if (isMounted) setChannelsLoading(false)
            })

        return () => {
            isMounted = false
        }
    }, [])

    useEffect(() => {
        const token = getAuthToken()

        if (!token || !activeChannelId) {
            setMessages([])
            setOnlineUsers([])
            setIsConnected(false)
            setMessagesLoading(false)
            return
        }

        let isMounted = true
        setMessagesLoading(true)
        setMessages([])
        setOnlineUsers([])
        setError(null)

        const loadChannelState = async () => {
            try {
                const [history, online] = await Promise.all([
                    chatAPI.getMessages(activeChannelId),
                    chatAPI.getOnlineUsers(activeChannelId).catch(() => null),
                ])

                if (!isMounted) return

                setMessages(history.map(mapMessage))
                setOnlineUsers(online ? mapOnlineUsers(online.users) : [])
            } catch (err) {
                if (!isMounted) return
                setError(err instanceof Error ? err.message : "Failed to load chat.")
            } finally {
                if (isMounted) setMessagesLoading(false)
            }
        }

        loadChannelState()

        const socket = io(API_BASE_URLS.chat, {
            auth: { token },
            transports: ["websocket", "polling"],
        })

        socketRef.current = socket

        socket.on("connect", () => {
            setIsConnected(true)
            setError(null)
            joinCourseChannel(socket, activeChannelId)
                .then(() => socket.emit("heartbeat", activeChannelId))
                .catch((err) => {
                    setError(err instanceof Error ? err.message : "Failed to join chat channel.")
                })
        })

        socket.on("disconnect", () => {
            setIsConnected(false)
        })

        socket.on("connect_error", (err) => {
            setIsConnected(false)
            setError(`Realtime chat unavailable: ${err.message}`)
        })

        socket.on("chatMessage", (message: ChatApiMessage) => {
            if (String(message.courseId) !== activeChannelId) return
            setMessages((prev) => mergeMessage(prev, mapMessage(message)))
        })

        socket.on("onlineUsers", (payload: ChatApiOnlineUsersResponse) => {
            if (String(payload.courseId) !== activeChannelId) return
            setOnlineUsers(mapOnlineUsers(payload.users || []))
        })

        const heartbeat = window.setInterval(() => {
            if (socket.connected) socket.emit("heartbeat", activeChannelId)
        }, 30000)

        return () => {
            isMounted = false
            window.clearInterval(heartbeat)
            socket.emit("leaveCourseChannel", activeChannelId)
            socket.off("connect")
            socket.off("disconnect")
            socket.off("connect_error")
            socket.off("chatMessage")
            socket.off("onlineUsers")
            socket.disconnect()
            if (socketRef.current === socket) socketRef.current = null
        }
    }, [activeChannelId])

    const sendMessage = useCallback(async (text: string) => {
        const content = text.trim()
        if (!content) return

        if (!activeChannelId) {
            const message = "Select a course channel before sending a message."
            setError(message)
            throw new Error(message)
        }

        setIsSending(true)
        setError(null)

        try {
            const socket = socketRef.current

            if (socket?.connected) {
                await new Promise<void>((resolve, reject) => {
                    const timeout = window.setTimeout(() => {
                        reject(new Error("Message timed out. Please try again."))
                    }, 7000)

                    socket.emit("chatMessage", { courseId: activeChannelId, content }, (response: ChatAck) => {
                        window.clearTimeout(timeout)

                        if (response?.ok) {
                            setMessages((prev) => mergeMessage(prev, mapMessage(response.message)))
                            resolve()
                            return
                        }

                        reject(new Error(response?.error || "Failed to send message."))
                    })
                })
                return
            }

            const message = await chatAPI.sendMessage(activeChannelId, content)
            setMessages((prev) => mergeMessage(prev, mapMessage(message)))
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to send message."
            setError(message)
            throw err
        } finally {
            setIsSending(false)
        }
    }, [activeChannelId])

    return {
        channels,
        activeChannel,
        activeChannelId,
        setActiveChannelId,
        messages,
        onlineUsers,
        sendMessage,
        currentUserName,
        isLoading: channelsLoading || messagesLoading,
        channelsLoading,
        messagesLoading,
        isSending,
        isConnected,
        error,
    }
}

export function useOnlineUsers(courseId?: string) {
    const [users, setUsers] = useState<OnlineUser[]>([])
    const [isLoading, setIsLoading] = useState(Boolean(courseId))
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!courseId) {
            setUsers([])
            setIsLoading(false)
            return
        }

        let isMounted = true
        setIsLoading(true)

        chatAPI
            .getOnlineUsers(courseId)
            .then((payload) => {
                if (isMounted) setUsers(mapOnlineUsers(payload.users))
            })
            .catch((err) => {
                if (!isMounted) return
                setError(err instanceof Error ? err.message : "Failed to load online users.")
            })
            .finally(() => {
                if (isMounted) setIsLoading(false)
            })

        return () => {
            isMounted = false
        }
    }, [courseId])

    return { users, isLoading, error }
}
