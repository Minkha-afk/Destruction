"use client"

import { motion } from "framer-motion"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

export type BubbleMessage = {
  id: string
  sender: string
  text: string
  timestamp: string
  avatar?: string
  isCurrentUser?: boolean
}

export default function MessageBubble({ id, sender, text, timestamp, avatar, isCurrentUser }: BubbleMessage) {
  const alignment = isCurrentUser ? "justify-end" : "justify-start"

  const initials = sender
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

  return (
    <motion.div
      layout
      data-message-id={id}
      initial={{ opacity: 0, y: 8, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -6, scale: 0.98 }}
      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
      className={cn("group flex items-end gap-3", alignment)}
    >
      {!isCurrentUser && (
        <Avatar className="h-8 w-8 shrink-0 ring-1 ring-white/10 transition-transform group-hover:scale-105">
          <AvatarImage src={avatar || "/placeholder.svg"} alt={sender} />
          <AvatarFallback className="bg-gradient-to-br from-slate-700 to-slate-800 text-[10px] font-semibold text-slate-200">
            {initials}
          </AvatarFallback>
        </Avatar>
      )}

      <div className={cn("max-w-[75%] space-y-1")}>
        <div
          className={cn(
            "flex items-center gap-1.5 px-1 text-[11px] text-muted-foreground",
            isCurrentUser ? "justify-end" : "justify-start",
          )}
        >
          <span className="font-medium text-foreground/80">{sender}</span>
          <span className="opacity-60">{timestamp}</span>
        </div>
        <div
          className={cn(
            "px-4 py-2.5 text-sm leading-relaxed shadow-sm backdrop-blur-lg",
            isCurrentUser
              ? "rounded-2xl rounded-br-md border border-indigo-400/30 bg-gradient-to-br from-indigo-500/90 via-violet-500/80 to-violet-600/80 text-white shadow-[0_8px_28px_-10px_rgba(99,102,241,0.7)]"
              : "rounded-2xl rounded-bl-md border border-white/10 bg-white/[0.06] text-foreground shadow-black/20",
          )}
        >
          <p className="whitespace-pre-wrap break-words">{text}</p>
        </div>
      </div>

      {isCurrentUser && (
        <Avatar className="h-8 w-8 shrink-0 ring-1 ring-indigo-400/40 transition-transform group-hover:scale-105">
          <AvatarImage src={avatar || "/placeholder.svg"} alt={sender} />
          <AvatarFallback className="bg-gradient-to-br from-indigo-500/30 to-violet-500/30 text-[10px] font-semibold text-indigo-100">
            {initials}
          </AvatarFallback>
        </Avatar>
      )}
    </motion.div>
  )
}
