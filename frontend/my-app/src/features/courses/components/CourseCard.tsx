"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, BarChart3, Users, GraduationCap, ArrowRight, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Course } from "../types"

const difficultyChip: Record<string, string> = {
    beginner: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    intermediate: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    advanced: "bg-rose-500/15 text-rose-300 border-rose-500/30",
}

export function CourseCard({ course, progress = 0 }: { course: Course; progress?: number }) {
    const percent = Math.max(0, Math.min(100, progress))
    const completed = percent >= 100
    const started = percent > 0
    const diffKey = course.difficulty?.toLowerCase() ?? ""
    const diffClass = difficultyChip[diffKey] ?? "bg-indigo-500/15 text-indigo-300 border-indigo-500/30"

    return (
        <motion.div
            variants={{
                hidden: { opacity: 0, y: 14 },
                show: { opacity: 1, y: 0 },
            }}
            transition={{ type: "spring", stiffness: 220, damping: 22 }}
            className="h-full"
        >
            <Link
                href={`/courses/${course.id}`}
                aria-label={`Open ${course.title}`}
                className="group block h-full rounded-[20px] focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/70 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
                <article className="card-premium hover-lift relative flex h-full flex-col overflow-hidden">
                    {/* Cover */}
                    <div className="relative aspect-[16/9] w-full overflow-hidden">
                        <img
                            alt={`${course.title} cover`}
                            src={course.thumbnail || "/images/courses/react-foundations.jpg"}
                            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.06]"
                            loading="lazy"
                        />
                        {/* gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a1f] via-[#0b0a1f]/35 to-transparent" />
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-transparent to-violet-500/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

                        {/* top chips */}
                        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
                            <span className={cn("chip border capitalize backdrop-blur-md", diffClass)}>
                                <BarChart3 className="h-3 w-3" />
                                {course.difficulty ?? "All levels"}
                            </span>
                            {completed ? (
                                <Badge className="gap-1 border-0 bg-emerald-500/90 text-white shadow-sm backdrop-blur-md">
                                    <CheckCircle2 className="h-3 w-3" />
                                    Completed
                                </Badge>
                            ) : started ? (
                                <Badge className="border border-indigo-400/40 bg-indigo-500/30 text-indigo-50 backdrop-blur-md">
                                    In progress
                                </Badge>
                            ) : null}
                        </div>

                        {/* category + title over image */}
                        <div className="absolute inset-x-0 bottom-0 p-4">
                            <span className="text-[11px] font-medium uppercase tracking-wider text-indigo-200/80">
                                {course.category}
                            </span>
                            <h3 className="font-display mt-0.5 line-clamp-2 text-lg font-semibold leading-tight text-white drop-shadow-sm">
                                {course.title}
                            </h3>
                        </div>
                    </div>

                    {/* Body */}
                    <div className="flex flex-1 flex-col gap-3 p-4">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500/15 ring-1 ring-inset ring-indigo-500/25">
                                <GraduationCap className="h-3.5 w-3.5 text-indigo-300" />
                            </span>
                            <span className="truncate font-medium text-foreground/90">{course.instructor}</span>
                        </div>

                        {/* meta chips */}
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                            {course.rating != null && (
                                <span className="flex items-center gap-1 font-medium text-amber-300">
                                    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                                    {course.rating.toFixed(1)}
                                </span>
                            )}
                            {course.duration != null && (
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3.5 w-3.5" />
                                    {course.duration}h
                                </span>
                            )}
                            {course.totalStudents != null && (
                                <span className="flex items-center gap-1">
                                    <Users className="h-3.5 w-3.5" />
                                    {course.totalStudents.toLocaleString()}
                                </span>
                            )}
                        </div>

                        {/* progress (enrolled) */}
                        {started && (
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between text-[11px]">
                                    <span className="font-medium text-muted-foreground">
                                        {completed ? "Course complete" : "Your progress"}
                                    </span>
                                    <span className={cn("font-semibold tabular-nums", completed ? "text-emerald-300" : "text-indigo-300")}>
                                        {Math.round(percent)}%
                                    </span>
                                </div>
                                <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all duration-700 ease-out",
                                            completed
                                                ? "bg-gradient-to-r from-emerald-400 to-emerald-500"
                                                : "bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400"
                                        )}
                                        style={{ width: `${percent}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* CTA */}
                        <div className="mt-auto pt-1">
                            <span
                                className={cn(
                                    "flex w-full items-center justify-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold text-white transition-all duration-300",
                                    "btn-glow group-hover:shadow-glow"
                                )}
                            >
                                {completed ? "Review course" : started ? "Continue learning" : "Start course"}
                                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
                            </span>
                        </div>
                    </div>
                </article>
            </Link>
        </motion.div>
    )
}
