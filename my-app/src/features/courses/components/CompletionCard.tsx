"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Trophy, Sparkles, RefreshCcw, PartyPopper, ArrowRight, Award } from "lucide-react"
import { ProgressRing } from "./ProgressRing"
import { cn } from "@/lib/utils"

/** Lightweight confetti flourish — purely decorative. */
function Confetti() {
    const pieces = [
        { left: "8%", color: "#818cf8", delay: 0 },
        { left: "22%", color: "#22d3ee", delay: 0.12 },
        { left: "38%", color: "#f0abfc", delay: 0.05 },
        { left: "54%", color: "#34d399", delay: 0.18 },
        { left: "68%", color: "#fbbf24", delay: 0.09 },
        { left: "82%", color: "#8b5cf6", delay: 0.15 },
        { left: "92%", color: "#38bdf8", delay: 0.02 },
    ]
    return (
        <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
            {pieces.map((p, i) => (
                <motion.span
                    key={i}
                    initial={{ y: -16, opacity: 0, rotate: 0 }}
                    animate={{ y: 90, opacity: [0, 1, 1, 0], rotate: 220 }}
                    transition={{ duration: 1.6, delay: p.delay, ease: "easeOut" }}
                    className="absolute top-0 h-2 w-2 rounded-[2px]"
                    style={{ left: p.left, backgroundColor: p.color }}
                />
            ))}
        </div>
    )
}

export function CompletionCard({
    passed,
    score,
    nextHref,
    allDone,
    courseHref,
}: {
    passed: boolean
    score: number
    nextHref?: string
    allDone?: boolean
    courseHref: string
}) {
    if (passed) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 18 }}
                className={cn("success-card relative overflow-hidden", allDone && "congrats")}
            >
                <Confetti />
                <div className="relative flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                    <div className="flex items-center gap-4">
                        <div className="relative shrink-0">
                            <ProgressRing value={score} size={72} strokeWidth={8} />
                            <span
                                className={cn(
                                    "absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full text-white shadow-glow",
                                    allDone ? "bg-gradient-to-br from-indigo-500 to-violet-500" : "bg-gradient-to-br from-emerald-500 to-emerald-600"
                                )}
                            >
                                {allDone ? <Trophy className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                            </span>
                        </div>
                        <div className="text-center sm:text-left">
                            <h4 className="font-display flex items-center gap-1.5 text-lg font-bold text-foreground">
                                {allDone ? (
                                    <>
                                        Congratulations
                                        <PartyPopper className="h-5 w-5 text-amber-400" />
                                    </>
                                ) : (
                                    "Great job!"
                                )}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                                You scored <span className="font-semibold text-emerald-300">{score}%</span>
                                {allDone ? " — course complete!" : " and unlocked the next level."}
                            </p>
                        </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                        {allDone ? (
                            <Button asChild variant="glow" className="gap-1.5">
                                <Link href={courseHref}>
                                    <Award className="h-4 w-4" />
                                    View Certificate
                                </Link>
                            </Button>
                        ) : (
                            nextHref && (
                                <Button asChild variant="glow" className="gap-1.5">
                                    <Link href={nextHref}>
                                        Unlock Next Level
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </Button>
                            )
                        )}
                    </div>
                </div>
            </motion.div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 18 }}
            className="failure-card relative overflow-hidden"
        >
            <div className="flex flex-col items-center gap-4 p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
                <div className="flex items-center gap-4">
                    <div className="relative shrink-0">
                        <ProgressRing value={score} size={72} strokeWidth={8} />
                        <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-red-600 text-white shadow-sm">
                            <RefreshCcw className="h-4 w-4" />
                        </span>
                    </div>
                    <div className="text-center sm:text-left">
                        <h4 className="font-display text-lg font-bold text-foreground">Not quite there</h4>
                        <p className="text-sm text-muted-foreground">
                            You scored <span className="font-semibold text-rose-300">{score}%</span>. Review and try again!
                        </p>
                    </div>
                </div>
                <Button asChild variant="glass" className="shrink-0 gap-1.5">
                    <Link href={courseHref}>Review Materials</Link>
                </Button>
            </div>
        </motion.div>
    )
}
