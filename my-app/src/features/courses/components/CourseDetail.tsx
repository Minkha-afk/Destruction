"use client"

import { Badge } from "@/components/ui/badge"
import { Star, Clock, Users, BarChart3, GraduationCap, Layers } from "lucide-react"
import { ProgressRing } from "./ProgressRing"
import { cn } from "@/lib/utils"
import type { Course } from "../types"

const difficultyColor: Record<string, string> = {
    beginner: "bg-emerald-600/20 text-emerald-300 border-emerald-600/30",
    intermediate: "bg-amber-600/20 text-amber-300 border-amber-600/30",
    advanced: "bg-red-600/20 text-red-300 border-red-600/30",
}

export function CourseDetail({ course, progressPct }: { course: Course; progressPct: number }) {
    const diffClass =
        difficultyColor[course.difficulty?.toLowerCase() ?? ""] ??
        "bg-indigo-600/20 text-indigo-300 border-indigo-600/30"

    const cover =
        course.thumbnail && course.thumbnail !== "/placeholder.svg" ? course.thumbnail : null
    const levelCount = course.levels?.length ?? 0

    const stats = [
        course.rating != null && {
            icon: Star,
            label: "Rating",
            value: course.rating.toFixed(1),
            accent: "text-amber-300",
            fill: true,
        },
        course.duration != null && {
            icon: Clock,
            label: "Duration",
            value: `${course.duration}h`,
            accent: "text-cyan-300",
        },
        course.totalStudents != null && {
            icon: Users,
            label: "Students",
            value: course.totalStudents.toLocaleString(),
            accent: "text-violet-300",
        },
        levelCount > 0 && {
            icon: Layers,
            label: "Levels",
            value: String(levelCount),
            accent: "text-indigo-300",
        },
    ].filter(Boolean) as {
        icon: typeof Star
        label: string
        value: string
        accent: string
        fill?: boolean
    }[]

    return (
        <section className="card-premium relative overflow-hidden">
            {/* Cover backdrop */}
            {cover && (
                <div className="absolute inset-0 -z-10">
                    <img
                        src={cover}
                        alt=""
                        aria-hidden="true"
                        className="h-full w-full object-cover opacity-25"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#0c0a1d] via-[#0c0a1d]/85 to-[#0c0a1d]/60" />
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/15 via-transparent to-violet-600/15" />
                </div>
            )}

            <div className="flex flex-col gap-6 p-6 md:flex-row md:items-start md:p-8">
                {/* Cover thumbnail */}
                {cover && (
                    <div className="relative shrink-0 overflow-hidden rounded-2xl ring-1 ring-white/10 shadow-glow md:w-64">
                        <img
                            src={cover}
                            alt={course.title}
                            className="aspect-video h-full w-full object-cover md:aspect-[4/3]"
                        />
                        <div className="absolute inset-0 ring-1 ring-inset ring-white/10" />
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    {/* Badges */}
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                        <Badge className={cn("border text-xs capitalize", diffClass)}>
                            <BarChart3 className="mr-1 h-3 w-3" />
                            {course.difficulty ?? "All levels"}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                            {course.category}
                        </Badge>
                        {course.tags?.map((tag) => (
                            <Badge
                                key={tag.id}
                                variant="outline"
                                className="text-xs"
                                style={{ borderColor: tag.color, color: tag.color }}
                            >
                                {tag.name}
                            </Badge>
                        ))}
                    </div>

                    {/* Title + description */}
                    <h1 className="font-display text-gradient text-2xl font-bold leading-tight text-balance md:text-4xl">
                        {course.title}
                    </h1>
                    {course.description && (
                        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                            {course.description}
                        </p>
                    )}

                    {/* Instructor */}
                    <div className="mt-4 flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500/30 to-violet-500/20 ring-1 ring-inset ring-indigo-400/30">
                            <GraduationCap className="h-4 w-4 text-indigo-200" />
                        </span>
                        <div className="leading-tight">
                            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Instructor</p>
                            <p className="text-sm font-semibold text-foreground">{course.instructor}</p>
                        </div>
                    </div>

                    {/* Stat chips */}
                    {stats.length > 0 && (
                        <div className="mt-5 flex flex-wrap gap-2.5">
                            {stats.map((s) => {
                                const Icon = s.icon
                                return (
                                    <div
                                        key={s.label}
                                        className="glass-subtle flex items-center gap-2 rounded-xl px-3 py-2"
                                    >
                                        <Icon
                                            className={cn("h-4 w-4", s.accent, s.fill && "fill-current")}
                                        />
                                        <div className="leading-none">
                                            <p className="text-sm font-semibold tabular-nums text-foreground">{s.value}</p>
                                            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Progress ring */}
                {progressPct > 0 && (
                    <div className="flex shrink-0 flex-col items-center gap-2 self-center md:self-start">
                        <div className="glass-strong rounded-2xl p-4">
                            <ProgressRing value={progressPct} size={96} strokeWidth={9} />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">Overall progress</span>
                    </div>
                )}
            </div>

            {/* Progress bar footer */}
            {progressPct > 0 && (
                <div className="border-t border-white/8 px-6 py-4 md:px-8">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                        <span className="font-medium text-muted-foreground">Course progress</span>
                        <span className="font-semibold tabular-nums text-indigo-300">{Math.round(progressPct)}%</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/8">
                        <div
                            className="h-full rounded-full bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 transition-all duration-700 ease-out"
                            style={{ width: `${Math.min(100, progressPct)}%` }}
                        />
                    </div>
                </div>
            )}
        </section>
    )
}
