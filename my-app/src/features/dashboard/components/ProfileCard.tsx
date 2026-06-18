"use client"

import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { motion } from "framer-motion"
import { BookOpen, TrendingUp, ListChecks, Sparkles } from "lucide-react"
import type { DashboardUser } from "../types"

export function ProfileCard({ user }: { user: DashboardUser }) {
    const initials = user.name
        ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
        : "U"

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="card-premium h-full p-5"
        >
            <div className="flex items-center gap-4">
                <div className="relative shrink-0">
                    <span
                        aria-hidden="true"
                        className="absolute -inset-1 rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-400 opacity-70 blur-[6px]"
                    />
                    <Avatar className="relative h-14 w-14 ring-2 ring-white/15">
                        <AvatarImage
                            src={user.avatar || "/placeholder.svg?height=56&width=56&query=student-avatar"}
                            alt={`${user.name} avatar`}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-sm font-semibold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </div>
                <div className="min-w-0">
                    <p className="chip mb-1.5">
                        <Sparkles className="h-3 w-3" aria-hidden="true" />
                        Your profile
                    </p>
                    <h2 className="font-display text-lg font-semibold text-balance leading-tight">
                        Hello, <span className="text-gradient">{user.name}</span>!
                    </h2>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3">
                <Stat label="Courses" value={user.stats.courses} icon={BookOpen} />
                <Stat label="Overall" value={`${user.stats.progress}%`} icon={TrendingUp} />
                <Stat label="Quizzes" value={user.stats.quizAttempts} icon={ListChecks} />
            </div>

            <p className="mt-4 text-sm text-muted-foreground">Ready to continue learning?</p>
        </motion.div>
    )
}

function Stat({
    label,
    value,
    icon: Icon,
}: {
    label: string
    value: number | string
    icon: React.ComponentType<{ className?: string }>
}) {
    return (
        <div className="neu-pressable group flex flex-col items-center gap-1 p-3 text-center">
            <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-indigo-500/25 to-violet-500/15 text-indigo-300 transition-colors group-hover:text-indigo-200">
                <Icon className="h-3.5 w-3.5" />
            </span>
            <p className="mt-0.5 text-base font-semibold font-display tabular-nums">{value}</p>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        </div>
    )
}
