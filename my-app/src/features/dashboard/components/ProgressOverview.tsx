"use client"

import { Badge } from "@/components/ui/badge"
import { ProgressRing } from "./ProgressRing"
import { motion } from "framer-motion"
import { Target, Gauge, CheckCircle2, XCircle } from "lucide-react"
import type { ProgressStats } from "../types"

export function ProgressOverview({ progress, stats }: { progress: number; stats: ProgressStats }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="card-premium h-full p-5"
        >
            <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-sm font-semibold">Quiz Performance</h3>
                <Badge className="chip border-0">{progress}% overall</Badge>
            </div>

            <div className="flex items-center gap-5">
                <div className="relative grid shrink-0 place-items-center">
                    <ProgressRing size={104} strokeWidth={11} progress={progress} />
                    <div className="absolute inset-0 grid place-items-center">
                        <div className="text-center leading-none">
                            <span className="font-display text-xl font-bold text-gradient">{progress}%</span>
                            <p className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">
                                Mastery
                            </p>
                        </div>
                    </div>
                </div>

                <div className="grid w-full grid-cols-2 gap-3">
                    <StatTile label="Attempts" icon={Target} iconClass="text-indigo-300">
                        <p className="text-sm font-semibold tabular-nums">{stats.attempts}</p>
                    </StatTile>

                    <StatTile label="Avg Score" icon={Gauge} iconClass="text-violet-300">
                        <p className="text-sm font-semibold tabular-nums">{stats.avgScore}%</p>
                    </StatTile>

                    <StatTile label="Passed" icon={CheckCircle2} iconClass="text-emerald-300">
                        <Badge className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                            {stats.passed}
                        </Badge>
                    </StatTile>

                    <StatTile label="Failed" icon={XCircle} iconClass="text-rose-300">
                        <Badge className="rounded-full border border-rose-500/25 bg-rose-500/12 px-2 py-0.5 text-xs font-semibold text-rose-300">
                            {stats.failed}
                        </Badge>
                    </StatTile>
                </div>
            </div>
        </motion.div>
    )
}

function StatTile({
    label,
    icon: Icon,
    iconClass,
    children,
}: {
    label: string
    icon: React.ComponentType<{ className?: string }>
    iconClass?: string
    children: React.ReactNode
}) {
    return (
        <div className="neu-inset flex items-center justify-between gap-2 p-3">
            <div className="min-w-0">
                <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Icon className={`h-3 w-3 ${iconClass ?? ""}`} />
                    {label}
                </p>
                <div className="mt-1">{children}</div>
            </div>
        </div>
    )
}
