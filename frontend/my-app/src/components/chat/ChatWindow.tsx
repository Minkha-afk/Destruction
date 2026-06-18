"use client"

import { useEffect, useRef } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MessageSquareText } from "lucide-react"
import MessageBubble, { type BubbleMessage } from "@/components/chat/MessageBubble"
import { ScrollArea } from "@/components/ui/scroll-area"

export type ChatMessage = Omit<BubbleMessage, "isCurrentUser"> & { id: string }

type Props = {
  messages: ChatMessage[]
  currentUserName: string
}

export default function ChatWindow({ messages, currentUserName }: Props) {
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    // Auto scroll to bottom on new messages
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  return (
    <ScrollArea className="scrollbar-thin h-full pr-4">
      <div className="flex min-h-full flex-col gap-4 py-4">
        {messages.length === 0 && (
          <div className="grid flex-1 place-items-center py-10 text-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="card-premium max-w-sm px-7 py-9"
            >
              <span className="animate-float mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/25 bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 shadow-glow-cyan">
                <MessageSquareText className="h-7 w-7 text-cyan-300" />
              </span>
              <p className="font-display text-base font-semibold text-foreground">No messages yet</p>
              <p className="mt-1.5 text-sm text-muted-foreground">Start the conversation.</p>
            </motion.div>
          </div>
        )}

        <AnimatePresence initial={false}>
          {messages.map((m) => (
            <MessageBubble key={m.id} {...m} isCurrentUser={m.sender === currentUserName} />
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>
    </ScrollArea>
  )
}
