"use client"

import { Suspense } from "react"
import { motion } from "framer-motion"
import { BookOpen, Circle, Hash, MessageSquareText, Sparkles, Users, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sidebar } from "@/features/dashboard"
import { ChatWindow, MessageInput, OnlineUsersBar, useChat } from "@/features/chat"
import { useAuth } from "@/features/auth"
import { cn } from "@/lib/utils"

export default function ChatPage() {
  const { user, isLoading: authLoading } = useAuth()
  const currentUserName = user?.name ?? "You"
  const currentUserId = user?.id?.toString()
  const {
    channels,
    activeChannel,
    activeChannelId,
    setActiveChannelId,
    messages,
    onlineUsers,
    sendMessage,
    isLoading,
    isSending,
    isConnected,
    error,
  } = useChat(currentUserName)
  const canSend = Boolean(user) && !authLoading && Boolean(activeChannelId)

  return (
    <div className="aurora-bg grid-overlay min-h-screen bg-background text-foreground overflow-x-hidden">
      <aside
        aria-label="Sidebar navigation"
        className="fixed left-0 top-0 z-10 hidden h-full w-72 p-4 sidebar-glass lg:block"
      >
        <Suspense>
          <Sidebar />
        </Suspense>
      </aside>
      <main className="min-h-screen p-4 lg:ml-72 lg:p-8">
        <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-7xl flex-col gap-5 lg:min-h-[calc(100vh-4rem)]">
          <motion.header
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="card-premium flex flex-wrap items-center justify-between gap-4 px-5 py-4"
          >
            <div className="min-w-0">
              <div className="chip mb-2">
                <MessageSquareText className="h-3.5 w-3.5" />
                Course communities
              </div>
              <h1 className="font-display truncate text-2xl font-semibold tracking-tight sm:text-3xl">
                <span className="text-gradient-cyan">{activeChannel?.title || "Course Chat"}</span>
              </h1>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="glass-subtle inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-sm text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
                {channels.length} {channels.length === 1 ? "channel" : "channels"}
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3.5 py-2 text-sm font-semibold",
                  isConnected
                    ? "border-emerald-400/30 bg-emerald-500/12 text-emerald-300"
                    : "border-amber-400/30 bg-amber-500/12 text-amber-300",
                )}
              >
                {isConnected ? (
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400/70" />
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </span>
                ) : (
                  <WifiOff className="h-4 w-4" />
                )}
                {isConnected ? "Live" : "Offline"}
              </span>
            </div>
          </motion.header>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong grid min-h-0 flex-1 overflow-hidden shadow-2xl shadow-black/40 lg:grid-cols-[320px_minmax(0,1fr)]"
          >
            {/* Channel list */}
            <div className="border-b border-white/10 bg-white/[0.02] p-3 lg:border-b-0 lg:border-r">
              <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground/90">
                  <BookOpen className="h-4 w-4 text-cyan-300" />
                  Channels
                </div>
                <span className="chip">{channels.length}</span>
              </div>

              <motion.div
                initial="hidden"
                animate="show"
                variants={{
                  hidden: {},
                  show: { transition: { staggerChildren: 0.05 } },
                }}
                className="scrollbar-thin flex gap-2 overflow-x-auto pb-1 lg:max-h-[calc(100vh-15rem)] lg:flex-col lg:overflow-y-auto lg:pb-0 lg:pr-1"
              >
                {channels.map((channel) => {
                  const isActive = channel.courseId === activeChannelId

                  return (
                    <motion.div
                      key={channel.courseId}
                      variants={{ hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }}
                      className="min-w-64 lg:min-w-0"
                    >
                      <Button
                        type="button"
                        variant="ghost"
                        className={cn(
                          "group relative h-auto w-full justify-start gap-3 rounded-xl border px-3 py-3 text-left transition-all duration-300",
                          isActive
                            ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-50 shadow-[0_0_22px_-6px_rgba(6,182,212,0.5)] hover:bg-cyan-500/15"
                            : "border-white/10 bg-white/[0.03] hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.07]",
                        )}
                        onClick={() => setActiveChannelId(channel.courseId)}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="activeChannelRail"
                            className="absolute left-0 top-1/2 h-7 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-cyan-400 to-indigo-500"
                            style={{ width: 3 }}
                            transition={{ type: "spring", stiffness: 380, damping: 32 }}
                          />
                        )}
                        <span
                          className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border transition-colors",
                            isActive
                              ? "border-cyan-400/30 bg-cyan-500/15 text-cyan-200"
                              : "border-white/10 bg-white/[0.06] text-muted-foreground group-hover:text-foreground",
                          )}
                        >
                          <Hash className="h-4 w-4" />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-sm font-medium">{channel.title}</span>
                          <span className="mt-0.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Circle
                              className={cn(
                                "h-2 w-2",
                                isActive
                                  ? "fill-cyan-300 text-cyan-300"
                                  : "fill-slate-500 text-slate-500",
                              )}
                            />
                            Group chat
                          </span>
                        </span>
                      </Button>
                    </motion.div>
                  )
                })}

                {isLoading && channels.length === 0 && (
                  <div className="flex min-w-64 flex-col gap-2 lg:min-w-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.02] px-3 py-3"
                      >
                        <div className="shimmer h-9 w-9 rounded-lg" />
                        <div className="flex-1 space-y-2">
                          <div className="shimmer h-3 w-3/4 rounded" />
                          <div className="shimmer h-2.5 w-2/5 rounded" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!isLoading && channels.length === 0 && (
                  <div className="min-w-64 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-6 text-center lg:min-w-0">
                    <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10">
                      <BookOpen className="h-6 w-6 text-cyan-300" />
                    </span>
                    <p className="text-sm font-medium text-foreground">No channels yet</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Enroll in a course to unlock its group chat.
                    </p>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Conversation panel */}
            <div className="flex min-h-[70vh] flex-col lg:min-h-0">
              <div className="border-b border-white/10 bg-background/40 px-4 py-3 backdrop-blur-xl">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-cyan-400/20 bg-cyan-500/10">
                        <Users className="h-4 w-4 text-cyan-300" />
                      </span>
                      <h2 className="font-display truncate text-base font-semibold">
                        {activeChannel?.title || "Select a course channel"}
                      </h2>
                    </div>
                    {activeChannel?.description && (
                      <p className="mt-1 max-w-2xl truncate text-sm text-muted-foreground">
                        {activeChannel.description}
                      </p>
                    )}
                  </div>
                  <div className="w-full sm:w-auto sm:min-w-64">
                    <OnlineUsersBar users={onlineUsers} />
                  </div>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mx-4 mt-3 flex items-center gap-2 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3.5 py-2.5 text-sm text-amber-200"
                  role="alert"
                >
                  <WifiOff className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <div className="min-h-0 flex-1 px-3">
                <ChatWindow
                  messages={messages}
                  currentUserName={currentUserName}
                  currentUserId={currentUserId}
                  isLoading={isLoading}
                />
              </div>

              <div className="px-4 pb-4">
                <MessageInput
                  onSend={sendMessage}
                  disabled={!canSend}
                  isSending={isSending}
                />
              </div>
            </div>
          </motion.section>
        </div>
      </main>
    </div>
  )
}
