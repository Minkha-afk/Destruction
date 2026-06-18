"use client"

import { motion } from "framer-motion"
import { Sparkles, Flame, Zap, FileCheck, Award, Trophy } from "lucide-react"
import type { Badge as BadgeType, Certificate } from "../types"

const badgeIcon = { sparkles: Sparkles, flame: Flame, zap: Zap }

export function AchievementsGrid({ badges, certificates }: { badges: BadgeType[]; certificates: Certificate[] }) {
    const isEmpty = badges.length === 0 && certificates.length === 0

    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
            className="card-premium h-full p-5"
        >
            <div className="mb-4 flex items-center gap-2">
                <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-amber-500/25 to-orange-500/15 text-amber-300">
                    <Trophy className="h-4 w-4" />
                </span>
                <h3 className="font-display text-sm font-semibold">Achievements</h3>
            </div>

            {isEmpty ? (
                <div className="glass-subtle flex flex-col items-center gap-2 rounded-xl px-4 py-8 text-center">
                    <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/10 text-indigo-300 animate-float">
                        <Award className="h-6 w-6" />
                    </span>
                    <p className="text-sm font-medium">No badges yet</p>
                    <p className="text-xs text-muted-foreground">Complete lessons and quizzes to earn your first achievement.</p>
                </div>
            ) : (
                <>
                    {badges.length > 0 && (
                        <div className="grid grid-cols-3 gap-3">
                            {badges.map((b, idx) => {
                                const Icon = badgeIcon[b.icon]
                                return (
                                    <motion.div
                                        key={b.id}
                                        initial={{ opacity: 0, scale: 0.85 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ duration: 0.35, delay: 0.2 + idx * 0.07, ease: "backOut" }}
                                        whileHover={{ y: -4 }}
                                        className="neu-pressable group flex flex-col items-center gap-2 p-3 text-center"
                                    >
                                        <div className="relative grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-indigo-500/25 via-violet-500/15 to-cyan-400/10 text-indigo-200 animate-pulse-glow">
                                            <Icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                                        </div>
                                        <p className="text-xs font-medium leading-tight">{b.label}</p>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}

                    {certificates.length > 0 && (
                        <>
                            <h4 className="mb-3 mt-5 flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                                <FileCheck className="h-3.5 w-3.5 text-emerald-300" />
                                Certificates
                            </h4>
                            <div className="grid grid-cols-1 gap-3">
                                {certificates.map((c, idx) => (
                                    <motion.div
                                        key={c.id}
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.4, delay: 0.3 + idx * 0.06, ease: "easeOut" }}
                                        className="glass-subtle rounded-xl p-3.5 transition-all duration-300 hover:border-emerald-400/30 hover:shadow-glow"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-gradient-to-br from-emerald-500/25 to-green-500/15 text-emerald-300">
                                                <FileCheck className="h-4 w-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="truncate text-sm font-medium">{c.title}</p>
                                                <p className="text-xs text-muted-foreground">{c.date}</p>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </>
                    )}
                </>
            )}
        </motion.div>
    )
}
