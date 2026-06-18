"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Lock, Play, CheckCircle2, Clock, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Level } from "../types"

export function LevelCard({
    courseId,
    level,
    index,
    unlocked,
    completed = false,
    bestScore,
}: {
    courseId: string
    level: Level
    index: number
    unlocked: boolean
    completed?: boolean
    bestScore?: number | null
}) {
    const href = unlocked ? `/courses/${courseId}/${level.id}` : "#"

    const state = completed ? "completed" : unlocked ? "unlocked" : "locked"

    const iconWrap = {
        completed: "bg-gradient-to-br from-emerald-500/25 to-emerald-600/15 text-emerald-300 ring-emerald-500/30",
        unlocked: "bg-gradient-to-br from-indigo-500/25 to-violet-600/15 text-indigo-300 ring-indigo-500/30",
        locked: "bg-white/5 text-muted-foreground ring-white/10",
    }[state]

    const statusBadge = completed ? (
        <Badge className="flex items-center gap-1 border border-emerald-600/40 bg-emerald-600/20 text-emerald-300">
            <CheckCircle2 className="h-3 w-3" />
            {bestScore != null ? `${Math.round(bestScore)}%` : "Done"}
        </Badge>
    ) : unlocked ? (
        <Badge className="flex items-center gap-1 border border-indigo-600/40 bg-indigo-600/20 text-indigo-300">
            <Play className="h-3 w-3 fill-current" />
            Start
        </Badge>
    ) : (
        <Badge variant="outline" className="flex items-center gap-1 border-white/15 text-muted-foreground">
            <Lock className="h-3 w-3" />
            Locked
        </Badge>
    )

    const card = (
        <article
            className={cn(
                "group relative flex items-center gap-4 rounded-2xl p-4 transition-all duration-300",
                completed
                    ? "glass border border-emerald-600/25 hover:border-emerald-500/45 hover:shadow-glow"
                    : unlocked
                        ? "glass border border-white/8 hover:border-indigo-500/40 hover:shadow-glow"
                        : "glass-subtle cursor-not-allowed border border-white/5 opacity-60"
            )}
        >
            {/* Order / status medallion */}
            <div
                className={cn(
                    "relative flex h-12 w-12 shrink-0 items-center justify-center rounded-xl font-display text-sm font-bold ring-1 ring-inset transition-transform duration-300",
                    iconWrap,
                    unlocked && !completed && "group-hover:scale-105"
                )}
            >
                {completed ? (
                    <CheckCircle2 className="h-6 w-6" />
                ) : unlocked ? (
                    <Play className="h-5 w-5 fill-current" />
                ) : (
                    <Lock className="h-5 w-5" />
                )}
                <span className="absolute -bottom-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-background px-1 text-[10px] font-semibold text-muted-foreground ring-1 ring-white/10">
                    {level.order}
                </span>
            </div>

            {/* Body */}
            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3
                        className={cn(
                            "truncate font-semibold",
                            unlocked ? "text-foreground" : "text-muted-foreground"
                        )}
                    >
                        {level.title}
                    </h3>
                    {statusBadge}
                </div>
                <div className="mt-1 flex items-center gap-3">
                    <p className="truncate text-sm text-muted-foreground">{level.description}</p>
                    {level.duration ? (
                        <span className="flex shrink-0 items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {level.duration}m
                        </span>
                    ) : null}
                </div>
            </div>

            {/* Affordance arrow */}
            {unlocked && (
                <ArrowRight
                    className="hidden h-4 w-4 shrink-0 text-indigo-300 opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100 sm:block"
                    aria-hidden="true"
                />
            )}
        </article>
    )

    return (
        <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.06 }}
            className="h-full"
        >
            {unlocked ? (
                <Link
                    href={href}
                    aria-label={`Open level ${level.order}: ${level.title}`}
                    className="block h-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                >
                    {card}
                </Link>
            ) : (
                <div
                    aria-disabled="true"
                    title={`Level ${level.order} is locked`}
                    className="block h-full"
                >
                    {card}
                </div>
            )}
        </motion.div>
    )
}
