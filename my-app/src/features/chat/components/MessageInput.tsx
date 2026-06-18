"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Loader2, Send } from "lucide-react"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type Props = {
    onSend: (text: string) => void | Promise<void>
    disabled?: boolean
    isSending?: boolean
}

export default function MessageInput({ onSend, disabled = false, isSending = false }: Props) {
    const [value, setValue] = useState("")

    const handleSubmit = async () => {
        if (!value.trim() || disabled || isSending) return

        try {
            await onSend(value)
            setValue("")
        } catch {
            // The chat page renders the send error from the hook.
        }
    }

    const canSend = Boolean(value.trim()) && !disabled && !isSending

    return (
        <div className="border-t border-white/10 bg-background/70 pt-3 backdrop-blur-xl">
            <div
                className={cn(
                    "flex items-end gap-2 rounded-2xl border border-white/10 bg-white/[0.04] p-2 shadow-sm transition-all duration-300",
                    "focus-within:border-indigo-400/40 focus-within:shadow-[0_0_0_1px_rgba(99,102,241,0.25),0_0_22px_-4px_rgba(99,102,241,0.4)]",
                    disabled && "opacity-70",
                )}
            >
                <Textarea
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSubmit()
                        }
                    }}
                    disabled={disabled || isSending}
                    placeholder={disabled ? "Select a course channel" : "Message this course..."}
                    rows={1}
                    aria-label="Message"
                    className="scrollbar-thin max-h-32 min-h-11 resize-none rounded-xl border-0 bg-transparent px-3 py-2.5 text-sm shadow-none placeholder:text-muted-foreground/70 focus-visible:ring-0"
                />
                <motion.div whileHover={canSend ? { scale: 1.05 } : undefined} whileTap={canSend ? { scale: 0.95 } : undefined}>
                    <Button
                        onClick={handleSubmit}
                        disabled={disabled || isSending || !value.trim()}
                        variant="glow"
                        size="icon"
                        className="h-11 w-11 rounded-xl"
                        aria-label="Send message"
                    >
                        {isSending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </motion.div>
            </div>
            <p className="mt-1.5 px-1 text-[11px] text-muted-foreground/70">
                Press <kbd className="rounded border border-white/10 bg-white/[0.06] px-1 font-sans text-[10px]">Enter</kbd> to send,{" "}
                <kbd className="rounded border border-white/10 bg-white/[0.06] px-1 font-sans text-[10px]">Shift</kbd> +{" "}
                <kbd className="rounded border border-white/10 bg-white/[0.06] px-1 font-sans text-[10px]">Enter</kbd> for a new line
            </p>
        </div>
    )
}
