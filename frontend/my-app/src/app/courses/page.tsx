"use client"

import { Suspense, useMemo, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { CourseCard, useUserEnrollments } from "@/features/courses"
import { Sidebar } from "@/features/dashboard"
import { BookOpen, Search, Compass, Sparkles, GraduationCap, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import "@/styles/global.css"

export default function CoursesPage() {
  const { enrollments, loading, error, refetch } = useUserEnrollments()

  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all")

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.08,
      },
    },
  }

  const completedCount = useMemo(
    () => enrollments.filter((e) => e.status === "completed").length,
    [enrollments]
  )
  const activeCount = enrollments.length - completedCount

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return enrollments.filter((e) => {
      if (!e.course) return false
      if (filter === "completed" && e.status !== "completed") return false
      if (filter === "active" && e.status === "completed") return false
      if (!q) return true
      return (
        e.course.title.toLowerCase().includes(q) ||
        e.course.category?.toLowerCase().includes(q) ||
        e.course.instructor?.toLowerCase().includes(q)
      )
    })
  }, [enrollments, query, filter])

  const filterChips: { key: typeof filter; label: string; count: number }[] = [
    { key: "all", label: "All courses", count: enrollments.length },
    { key: "active", label: "In progress", count: activeCount },
    { key: "completed", label: "Completed", count: completedCount },
  ]

  return (
    <div className="aurora-bg grid-overlay min-h-screen overflow-x-hidden bg-background text-foreground">
      <aside
        aria-label="Sidebar navigation"
        className="fixed left-0 top-0 z-10 h-full w-72 p-4 sidebar-glass"
      >
        <Suspense>
          <Sidebar />
        </Suspense>
      </aside>

      <main className="ml-72 min-h-screen p-6 md:p-8">
        <div className="mx-auto max-w-7xl">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="chip mb-3">
                  <Sparkles className="h-3.5 w-3.5" />
                  My learning
                </span>
                <h1 className="font-display text-3xl font-bold text-balance md:text-4xl">
                  <span className="text-gradient">My Courses</span>
                </h1>
                {!loading && !error && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {enrollments.length} course{enrollments.length !== 1 ? "s" : ""} enrolled
                    {completedCount > 0 && (
                      <>
                        {" · "}
                        <span className="text-emerald-300">{completedCount} completed</span>
                      </>
                    )}
                  </p>
                )}
              </div>
              <Button asChild variant="glow" className="gap-1.5 self-start md:self-auto">
                <Link href="/explore">
                  <Compass className="h-4 w-4" />
                  Browse More
                </Link>
              </Button>
            </div>

            {/* Search + filters */}
            {!loading && !error && enrollments.length > 0 && (
              <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="relative w-full lg:max-w-sm">
                  <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search your courses…"
                    aria-label="Search your courses"
                    className="glass-subtle h-11 w-full rounded-xl border border-white/8 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/70 transition-colors focus:border-indigo-400/50 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  {filterChips.map((chip) => {
                    const active = filter === chip.key
                    return (
                      <button
                        key={chip.key}
                        type="button"
                        onClick={() => setFilter(chip.key)}
                        aria-pressed={active}
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/50",
                          active
                            ? "border-indigo-400/50 bg-indigo-500/20 text-indigo-100 shadow-glow"
                            : "border-white/8 bg-white/[0.03] text-muted-foreground hover:border-indigo-400/30 hover:text-foreground"
                        )}
                      >
                        {chip.label}
                        <span
                          className={cn(
                            "rounded-full px-1.5 py-0.5 text-[10px] tabular-nums",
                            active ? "bg-indigo-400/30 text-indigo-50" : "bg-white/5 text-muted-foreground"
                          )}
                        >
                          {chip.count}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
          </motion.header>

          {/* States */}
          {loading ? (
            <SkeletonGrid />
          ) : error ? (
            <ErrorState message={error} onRetry={refetch} />
          ) : enrollments.length === 0 ? (
            <EmptyState />
          ) : filtered.length === 0 ? (
            <NoResults onClear={() => { setQuery(""); setFilter("all") }} />
          ) : (
            <motion.section
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filtered.map((enrollment) =>
                enrollment.course ? (
                  <CourseCard
                    key={enrollment.courseId}
                    course={enrollment.course}
                    progress={enrollment.progressDetails.percentComplete}
                  />
                ) : null
              )}
            </motion.section>
          )}
        </div>
      </main>
    </div>
  )
}

/* ── Loading skeleton grid ── */
function SkeletonGrid() {
  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
      aria-busy="true"
      aria-label="Loading courses"
    >
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="card-premium overflow-hidden">
          <div className="shimmer aspect-[16/9] w-full" />
          <div className="space-y-3 p-4">
            <div className="shimmer h-4 w-3/4 rounded" />
            <div className="shimmer h-3 w-1/2 rounded" />
            <div className="flex gap-3">
              <div className="shimmer h-3 w-12 rounded" />
              <div className="shimmer h-3 w-12 rounded" />
              <div className="shimmer h-3 w-12 rounded" />
            </div>
            <div className="shimmer h-9 w-full rounded-lg" />
          </div>
        </div>
      ))}
    </div>
  )
}

/* ── Empty state ── */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="card-premium mx-auto mt-4 flex max-w-xl flex-col items-center gap-5 px-8 py-16 text-center"
    >
      <div className="relative">
        <div className="animate-float flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-indigo-500/25 to-violet-500/15 ring-1 ring-inset ring-indigo-500/30">
          <GraduationCap className="h-10 w-10 text-indigo-300" />
        </div>
        <span className="absolute -right-1 -top-1 flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-glow">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="space-y-1.5">
        <h2 className="font-display text-xl font-semibold">No courses yet</h2>
        <p className="text-sm text-muted-foreground">
          You haven&apos;t enrolled in any courses yet. Explore the catalog and start your learning journey.
        </p>
      </div>
      <Button asChild variant="glow" size="lg" className="gap-1.5">
        <Link href="/explore">
          <Compass className="h-4 w-4" />
          Explore Courses
        </Link>
      </Button>
    </motion.div>
  )
}

/* ── No filtered results ── */
function NoResults({ onClear }: { onClear: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass mx-auto mt-4 flex max-w-md flex-col items-center gap-4 rounded-2xl px-8 py-14 text-center"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-inset ring-white/10">
        <BookOpen className="h-7 w-7 text-muted-foreground/70" />
      </span>
      <div className="space-y-1">
        <h2 className="font-display text-lg font-semibold">No matching courses</h2>
        <p className="text-sm text-muted-foreground">Try a different search or filter.</p>
      </div>
      <Button variant="glass" onClick={onClear}>
        Clear filters
      </Button>
    </motion.div>
  )
}

/* ── Error state ── */
function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto mt-4 flex max-w-md flex-col items-center gap-4 rounded-2xl border border-rose-500/25 bg-rose-500/[0.06] px-8 py-14 text-center backdrop-blur-md"
    >
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 ring-1 ring-inset ring-rose-500/30">
        <Loader2 className="h-7 w-7 text-rose-300" />
      </span>
      <div className="space-y-1">
        <h2 className="font-display text-lg font-semibold">Couldn&apos;t load your courses</h2>
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <Button variant="glow" onClick={onRetry}>
        Try Again
      </Button>
    </motion.div>
  )
}
