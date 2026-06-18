"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Send } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = {
  onSend: (text: string) => void
}

export default function MessageInput({ onSend }: Props) {
  const [value, setValue] = useState("")

  const handleSubmit = () => {
    if (!value.trim()) return
    onSend(value)
    setValue("")
  }

  const canSend = Boolean(value.trim())

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-2 backdrop-blur-xl">
      <div
        className={cn(
          "flex items-center gap-2 rounded-xl transition-all duration-300",
          "focus-within:shadow-[0_0_0_1px_rgba(99,102,241,0.25),0_0_22px_-4px_rgba(99,102,241,0.4)]",
        )}
      >
        <Input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault()
              handleSubmit()
            }
          }}
          placeholder="Type your message..."
          aria-label="Message"
          className="rounded-xl border-white/10 bg-transparent focus-visible:ring-0"
        />
        <motion.div whileHover={canSend ? { scale: 1.05 } : undefined} whileTap={canSend ? { scale: 0.95 } : undefined}>
          <Button
            onClick={handleSubmit}
            disabled={!canSend}
            variant="glow"
            className="rounded-xl"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" />
            Send
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
