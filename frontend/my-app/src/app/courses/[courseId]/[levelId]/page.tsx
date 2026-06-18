"use client"

import { useState, Suspense } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    ProgressRing,
    QuizForm,
    CompletionCard,
    LevelContent,
    useCourse,
    useEnrolledCourseDetails,
} from "@/features/courses"
import { courseService } from "@/api/courseService"
import { Sidebar } from "@/features/dashboard"
import { useAuth } from "@/features/auth"
import { toast } from "sonner"
import { ChevronLeft, ChevronRight, Trophy, ClipboardList, Lock, Sparkles, RotateCcw } from "lucide-react"
import "@/styles/global.css"

export default function LevelDetailPage() {
    const params = useParams<{ courseId: string; levelId: string }>()
    const router = useRouter()
    const courseId = params?.courseId || ""
    const levelId = params?.levelId || ""

    const { user } = useAuth()
    const userId = user?.id?.toString() ?? ""

    const { course, loading: courseLoading } = useCourse(courseId)

    // Enrollment + progress (to know if level is unlocked/completed)
    const { data: enrolledDetails, loading: enrollLoading, refetch: refetchProgress } =
        useEnrolledCourseDetails(courseId)

    const [result, setResult] = useState<{ passed: boolean; score: number; correctAnswers: number; totalQuestions: number; requiredScore: number } | null>(null)
    const [showQuiz, setShowQuiz] = useState(false)
    const [attemptId, setAttemptId] = useState<string | null>(null)
    const [startingQuiz, setStartingQuiz] = useState(false)

    const loading = courseLoading || (!!userId && enrollLoading)

    // Prefer enrolled details (has userProgress) over catalog
    const activeCourse = enrolledDetails?.course ?? course
    const levels = activeCourse?.levels ?? []
    const level = levels.find(l => l.id === levelId) ?? null
    const catalogQuiz = level?.quizzes?.[0] ?? null

    const userProgress = level?.userProgress
    const isUnlocked = userId ? (userProgress?.isUnlocked ?? false) : true
    const isCompleted = userProgress?.isCompleted ?? false
    const levelIndex = levels.findIndex(l => l.id === levelId)
    const prevLevel = levelIndex > 0 ? levels[levelIndex - 1] : null
    const nextLevel = levelIndex < levels.length - 1 ? levels[levelIndex + 1] : null
    const progressPct = enrolledDetails?.progressSummary.percentComplete ?? 0

    // ─── Quiz handlers ──────────────────────────────────────────────────────
    const handleStartAttempt = async () => {
        if (!catalogQuiz || !userId) return
        setStartingQuiz(true)
        try {
            const response = await courseService.startQuiz(userId, courseId, levelId, catalogQuiz.id)
            if (response.attempt) {
                setAttemptId(response.attempt.id)
                setShowQuiz(true)
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Failed to start quiz"
            toast.error(message)
        } finally {
            setStartingQuiz(false)
        }
    }

    const onSubmitQuiz = async (answers: Record<string, string>) => {
        if (!attemptId) return
        const formatted = Object.entries(answers).map(([questionId, optionId]) => ({ questionId, optionId }))
        const response = await courseService.submitQuiz(attemptId, formatted)
        const { results } = response
        setResult({
            score: results.score,
            passed: results.passed,
            correctAnswers: results.correctAnswers,
            totalQuestions: results.totalQuestions,
            requiredScore: results.requiredScore,
        })
        setShowQuiz(false)
        if (results.passed) {
            toast.success("Level passed! 🎉")
            await refetchProgress()
        } else {
            toast.error(`Score: ${Math.round(results.score)}% — need ${results.requiredScore}% to pass`)
        }
    }

    const handleRetry = () => {
        setResult(null)
        setAttemptId(null)
        setShowQuiz(false)
    }

    // ─── Loading ────────────────────────────────────────────────────────────
    if (loading) {
        return (
            <PageShell>
                <LevelSkeleton />
            </PageShell>
        )
    }

    if (!activeCourse || !level) {
        return (
            <PageShell>
                <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-auto mt-10 flex max-w-md flex-col items-center gap-4 rounded-2xl border border-rose-500/25 bg-rose-500/[0.06] px-8 py-16 text-center backdrop-blur-md"
                >
                    <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 ring-1 ring-inset ring-rose-500/30">
                        <ClipboardList className="h-7 w-7 text-rose-300" />
                    </span>
                    <div className="space-y-1">
                        <h2 className="font-display text-lg font-semibold">Level not found</h2>
                        <p className="text-sm text-muted-foreground">We couldn&apos;t find this level.</p>
                    </div>
                    <Button variant="glow" onClick={() => router.push(`/courses/${courseId}`)} className="gap-1.5">
                        <ChevronLeft className="h-4 w-4" />
                        Back to Course
                    </Button>
                </motion.div>
            </PageShell>
        )
    }

    return (
        <PageShell>
            <div className="mx-auto max-w-4xl space-y-6">

                {/* Navigation bar */}
                <div className="flex items-center justify-between gap-3">
                    <Button variant="ghost" asChild className="min-w-0 gap-1 text-muted-foreground hover:text-foreground">
                        <Link href={`/courses/${courseId}`}>
                            <ChevronLeft className="h-4 w-4 shrink-0" />
                            <span className="truncate">{activeCourse.title}</span>
                        </Link>
                    </Button>
                    <div className="flex shrink-0 items-center gap-2">
                        {isCompleted && (
                            <Badge className="gap-1 border border-emerald-600/40 bg-emerald-600/20 text-emerald-300">
                                <Trophy className="h-3 w-3" />
                                Completed{userProgress?.bestScore != null ? ` · ${Math.round(userProgress.bestScore)}%` : ""}
                            </Badge>
                        )}
                        {prevLevel && (
                            <Button variant="glass" size="sm" asChild className="gap-1 text-xs">
                                <Link href={`/courses/${courseId}/${prevLevel.id}`}>
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                    Prev
                                </Link>
                            </Button>
                        )}
                        {nextLevel && (
                            <Button variant="glass" size="sm" asChild className="gap-1 text-xs">
                                <Link href={`/courses/${courseId}/${nextLevel.id}`}>
                                    Next
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </Link>
                            </Button>
                        )}
                    </div>
                </div>

                {/* Level header */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
                    <section className="card-premium relative overflow-hidden">
                        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-indigo-600/10 via-transparent to-violet-600/10" />
                        <div className="flex items-start justify-between gap-4 p-6">
                            <div className="min-w-0">
                                <span className="chip mb-2">
                                    <Sparkles className="h-3 w-3" />
                                    Level {level.order} of {levels.length}
                                </span>
                                <h1 className="font-display text-2xl font-bold text-balance md:text-3xl">{level.title}</h1>
                                {level.description && (
                                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">{level.description}</p>
                                )}
                            </div>
                            {progressPct > 0 && (
                                <div className="flex shrink-0 flex-col items-center gap-1">
                                    <div className="glass-strong rounded-2xl p-3">
                                        <ProgressRing value={progressPct} size={64} strokeWidth={8} />
                                    </div>
                                    <span className="text-[11px] text-muted-foreground">Course</span>
                                </div>
                            )}
                        </div>
                    </section>
                </motion.div>

                {/* Learning content */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
                    <LevelContent
                        content={level.content}
                        videoUrl={level.videoUrl}
                        duration={level.duration}
                    />
                </motion.div>

                {/* Quiz section */}
                <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }}>
                    {!isUnlocked ? (
                        <section className="card-premium">
                            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-inset ring-white/10">
                                    <Lock className="h-7 w-7 text-muted-foreground" />
                                </span>
                                <p className="text-sm text-muted-foreground">Complete the previous level to unlock this quiz.</p>
                            </div>
                        </section>
                    ) : !catalogQuiz ? (
                        <section className="card-premium">
                            <div className="flex flex-col items-center gap-3 px-6 py-12 text-center">
                                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-500/10 ring-1 ring-inset ring-indigo-500/20">
                                    <ClipboardList className="h-7 w-7 text-indigo-300/70" />
                                </span>
                                <p className="text-sm text-muted-foreground">No quiz for this level yet.</p>
                            </div>
                        </section>
                    ) : (
                        <section className="card-premium overflow-hidden">
                            <div className="border-b border-white/8 p-5">
                                <div className="flex flex-wrap items-center justify-between gap-2">
                                    <h2 className="font-display flex items-center gap-2 text-base font-semibold">
                                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500/25 to-indigo-500/15 ring-1 ring-inset ring-violet-500/30">
                                            <ClipboardList className="h-4 w-4 text-violet-300" />
                                        </span>
                                        {catalogQuiz.title}
                                    </h2>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span>{catalogQuiz.questions.length} questions</span>
                                        {catalogQuiz.timeLimit && <span>· {catalogQuiz.timeLimit} min</span>}
                                        <Badge variant="secondary" className="text-xs">Pass: {catalogQuiz.passingPercent}%</Badge>
                                    </div>
                                </div>
                                {catalogQuiz.description && (
                                    <p className="mt-2 text-sm text-muted-foreground">{catalogQuiz.description}</p>
                                )}
                            </div>

                            <div className="space-y-4 p-5">
                                {/* Previous attempt info */}
                                {userProgress?.quizAttempts != null && userProgress.quizAttempts > 0 && !result && (
                                    <div className="flex items-center gap-2.5 rounded-xl border border-white/8 bg-white/[0.03] p-3 text-sm text-muted-foreground">
                                        {userProgress.passed
                                            ? <Trophy className="h-4 w-4 shrink-0 text-emerald-400" />
                                            : <ClipboardList className="h-4 w-4 shrink-0" />}
                                        <span>
                                            {userProgress.quizAttempts} attempt{userProgress.quizAttempts > 1 ? "s" : ""} —
                                            best: <span className="font-semibold text-foreground">{userProgress.bestScore != null ? `${Math.round(userProgress.bestScore)}%` : "—"}</span>
                                        </span>
                                    </div>
                                )}

                                {/* Start / Retry button */}
                                {!showQuiz && !result && (
                                    <Button
                                        onClick={handleStartAttempt}
                                        disabled={startingQuiz || !userId}
                                        variant="glow"
                                        size="lg"
                                        className="w-full gap-1.5"
                                    >
                                        {startingQuiz ? (
                                            "Starting…"
                                        ) : !userId ? (
                                            "Log in to take quiz"
                                        ) : userProgress?.quizAttempts ? (
                                            <>
                                                <RotateCcw className="h-4 w-4" />
                                                Retry Quiz
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="h-4 w-4" />
                                                Start Quiz
                                            </>
                                        )}
                                    </Button>
                                )}

                                {/* Active quiz form */}
                                <AnimatePresence mode="wait">
                                    {showQuiz && (
                                        <motion.div
                                            key="quiz-form"
                                            initial={{ opacity: 0, y: 12 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -12 }}
                                        >
                                            <QuizForm quiz={catalogQuiz} onSubmitResult={onSubmitQuiz} />
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Result card */}
                                <AnimatePresence mode="popLayout">
                                    {result && (
                                        <motion.div
                                            key={result.passed ? "pass" : "fail"}
                                            initial={{ opacity: 0, scale: 0.97 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.97 }}
                                            className="space-y-3"
                                        >
                                            <CompletionCard
                                                passed={result.passed}
                                                score={result.score}
                                                courseHref={`/courses/${courseId}`}
                                                nextHref={result.passed && nextLevel ? `/courses/${courseId}/${nextLevel.id}` : undefined}
                                                allDone={result.passed && !nextLevel}
                                            />
                                            <p className="text-center text-xs text-muted-foreground">
                                                {result.correctAnswers} / {result.totalQuestions} correct · Required {result.requiredScore}% to pass
                                            </p>
                                            {!result.passed && (
                                                <Button variant="glass" onClick={handleRetry} className="w-full gap-1.5">
                                                    <RotateCcw className="h-4 w-4" />
                                                    Try Again
                                                </Button>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </section>
                    )}
                </motion.div>

                {/* Bottom prev/next */}
                <div className="flex items-center justify-between gap-3 pb-8">
                    {prevLevel ? (
                        <Button variant="glass" asChild className="min-w-0 gap-1">
                            <Link href={`/courses/${courseId}/${prevLevel.id}`}>
                                <ChevronLeft className="h-4 w-4 shrink-0" />
                                <span className="truncate">{prevLevel.title}</span>
                            </Link>
                        </Button>
                    ) : <div />}
                    {nextLevel && isCompleted ? (
                        <Button asChild variant="glow" className="min-w-0 gap-1">
                            <Link href={`/courses/${courseId}/${nextLevel.id}`}>
                                <span className="truncate">{nextLevel.title}</span>
                                <ChevronRight className="h-4 w-4 shrink-0" />
                            </Link>
                        </Button>
                    ) : <div />}
                </div>
            </div>
        </PageShell>
    )
}

function LevelSkeleton() {
    return (
        <div className="mx-auto max-w-4xl space-y-6" aria-busy="true" aria-label="Loading level">
            <div className="flex items-center justify-between">
                <div className="shimmer h-9 w-48 rounded-lg" />
                <div className="shimmer h-8 w-28 rounded-lg" />
            </div>
            <div className="shimmer h-32 w-full rounded-2xl" />
            <div className="card-premium overflow-hidden">
                <div className="shimmer m-5 h-6 w-40 rounded" />
                <div className="m-5 mt-0 space-y-3">
                    <div className="shimmer aspect-video w-full rounded-2xl" />
                    <div className="shimmer h-4 w-full rounded" />
                    <div className="shimmer h-4 w-5/6 rounded" />
                    <div className="shimmer h-4 w-2/3 rounded" />
                </div>
            </div>
            <div className="shimmer h-40 w-full rounded-2xl" />
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
