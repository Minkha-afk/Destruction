"use client"

import { Badge } from "@/components/ui/badge"
import { motion } from "framer-motion"
import { Timer, CheckCircle2, GraduationCap, Activity } from "lucide-react"
import type { ActivityItem } from "../types"

const iconFor = (type: ActivityItem["type"]) => {
    switch (type) {
        case "quiz":
            return Timer
        case "level":
            return CheckCircle2
        case "enroll":
            return GraduationCap
    }
}

const accentFor = (type: ActivityItem["type"]) => {
    switch (type) {
        case "quiz":
            return "from-violet-500/25 to-fuchsia-500/15 text-violet-300"
        case "level":
            return "from-emerald-500/25 to-green-500/15 text-emerald-300"
        case "enroll":
            return "from-indigo-500/25 to-blue-500/15 text-indigo-300"
    }
}

export function RecentActivity({ items }: { items: ActivityItem[] }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="card-premium h-full p-5"
        >
            <div className="mb-4 flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-indigo-500/25 to-violet-500/15 text-indigo-300">
                    <Activity className="h-4 w-4" />
                </span>
                <h3 className="font-display text-sm font-semibold">Recent Activity</h3>
            </div>

            <div className="timeline relative">
                <ul className="flex flex-col gap-4">
                    {items.map((item, idx) => {
                        const Icon = iconFor(item.type)
                        const isPassed = "status" in item && item.status === "Passed"
                        return (
                            <motion.li
                                key={idx}
                                className="timeline-item"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.4, delay: 0.12 + idx * 0.06, ease: "easeOut" }}
                            >
                                <div className="glass-subtle rounded-xl p-4 transition-all duration-300 hover:border-indigo-400/30 hover:shadow-glow">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br ${accentFor(
                                                item.type,
                                            )}`}
                                        >
                                            <Icon className="h-4 w-4" />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-pretty">{item.title}</p>
                                            <p className="text-xs text-muted-foreground">{item.timestamp}</p>
                                        </div>

                                        {"score" in item && (
                                            <div className="flex shrink-0 items-center gap-2">
                                                <Badge
                                                    className={
                                                        isPassed
                                                            ? "rounded-full border border-emerald-500/30 bg-emerald-500/15 text-xs font-semibold text-emerald-300"
                                                            : "rounded-full border border-rose-500/30 bg-rose-500/12 text-xs font-semibold text-rose-300"
                                                    }
                                                >
                                                    {item.status}
                                                </Badge>
                                                <span
                                                    className={`text-sm font-semibold tabular-nums ${
                                                        isPassed ? "text-emerald-300" : "text-rose-300"
                                                    }`}
                                                >
                                                    {item.score}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </motion.li>
                        )
                    })}
                </ul>
            </div>
        </motion.div>
    )
}
