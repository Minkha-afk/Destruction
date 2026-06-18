"use client"

import { Suspense, useState } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    BookOpen,
    RotateCcw,
    Trophy,
    ChevronLeft,
    PlayCircle,
    Sparkles,
    CheckCircle2,
    Layers,
    GraduationCap,
} from "lucide-react"
import {
    CourseDetail,
    LevelCard,
    useCourse,
    useEnrolledCourseDetails,
} from "@/features/courses"
import { courseService } from "@/api/courseService"
import { Sidebar } from "@/features/dashboard"
import "@/styles/global.css"
import { useAuth } from "@/features/auth"
import { toast } from "sonner"

export default function CourseDetailPage() {
    const params = useParams<{ courseId: string }>()
    const router = useRouter()
    const courseId = params?.courseId || ""

    const { user } = useAuth()
    const userId = user?.id?.toString() ?? ""

    // Catalog data — always available
    const { course: catalogCourse, loading: catalogLoading, error: catalogError } = useCourse(courseId)

    // Enrollment + per-level progress — only available when enrolled
    const { data: enrolledDetails, loading: enrollLoading, notEnrolled, refetch: refetchEnrollment } =
        useEnrolledCourseDetails(courseId)

    const [enrolling, setEnrolling] = useState(false)

    const loading = catalogLoading || (!!userId && enrollLoading)
    const isEnrolled = !!enrolledDetails && !notEnrolled

    // Prefer enrolled course details (levels carry progress) over plain catalog
    const course = enrolledDetails?.course ?? catalogCourse
    const levels = course?.levels ?? []
    const progressPct = enrolledDetails?.progressSummary.percentComplete ?? 0
    const isCompleted = enrolledDetails?.progressSummary.isCompleted ?? false
    const completedCount = enrolledDetails?.progressSummary.completedLevels ?? 0
    const totalCount = enrolledDetails?.progressSummary.totalLevels ?? levels.length

    const handleEnroll = async () => {
        if (!userId) { toast.error("Please log in first"); router.push("/auth"); return }
        try {
            setEnrolling(true)
            await courseService.enroll(userId, courseId)
            toast.success("Enrolled! Starting Level 1…")
            await refetchEnrollment()
        } catch (err: any) {
            toast.error(err.message || "Enrollment failed")
        } finally {
            setEnrolling(false)
        }
    }

    const handleResume = () => {
        const next =
            levels.find(l => l.userProgress?.isUnlocked && !l.userProgress?.isCompleted) ??
            levels.find(l => l.userProgress?.isUnlocked) ??
            levels[0]
        if (next) router.push(`/courses/${courseId}/${next.id}`)
    }

    const handleReset = async () => {
        if (!userId) return
        if (!confirm("Reset all progress for this course?")) return
        try {
            await courseService.resetProgress(userId, courseId)
            toast.success("Progress reset!")
            await refetchEnrollment()
        } catch (err: any) {
            toast.error(err.message || "Reset failed")
        }
    }

    // ─── Loading ────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <PageShell>
                <CourseDetailSkeleton />
            </PageShell>
        )
    }

    if ((catalogError && !course) || !course) {
        return (
            <PageShell>
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-auto mt-10 flex max-w-md flex-col items-center gap-4 rounded-2xl border border-rose-500/25 bg-rose-500/[0.06] px-8 py-16 text-center backdrop-blur-md"
                >
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 ring-1 ring-inset ring-rose-500/30">
                        <BookOpen className="h-7 w-7 text-rose-300" />
                    </span>
                    <div className="space-y-1">
                        <h2 className="font-display text-lg font-semibold">Course not found</h2>
                        <p className="text-sm text-muted-foreground">{catalogError || "We couldn't find this course."}</p>
                    </div>
                    <Button variant="glow" onClick={() => router.push("/courses")} className="gap-1.5">
                        <ChevronLeft className="h-4 w-4" />
                        Back to Courses
                    </Button>
                </motion.div>
            </PageShell>
        )
    }

    const stats = [
        { icon: CheckCircle2, label: "Completed", value: `${completedCount} / ${totalCount}`, sub: "levels", accent: "text-emerald-300" },
        { icon: Layers, label: "Progress", value: `${Math.round(progressPct)}%`, sub: "overall", accent: "text-indigo-300" },
        { icon: Trophy, label: "Status", value: isCompleted ? "Done 🎉" : "In Progress", sub: "", accent: "text-amber-300" },
    ]

    return (
        <PageShell>
            <div className="mx-auto max-w-5xl space-y-6">

                {/* Breadcrumb + status */}
                <div className="flex items-center justify-between">
                    <Button variant="ghost" asChild className="gap-1 text-muted-foreground hover:text-foreground">
                        <Link href="/courses">
                            <ChevronLeft className="h-4 w-4" />
                            All Courses
                        </Link>
                    </Button>
                    <div className="flex items-center gap-2">
                        {isCompleted && (
                            <Badge className="gap-1 border border-emerald-600/40 bg-emerald-600/20 text-emerald-300">
                                <Trophy className="h-3 w-3" />
                                Completed
                            </Badge>
                        )}
                        {isEnrolled && !isCompleted && (
                            <Badge className="border border-indigo-600/40 bg-indigo-600/20 text-indigo-300">Active</Badge>
                        )}
                        {!isEnrolled && <Badge variant="secondary">Not Enrolled</Badge>}
                    </div>
                </div>

                {/* Course header card */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                    <CourseDetail course={course} progressPct={progressPct} />
                </motion.div>

                {/* Primary action bar */}
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.06 }}
                    className="glass flex flex-col gap-3 rounded-2xl border border-white/8 p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/25 to-violet-500/15 ring-1 ring-inset ring-indigo-500/30">
                            <GraduationCap className="h-5 w-5 text-indigo-300" />
                        </span>
                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                {isCompleted
                                    ? "You've completed this course"
                                    : isEnrolled
                                        ? "Pick up where you left off"
                                        : "Ready to start learning?"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {isEnrolled
                                    ? `${completedCount} of ${totalCount} levels complete`
                                    : `${levels.length} level${levels.length !== 1 ? "s" : ""} · self-paced`}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isEnrolled ? (
                            <Button onClick={handleResume} variant="glow" className="gap-1.5">
                                <PlayCircle className="h-4 w-4" />
                                {isCompleted ? "Review course" : "Continue"}
                            </Button>
                        ) : (
                            <Button
                                onClick={handleEnroll}
                                disabled={enrolling}
                                variant="glow"
                                className="gap-1.5"
                            >
                                <Sparkles className="h-4 w-4" />
                                {enrolling ? "Enrolling…" : "Enroll & Start"}
                            </Button>
                        )}
                    </div>
                </motion.div>

                {/* Stat chips (enrolled only) */}
                {isEnrolled && (
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-3 gap-4"
                    >
                        {stats.map((stat) => {
                            const Icon = stat.icon
                            return (
                                <div key={stat.label} className="card-premium flex flex-col items-center gap-1 p-4 text-center">
                                    <Icon className={`mb-1 h-5 w-5 ${stat.accent}`} />
                                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{stat.label}</p>
                                    <p className="font-display text-lg font-semibold">{stat.value}</p>
                                    {stat.sub && <p className="text-[11px] text-muted-foreground">{stat.sub}</p>}
                                </div>
                            )
                        })}
                    </motion.div>
                )}

                {/* Levels */}
                <motion.section
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <h2 className="font-display flex items-center gap-2 text-xl font-semibold">
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500/25 to-violet-500/15 ring-1 ring-inset ring-indigo-500/30">
                                <BookOpen className="h-4 w-4 text-indigo-300" />
                            </span>
                            Levels
                            <span className="text-sm font-normal text-muted-foreground">({levels.length})</span>
                        </h2>
                        <div className="flex gap-2">
                            {isEnrolled && (
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={handleReset}
                                    className="gap-1 text-xs text-muted-foreground hover:text-rose-400"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    Reset
                                </Button>
                            )}
                            <Button
                                onClick={handleEnroll}
                                disabled={enrolling || isEnrolled}
                                variant={isEnrolled ? "glass" : "glow"}
                                size="sm"
                                className="gap-1.5 disabled:opacity-60"
                            >
                                {enrolling
                                    ? "Enrolling…"
                                    : isEnrolled
                                        ? "Enrolled"
                                        : "Enroll & Start"}
                            </Button>
                        </div>
                    </div>

                    {levels.length === 0 ? (
                        <div className="glass flex flex-col items-center gap-2 rounded-2xl border border-white/8 py-12 text-center">
                            <Layers className="h-8 w-8 text-muted-foreground/50" />
                            <p className="text-sm text-muted-foreground">No levels found.</p>
                        </div>
                    ) : (
                        <div className="relative">
                            {/* Connecting timeline */}
                            <div
                                aria-hidden="true"
                                className="pointer-events-none absolute bottom-6 left-[39px] top-6 hidden w-px bg-gradient-to-b from-indigo-500/30 via-violet-500/20 to-transparent md:block"
                            />
                            <div className="grid grid-cols-1 gap-3">
                                {levels.map((level, idx) => {
                                    const up = level.userProgress
                                    const unlocked = isEnrolled ? (up?.isUnlocked ?? false) : idx === 0
                                    const completed = up?.isCompleted ?? false
                                    return (
                                        <LevelCard
                                            key={level.id}
                                            courseId={courseId}
                                            level={level}
                                            index={idx}
                                            unlocked={unlocked}
                                            completed={completed}
                                            bestScore={up?.bestScore}
                                        />
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </motion.section>
            </div>
        </PageShell>
    )
}

function CourseDetailSkeleton() {
    return (
        <div className="mx-auto max-w-5xl space-y-6" aria-busy="true" aria-label="Loading course">
            <div className="shimmer h-9 w-40 rounded-lg" />
            <div className="card-premium overflow-hidden">
                <div className="flex flex-col gap-6 p-6 md:flex-row md:p-8">
                    <div className="shimmer aspect-video w-full rounded-2xl md:w-64" />
                    <div className="flex-1 space-y-3">
                        <div className="flex gap-2">
                            <div className="shimmer h-6 w-24 rounded-full" />
                            <div className="shimmer h-6 w-20 rounded-full" />
                        </div>
                        <div className="shimmer h-9 w-3/4 rounded" />
                        <div className="shimmer h-4 w-full rounded" />
                        <div className="shimmer h-4 w-2/3 rounded" />
                        <div className="flex gap-2 pt-2">
                            <div className="shimmer h-12 w-24 rounded-xl" />
                            <div className="shimmer h-12 w-24 rounded-xl" />
                            <div className="shimmer h-12 w-24 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="shimmer h-20 w-full rounded-2xl" />
                ))}
            </div>
        </div>
    )
}

function PageShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="aurora-bg grid-overlay min-h-screen overflow-x-hidden bg-background text-foreground">
            <aside aria-label="Sidebar navigation" className="fixed left-0 top-0 z-10 h-full w-72 p-4 sidebar-glass">
                <Suspense>
                    <Sidebar />
                </Suspense>
            </aside>
            <main className="ml-72 min-h-screen p-6 md:p-8">
                {children}
            </main>
        </div>
    )
}
