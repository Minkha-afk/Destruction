"use client"

import { Suspense, useId, useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/features/dashboard"
import { useAuth } from "@/features/auth"
import { courseService } from "@/api/courseService"
import { cn } from "@/lib/utils"
import {
  ArrowLeft,
  Trophy,
  XCircle,
  Clock,
  CheckCircle2,
  CircleX,
  HelpCircle,
  Target,
  ListChecks,
  BookOpen,
  RotateCcw,
} from "lucide-react"
import "@/styles/global.css"

interface AttemptResult {
  id: string
  quizId: string
  courseId: string
  levelId: string
  userId: string
  score: number | null
  passed: boolean
  status: string
  startedAt: string
  completedAt: string | null
  answers: Array<{
    id: string
    questionId: string
    optionId: string
    isCorrect: boolean
  }>
}

interface QuizInfo {
  id: string
  title: string
  description?: string
  questions?: Array<{
    id: string
    questionText: string
    options: Array<{
      id: string
      optionText: string
    }>
  }>
}

function fmt(iso?: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

/* ── Duration between two ISO timestamps, humanized ──────────────── */
function duration(startIso?: string | null, endIso?: string | null) {
  if (!startIso || !endIso) return "—"
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime()
  if (!Number.isFinite(ms) || ms < 0) return "—"
  const totalSec = Math.round(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  if (m === 0) return `${s}s`
  return `${m}m ${s}s`
}

/* ── Hero score ring ─────────────────────────────────────────────── */
function ScoreRing({
  score,
  passed,
  size = 132,
  strokeWidth = 11,
}: {
  score: number | null
  passed: boolean
  size?: number
  strokeWidth?: number
}) {
  const gradId = useId()
  const safe = Math.max(0, Math.min(100, score ?? 0))
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - safe / 100)
  const from = passed ? "#10b981" : "#f43f5e"
  const to = passed ? "#34d399" : "#fb7185"

  return (
    <div
      className="relative shrink-0"
      style={{ width: size, height: size }}
      role="img"
      aria-label={score == null ? "No score recorded" : `Score ${Math.round(safe)} percent`}
    >
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className={cn(
          passed
            ? "drop-shadow-[0_0_18px_rgba(16,185,129,0.35)]"
            : "drop-shadow-[0_0_18px_rgba(244,63,94,0.3)]",
        )}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={from} />
            <stop offset="100%" stopColor={to} />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-muted-foreground/15"
        />
        {score != null && (
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={`url(#${gradId})`}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span
          className={cn(
            "font-display text-3xl font-bold tabular-nums leading-none",
            score == null ? "text-muted-foreground" : passed ? "text-emerald-300" : "text-rose-300",
          )}
        >
          {score == null ? "—" : `${Math.round(safe)}%`}
        </span>
        <span className="mt-1 text-[0.62rem] font-medium uppercase tracking-wider text-muted-foreground">
          Score
        </span>
      </div>
    </div>
  )
}

/* ── Small metric tile for the results header ────────────────────── */
function MetricTile({
  icon: Icon,
  label,
  value,
  tint = "text-indigo-300",
}: {
  icon: typeof Target
  label: string
  value: React.ReactNode
  tint?: string
}) {
  return (
    <div className="neu-inset rounded-xl px-4 py-3">
      <div className="flex items-center gap-1.5 text-[0.66rem] font-medium uppercase tracking-wider text-muted-foreground">
        <Icon className={cn("h-3.5 w-3.5", tint)} />
        {label}
      </div>
      <p className="mt-1.5 font-display text-lg font-bold tabular-nums">{value}</p>
    </div>
  )
}

/* ── Skeleton while results load ─────────────────────────────────── */
function ResultsSkeleton() {
  return (
    <div className="space-y-6">
      <Card className="card-premium">
        <CardContent className="flex flex-col gap-6 p-6 sm:flex-row sm:items-center">
          <div className="shimmer h-[132px] w-[132px] rounded-full" />
          <div className="flex-1 space-y-3">
            <div className="shimmer h-6 w-2/3 rounded-md" />
            <div className="shimmer h-4 w-1/2 rounded-md" />
            <div className="grid grid-cols-2 gap-3 pt-2 sm:grid-cols-3">
              <div className="shimmer h-14 rounded-xl" />
              <div className="shimmer h-14 rounded-xl" />
              <div className="shimmer h-14 rounded-xl" />
            </div>
          </div>
        </CardContent>
      </Card>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="shimmer h-28 w-full rounded-2xl" />
        ))}
      </div>
    </div>
  )
}

export default function QuizReviewPage() {
  const params = useParams<{ attemptId: string }>()
  const attemptId = params?.attemptId || ""

  const [attempt, setAttempt] = useState<AttemptResult | null>(null)
  const [quiz, setQuiz] = useState<QuizInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!attemptId) return
    ;(async () => {
      try {
        setLoading(true)
        const data = await courseService.getQuizResults(attemptId)
        setAttempt(data.attempt)
        setQuiz(data.quiz)
        setError(null)
      } catch (e: any) {
        setError(e.message || "Failed to load quiz results")
      } finally {
        setLoading(false)
      }
    })()
  }, [attemptId])

  const correctCount = attempt?.answers?.filter((a) => a.isCorrect).length ?? 0
  const totalCount = attempt?.answers?.length ?? 0

  // Build a lookup: questionId -> user's answer
  const answerMap = new Map<string, { optionId: string; isCorrect: boolean }>()
  attempt?.answers?.forEach((a) => answerMap.set(a.questionId, a))

  return (
    <div className="aurora-bg grid-overlay min-h-screen bg-background text-foreground overflow-x-hidden">
      <aside
        aria-label="Sidebar navigation"
        className="fixed left-0 top-0 h-full w-72 p-4 sidebar-glass z-10"
      >
        <Suspense>
          <Sidebar />
        </Suspense>
      </aside>

      <main className="ml-72 p-8 min-h-screen scrollbar-thin">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Back button */}
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-1 text-muted-foreground hover:text-foreground"
          >
            <Link href="/quiz-history">
              <ArrowLeft className="h-4 w-4" />
              Back to Quiz History
            </Link>
          </Button>

          {loading ? (
            <ResultsSkeleton />
          ) : error ? (
            <Card className="card-premium border-rose-500/20">
              <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-2xl border border-rose-500/25 bg-rose-500/10">
                  <XCircle className="h-7 w-7 text-rose-300" />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold">Couldn’t load results</p>
                  <p className="mt-1 text-sm text-rose-300/90">{error}</p>
                </div>
                <Button variant="glow" asChild>
                  <Link href="/quiz-history">Back to History</Link>
                </Button>
              </CardContent>
            </Card>
          ) : !attempt ? (
            <Card className="card-premium">
              <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-2xl neu">
                  <HelpCircle className="h-7 w-7 text-muted-foreground" />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold">Attempt not found</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    This quiz attempt may have been removed.
                  </p>
                </div>
                <Button variant="glass" asChild>
                  <Link href="/quiz-history">Back to History</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Results header */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              >
                <Card
                  className={cn(
                    "overflow-hidden border-0 p-0",
                    attempt.passed ? "success-card congrats" : "failure-card",
                  )}
                >
                  <CardContent className="p-6">
                    {/* Pass / fail banner */}
                    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "grid h-11 w-11 place-items-center rounded-2xl",
                            attempt.passed
                              ? "bg-emerald-500/15 text-emerald-300"
                              : "bg-rose-500/15 text-rose-300",
                          )}
                        >
                          {attempt.passed ? (
                            <Trophy className="h-6 w-6" />
                          ) : (
                            <XCircle className="h-6 w-6" />
                          )}
                        </div>
                        <div>
                          <h1 className="font-display text-xl font-bold leading-tight">
                            {quiz?.title || "Quiz Review"}
                          </h1>
                          {quiz?.description && (
                            <p className="mt-0.5 line-clamp-1 text-sm text-muted-foreground">
                              {quiz.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          "gap-1.5 px-3 py-1 text-sm font-semibold",
                          attempt.passed
                            ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                            : "border-rose-500/40 bg-rose-500/15 text-rose-200",
                        )}
                      >
                        {attempt.passed ? (
                          <CheckCircle2 className="h-4 w-4" />
                        ) : (
                          <CircleX className="h-4 w-4" />
                        )}
                        {attempt.passed ? "Passed" : "Failed"}
                      </Badge>
                    </div>

                    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center">
                      <ScoreRing score={attempt.score} passed={attempt.passed} />

                      <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3">
                        <MetricTile
                          icon={ListChecks}
                          label="Correct"
                          value={`${correctCount}/${totalCount}`}
                          tint="text-emerald-300"
                        />
                        <MetricTile
                          icon={Clock}
                          label="Time Taken"
                          value={duration(attempt.startedAt, attempt.completedAt)}
                          tint="text-cyan-300"
                        />
                        <MetricTile
                          icon={Target}
                          label="Result"
                          value={attempt.passed ? "Pass" : "Fail"}
                          tint={attempt.passed ? "text-emerald-300" : "text-rose-300"}
                        />
                        <div className="neu-inset col-span-2 rounded-xl px-4 py-3 sm:col-span-3">
                          <div className="flex items-center gap-1.5 text-[0.66rem] font-medium uppercase tracking-wider text-muted-foreground">
                            <Clock className="h-3.5 w-3.5 text-indigo-300" />
                            Completed
                          </div>
                          <p className="mt-1.5 text-sm">{fmt(attempt.completedAt)}</p>
                        </div>
                      </div>
                    </div>

                    {attempt.courseId && (
                      <div className="mt-6 flex flex-wrap gap-2 border-t border-white/10 pt-5">
                        <Button variant="glow" size="sm" asChild className="gap-1.5">
                          <Link href={`/courses/${attempt.courseId}`}>
                            <BookOpen className="h-4 w-4" />
                            View Course
                          </Link>
                        </Button>
                        {attempt.levelId && (
                          <Button variant="glass" size="sm" asChild className="gap-1.5">
                            <Link href={`/courses/${attempt.courseId}/${attempt.levelId}`}>
                              <RotateCcw className="h-4 w-4" />
                              Retry Level
                            </Link>
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              {/* Question-by-question review */}
              {quiz?.questions && quiz.questions.length > 0 && (
                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.5 }}
                  className="space-y-3"
                >
                  <div className="flex items-center gap-2">
                    <h2 className="font-display text-lg font-bold">Question Review</h2>
                    <span className="chip">{quiz.questions.length} questions</span>
                  </div>

                  {quiz.questions.map((q, idx) => {
                    const userAnswer = answerMap.get(q.id)
                    const isCorrect = userAnswer?.isCorrect ?? false
                    const answeredOptionId = userAnswer?.optionId

                    return (
                      <motion.div
                        key={q.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(0.12 + idx * 0.05, 0.5) }}
                      >
                        <Card
                          className={cn(
                            "card-premium overflow-hidden border-l-[3px] p-0",
                            !userAnswer
                              ? "border-l-muted-foreground/40"
                              : isCorrect
                              ? "border-l-emerald-500"
                              : "border-l-rose-500",
                          )}
                        >
                          <CardContent className="space-y-3 p-5">
                            <div className="flex items-start gap-3">
                              <span
                                className={cn(
                                  "grid h-7 w-7 shrink-0 place-items-center rounded-lg text-xs font-bold tabular-nums",
                                  !userAnswer
                                    ? "bg-muted-foreground/10 text-muted-foreground"
                                    : isCorrect
                                    ? "bg-emerald-500/15 text-emerald-300"
                                    : "bg-rose-500/15 text-rose-300",
                                )}
                              >
                                {idx + 1}
                              </span>
                              <p className="flex-1 pt-0.5 text-sm font-medium leading-snug">
                                {q.questionText}
                              </p>
                              {!userAnswer ? (
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-muted-foreground/25 bg-muted-foreground/10 px-2 py-0.5 text-[0.65rem] font-semibold text-muted-foreground">
                                  <HelpCircle className="h-3 w-3" />
                                  Skipped
                                </span>
                              ) : isCorrect ? (
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[0.65rem] font-semibold text-emerald-300">
                                  <CheckCircle2 className="h-3 w-3" />
                                  Correct
                                </span>
                              ) : (
                                <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-rose-500/30 bg-rose-500/10 px-2 py-0.5 text-[0.65rem] font-semibold text-rose-300">
                                  <CircleX className="h-3 w-3" />
                                  Incorrect
                                </span>
                              )}
                            </div>

                            <div className="space-y-1.5 pl-10">
                              {q.options.map((opt) => {
                                const isSelected = answeredOptionId === opt.id
                                return (
                                  <div
                                    key={opt.id}
                                    className={cn(
                                      "flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors",
                                      isSelected && isCorrect
                                        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                                        : isSelected && !isCorrect
                                        ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
                                        : "border-white/5 bg-white/[0.02] text-muted-foreground",
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        "grid h-4 w-4 shrink-0 place-items-center rounded-full border",
                                        isSelected
                                          ? isCorrect
                                            ? "border-emerald-400 bg-emerald-500"
                                            : "border-rose-400 bg-rose-500"
                                          : "border-muted-foreground/40",
                                      )}
                                    >
                                      {isSelected && (
                                        <div className="h-1.5 w-1.5 rounded-full bg-white" />
                                      )}
                                    </div>
                                    <span className="flex-1">{opt.optionText}</span>
                                    {isSelected && (
                                      <span
                                        className={cn(
                                          "inline-flex items-center gap-1 text-xs font-medium",
                                          isCorrect ? "text-emerald-300" : "text-rose-300",
                                        )}
                                      >
                                        {isCorrect ? (
                                          <CheckCircle2 className="h-3.5 w-3.5" />
                                        ) : (
                                          <CircleX className="h-3.5 w-3.5" />
                                        )}
                                        Your answer
                                      </span>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    )
                  })}
                </motion.section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}
