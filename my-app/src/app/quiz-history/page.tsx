"use client"

import { Suspense, useId, useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Sidebar } from "@/features/dashboard"
import { useAuth } from "@/features/auth"
import { courseService } from "@/api/courseService"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  Trophy,
  XCircle,
  ClipboardList,
  RotateCcw,
  ChevronRight,
  Target,
  CheckCircle2,
  Sparkles,
  ListChecks,
} from "lucide-react"
import "@/styles/global.css"

interface AttemptRow {
  id: string
  quizId: string
  quizTitle: string
  courseId: string
  levelId: string
  score: number | null
  passed: boolean
  status: string
  startedAt: string
  completedAt: string | null
  correctAnswers?: number
  totalQuestions?: number
}

function fmt(iso?: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleString("en-US", {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
}

/* ── Compact score ring used in each history row ─────────────────── */
function ScoreRing({
  score,
  passed,
  size = 52,
  strokeWidth = 5,
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
      aria-label={score == null ? "No score" : `Score ${Math.round(safe)} percent`}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
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
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
      </svg>
      <span
        className={cn(
          "absolute inset-0 flex items-center justify-center text-[0.8rem] font-bold tabular-nums",
          score == null
            ? "text-muted-foreground"
            : passed
            ? "text-emerald-300"
            : "text-rose-300",
        )}
      >
        {score == null ? "—" : `${Math.round(safe)}`}
      </span>
    </div>
  )
}

/* ── Pass / fail pill ────────────────────────────────────────────── */
function ResultChip({ passed }: { passed: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold",
        passed
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
          : "border-rose-500/30 bg-rose-500/10 text-rose-300",
      )}
    >
      {passed ? <Trophy className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
      {passed ? "Passed" : "Failed"}
    </span>
  )
}

/* ── Loading skeleton rows ───────────────────────────────────────── */
function HistorySkeleton() {
  return (
    <Card className="card-premium overflow-hidden">
      <CardContent className="p-0">
        <div className="divide-y divide-white/5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-6 py-4">
              <div className="shimmer h-12 w-12 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="shimmer h-4 w-1/2 rounded-md" />
                <div className="shimmer h-3 w-1/3 rounded-md" />
              </div>
              <div className="shimmer h-7 w-20 rounded-full" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default function QuizHistoryPage() {
  const { user } = useAuth()
  const userId = user?.id?.toString() ?? ""

  const [attempts, setAttempts]   = useState<AttemptRow[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)
  const [courseFilter, setCourseFilter] = useState("all")

  const loadHistory = async () => {
    if (!userId) { setLoading(false); return }
    try {
      setLoading(true)
      const data = await courseService.getUserQuizHistory(userId)
      setAttempts(Array.isArray(data) ? data as AttemptRow[] : [])
      setError(null)
    } catch (e: any) {
      setError(e.message || "Failed to load quiz history")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadHistory() }, [userId]) // eslint-disable-line

  // Unique course IDs for filter
  const courseIds = [...new Set(attempts.map((a) => a.courseId).filter(Boolean))]
  const filtered = courseFilter === "all" ? attempts : attempts.filter((a) => a.courseId === courseFilter)

  // Stats
  const completed = attempts.filter((a) => a.status === "completed")
  const passed    = completed.filter((a) => a.passed)
  const avgScore  = completed.length > 0
    ? Math.round(completed.reduce((s, a) => s + (a.score ?? 0), 0) / completed.length)
    : 0

  const stats = [
    { label: "Total Attempts", value: completed.length, icon: ListChecks, tint: "text-indigo-300", ring: "from-indigo-500/20" },
    { label: "Passed",         value: passed.length,    icon: Trophy,     tint: "text-emerald-300", ring: "from-emerald-500/20" },
    { label: "Failed",         value: completed.length - passed.length, icon: XCircle, tint: "text-rose-300", ring: "from-rose-500/20" },
    { label: "Avg Score",      value: `${avgScore}%`,   icon: Target,     tint: "text-cyan-300", ring: "from-cyan-500/20" },
  ]

  return (
    <div className="aurora-bg grid-overlay min-h-screen bg-background text-foreground overflow-x-hidden">
      <aside aria-label="Sidebar navigation" className="fixed left-0 top-0 h-full w-72 p-4 sidebar-glass z-10">
        <Suspense><Sidebar /></Suspense>
      </aside>

      <main className="ml-72 p-8 min-h-screen scrollbar-thin">
        <div className="max-w-5xl mx-auto space-y-7">

          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-wrap items-center justify-between gap-4"
          >
            <div className="flex items-center gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-2xl gradient-border shadow-glow">
                <ClipboardList className="h-6 w-6 text-violet-300" />
              </div>
              <div>
                <h1 className="font-display text-2xl md:text-3xl font-bold text-gradient">
                  Quiz History
                </h1>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Every attempt, score, and milestone — all in one place
                </p>
              </div>
            </div>
            <Button
              variant="glass"
              size="sm"
              onClick={loadHistory}
              className="gap-1.5"
              aria-label="Refresh quiz history"
            >
              <RotateCcw className={cn("h-4 w-4", loading && "animate-spin")} />
              Refresh
            </Button>
          </motion.header>

          {/* Stats row */}
          {!loading && !error && completed.length > 0 && (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.07 } } }}
              className="grid grid-cols-2 sm:grid-cols-4 gap-4"
            >
              {stats.map((s) => {
                const Icon = s.icon
                return (
                  <motion.div
                    key={s.label}
                    variants={{
                      hidden: { opacity: 0, y: 12 },
                      show: { opacity: 1, y: 0 },
                    }}
                    className="card-premium hover-lift relative overflow-hidden rounded-2xl p-4"
                  >
                    <div
                      className={cn(
                        "pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-gradient-to-br to-transparent blur-xl",
                        s.ring,
                      )}
                    />
                    <div className="flex items-center justify-between">
                      <p className="text-[0.68rem] font-medium uppercase tracking-wider text-muted-foreground">
                        {s.label}
                      </p>
                      <Icon className={cn("h-4 w-4", s.tint)} />
                    </div>
                    <p className="mt-2 font-display text-2xl font-bold tabular-nums">{s.value}</p>
                  </motion.div>
                )
              })}
            </motion.div>
          )}

          {/* Filter */}
          {courseIds.length > 1 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-3"
            >
              <span className="text-sm text-muted-foreground">Filter by course</span>
              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-[200px] glass border-indigo-500/20">
                  <SelectValue placeholder="All courses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Courses</SelectItem>
                  {courseIds.map((id) => (
                    <SelectItem key={id} value={id}>{id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </motion.div>
          )}

          {/* Content */}
          {!userId ? (
            <Card className="card-premium">
              <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-2xl neu">
                  <ClipboardList className="h-7 w-7 text-violet-300" />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold">Sign in to continue</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Log in to view your quiz history.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : loading ? (
            <HistorySkeleton />
          ) : error ? (
            <Card className="card-premium border-rose-500/20">
              <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
                <div className="grid h-14 w-14 place-items-center rounded-2xl bg-rose-500/10 border border-rose-500/25">
                  <XCircle className="h-7 w-7 text-rose-300" />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold">Something went wrong</p>
                  <p className="mt-1 text-sm text-rose-300/90">{error}</p>
                </div>
                <Button variant="glow" onClick={loadHistory} className="gap-1.5">
                  <RotateCcw className="h-4 w-4" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : filtered.length === 0 ? (
            <Card className="card-premium">
              <CardContent className="flex flex-col items-center gap-4 py-16 text-center">
                <div className="grid h-16 w-16 place-items-center rounded-2xl neu animate-float">
                  <Sparkles className="h-8 w-8 text-indigo-300" />
                </div>
                <div>
                  <p className="font-display text-lg font-semibold">No attempts yet</p>
                  <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                    {courseFilter === "all"
                      ? "Take your first quiz to start building your history."
                      : "No quiz attempts found for this course."}
                  </p>
                </div>
                <Button variant="glow" asChild className="gap-1.5">
                  <Link href="/courses">
                    Explore Courses
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="card-premium overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-indigo-300" />
                    {filtered.length} attempt{filtered.length !== 1 ? "s" : ""}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-white/5">
                    {filtered.map((attempt, i) => {
                      const isCompleted = attempt.status === "completed"
                      const RowInner = (
                        <motion.div
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: Math.min(i * 0.04, 0.4) }}
                          className={cn(
                            "group flex items-center gap-4 px-6 py-4 transition-colors",
                            isCompleted
                              ? "cursor-pointer hover:bg-indigo-500/[0.06]"
                              : "opacity-90",
                          )}
                        >
                          {isCompleted ? (
                            <ScoreRing score={attempt.score} passed={attempt.passed} />
                          ) : (
                            <div className="grid h-[52px] w-[52px] shrink-0 place-items-center rounded-full neu-inset">
                              <RotateCcw className="h-5 w-5 text-amber-300/80" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-foreground/95">
                              {attempt.quizTitle || "Quiz"}
                            </p>
                            <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{fmt(attempt.completedAt ?? attempt.startedAt)}</span>
                              {isCompleted &&
                                attempt.correctAnswers != null &&
                                attempt.totalQuestions != null && (
                                  <>
                                    <span className="text-muted-foreground/40">·</span>
                                    <span className="tabular-nums">
                                      {attempt.correctAnswers}/{attempt.totalQuestions} correct
                                    </span>
                                  </>
                                )}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center gap-3">
                            {isCompleted ? (
                              <>
                                <ResultChip passed={attempt.passed} />
                                <ChevronRight className="h-4 w-4 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-indigo-300" />
                              </>
                            ) : (
                              <Badge className="border-amber-500/30 bg-amber-500/10 text-xs text-amber-300">
                                In Progress
                              </Badge>
                            )}
                          </div>
                        </motion.div>
                      )

                      return isCompleted ? (
                        <Link
                          key={attempt.id}
                          href={`/quiz-history/${attempt.id}`}
                          className="block rounded-none outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60 focus-visible:ring-inset"
                          aria-label={`Review ${attempt.quizTitle || "quiz"} — ${
                            attempt.passed ? "passed" : "failed"
                          }`}
                        >
                          {RowInner}
                        </Link>
                      ) : (
                        <div key={attempt.id} className="block">
                          {RowInner}
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  )
}
