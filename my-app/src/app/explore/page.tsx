"use client"

import { motion } from "framer-motion"
import { Suspense, useState, useCallback, useMemo } from "react"
import { Sidebar } from "@/features/dashboard"
import { ExploreCard, useExploreCourses, type ExploreCourse } from "@/features/explore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { useAuth } from "@/features/auth"
import { courseService } from "@/api/courseService"
import { useUserEnrollments } from "@/features/courses"
import { toast } from "sonner"
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronLeft,
  ChevronRight,
  Compass,
  Sparkles,
  TrendingUp,
  SearchX,
  RotateCcw,
} from "lucide-react"
import "@/styles/global.css"

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
}

/* ── Loading skeleton card ─────────────────────────────────────── */
function ExploreCardSkeleton() {
  return (
    <div className="card-premium overflow-hidden h-full flex flex-col">
      <div className="shimmer h-44 sm:h-48 w-full rounded-none" />
      <div className="p-5 flex-1 flex flex-col gap-3">
        <div className="flex items-center justify-end">
          <div className="shimmer h-3.5 w-16 rounded-full" />
        </div>
        <div className="shimmer h-5 w-4/5 rounded-md" />
        <div className="flex items-center gap-2.5 mt-1">
          <div className="shimmer h-7 w-7 rounded-full" />
          <div className="shimmer h-3.5 w-24 rounded-full" />
        </div>
        <div className="shimmer h-3.5 w-full rounded-md" />
        <div className="shimmer h-3.5 w-2/3 rounded-md" />
        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="shimmer h-7 w-16 rounded-full" />
          <div className="shimmer h-4 w-12 rounded-full" />
        </div>
        <div className="shimmer h-9 w-full rounded-xl" />
      </div>
    </div>
  )
}

export default function ExplorePage() {
  const { user } = useAuth()
  const router = useRouter()
  const { enrollments, refetch: refetchEnrollments } = useUserEnrollments()

  const [search, setSearch]           = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [category, setCategory]       = useState("")
  const [difficulty, setDifficulty]   = useState("")
  const [page, setPage]               = useState(1)
  const [enrolling, setEnrolling]     = useState<string | null>(null)

  const { courses, pagination, categories, difficulties, loading, error, refetch } =
    useExploreCourses({ search, category, difficulty, page, limit: 12 })

  // Create a set of enrolled course IDs for O(1) lookup
  const enrolledCourseIds = useMemo(() => {
    return new Set(enrollments.map(e => e.courseId))
  }, [enrollments])

  const applySearch = useCallback(() => {
    setSearch(searchInput)
    setPage(1)
  }, [searchInput])

  const clearFilters = () => {
    setSearchInput(""); setSearch(""); setCategory(""); setDifficulty(""); setPage(1)
  }

  const hasFilters = !!(search || category || difficulty)

  async function handlePurchase(course: ExploreCourse) {
    if (!user?.id) { toast.error("Please log in to enroll"); router.push("/auth"); return }
    setEnrolling(course.id)
    try {
      const res = await courseService.enroll(user.id.toString(), course.id)
      if (res?.status === "already_enrolled") {
        toast("Already enrolled — heading to your courses")
      } else {
        toast.success(`Enrolled in "${course.title}"!`)
        // Refetch enrollments to update the UI
        await refetchEnrollments()
      }
      router.push(`/courses/${course.id}`)
    } catch (e: any) {
      toast.error(e.message || "Enrollment failed")
    } finally {
      setEnrolling(null)
    }
  }

  // Trending category quick-picks (purely presentational shortcut into existing filter state)
  const trendingCategories = useMemo(() => categories.slice(0, 6), [categories])

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden aurora-bg grid-overlay">
      <aside aria-label="Sidebar navigation" className="fixed left-0 top-0 h-full w-72 p-4 sidebar-glass z-10">
        <Suspense><Sidebar /></Suspense>
      </aside>
      <main className="ml-72 p-6 sm:p-8 min-h-screen scrollbar-thin">
        <div className="max-w-7xl mx-auto">

          {/* ── Hero ───────────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="py-6 sm:py-8"
          >
            <div className="card-premium relative overflow-hidden p-6 sm:p-10">
              {/* Floating ambient orbs */}
              <div className="pointer-events-none absolute -top-16 -right-10 h-56 w-56 rounded-full bg-indigo-500/20 blur-3xl animate-float" aria-hidden />
              <div className="pointer-events-none absolute -bottom-20 left-1/3 h-48 w-48 rounded-full bg-violet-500/15 blur-3xl" aria-hidden />

              <div className="relative">
                <span className="chip mb-4">
                  <Compass className="h-3.5 w-3.5" />
                  Discover
                </span>

                <h1 className="font-display text-3xl sm:text-5xl font-bold tracking-tight text-balance">
                  Explore <span className="text-gradient">courses</span> made
                  <br className="hidden sm:block" />
                  to move you forward.
                </h1>

                <p className="mt-3 max-w-xl text-sm sm:text-base text-muted-foreground text-pretty">
                  Browse{pagination.total > 0 ? ` ${pagination.total.toLocaleString()}` : ""} hand-crafted courses across categories and skill levels — and start your learning journey today.
                </p>

                {/* Hero search */}
                <div className="mt-6 flex flex-col sm:flex-row gap-3 max-w-2xl">
                  <div className="relative flex-1 group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none transition-colors group-focus-within:text-indigo-300" />
                    <Input
                      className="h-11 pl-10 glass border-white/10 focus-visible:border-indigo-400/50 focus-visible:ring-indigo-400/30 placeholder:text-muted-foreground/70"
                      placeholder="Search for React, design, data…"
                      value={searchInput}
                      onChange={(e) => setSearchInput(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && applySearch()}
                      aria-label="Search courses"
                    />
                  </div>
                  <Button onClick={applySearch} variant="glow" className="h-11 px-6 gap-1.5">
                    <Sparkles className="h-4 w-4" /> Search
                  </Button>
                </div>

                {/* Trending / category quick chips */}
                {trendingCategories.length > 0 && (
                  <div className="mt-5 flex flex-wrap items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground mr-1">
                      <TrendingUp className="h-3.5 w-3.5 text-cyan-300" /> Trending
                    </span>
                    {trendingCategories.map((c) => {
                      const active = category === c
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => { setCategory(active ? "" : c); setPage(1) }}
                          aria-pressed={active}
                          className={
                            active
                              ? "neu-pressable px-3 py-1.5 rounded-full text-xs font-semibold text-indigo-100 glow-ring transition-all"
                              : "glass-subtle px-3 py-1.5 rounded-full text-xs font-medium text-muted-foreground hover:text-foreground hover:border-indigo-400/40 transition-all"
                          }
                        >
                          {c}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.section>

          {/* ── Filters bar ────────────────────────────────────── */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6"
          >
            <div className="glass rounded-2xl p-3 sm:p-4">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="inline-flex items-center gap-2 text-sm font-medium text-foreground sm:mr-1">
                  <SlidersHorizontal className="h-4 w-4 text-indigo-300" />
                  <span className="hidden sm:inline">Filters</span>
                </div>

                <Select value={category || "all"} onValueChange={(v) => { setCategory(v === "all" ? "" : v); setPage(1) }}>
                  <SelectTrigger className="w-full sm:w-[180px] glass-subtle border-white/10">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>

                <Select value={difficulty || "all"} onValueChange={(v) => { setDifficulty(v === "all" ? "" : v); setPage(1) }}>
                  <SelectTrigger className="w-full sm:w-[160px] glass-subtle border-white/10">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {difficulties.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                  </SelectContent>
                </Select>

                {hasFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="text-muted-foreground hover:text-foreground gap-1.5 sm:ml-auto shrink-0"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> Reset
                  </Button>
                )}
              </div>

              {/* Active filter chips */}
              {hasFilters && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-white/5">
                  {search && (
                    <Badge
                      variant="secondary"
                      className="gap-1 cursor-pointer bg-indigo-500/15 text-indigo-200 border border-indigo-500/25 hover:bg-indigo-500/25 transition-colors"
                      onClick={() => { setSearch(""); setSearchInput(""); setPage(1) }}
                    >
                      &ldquo;{search}&rdquo; <X className="h-3 w-3" />
                    </Badge>
                  )}
                  {category && (
                    <Badge
                      variant="secondary"
                      className="gap-1 cursor-pointer bg-violet-500/15 text-violet-200 border border-violet-500/25 hover:bg-violet-500/25 transition-colors"
                      onClick={() => { setCategory(""); setPage(1) }}
                    >
                      {category} <X className="h-3 w-3" />
                    </Badge>
                  )}
                  {difficulty && (
                    <Badge
                      variant="secondary"
                      className="gap-1 cursor-pointer bg-cyan-500/15 text-cyan-200 border border-cyan-500/25 hover:bg-cyan-500/25 transition-colors"
                      onClick={() => { setDifficulty(""); setPage(1) }}
                    >
                      {difficulty} <X className="h-3 w-3" />
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </motion.section>

          {/* ── Grid ───────────────────────────────────────────── */}
          <section className="pb-10">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <ExploreCardSkeleton key={i} />
                ))}
              </div>
            ) : error ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                className="card-premium text-center py-16 px-6 max-w-md mx-auto"
              >
                <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/15 border border-rose-500/25">
                  <X className="h-7 w-7 text-rose-300" />
                </div>
                <h3 className="font-display text-lg font-semibold">Something went wrong</h3>
                <p className="mt-2 text-sm text-muted-foreground">{error}</p>
                <Button onClick={refetch} variant="glow" className="mt-6 gap-1.5">
                  <RotateCcw className="h-4 w-4" /> Try Again
                </Button>
              </motion.div>
            ) : courses.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                className="card-premium text-center py-16 px-6 max-w-md mx-auto"
              >
                <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-500/10 border border-indigo-500/20 animate-float">
                  <SearchX className="h-9 w-9 text-indigo-300" />
                </div>
                <h3 className="font-display text-xl font-semibold">No courses found</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {hasFilters
                    ? "We couldn't find anything matching your filters. Try broadening your search."
                    : "There are no courses to show right now. Check back soon."}
                </p>
                {hasFilters && (
                  <Button variant="glass" onClick={clearFilters} className="mt-6 gap-1.5">
                    <RotateCcw className="h-4 w-4" /> Clear filters
                  </Button>
                )}
              </motion.div>
            ) : (
              <>
                <div className="flex items-center justify-between mb-5">
                  <p className="text-sm text-muted-foreground">
                    Showing{" "}
                    <span className="font-medium text-foreground">{(page - 1) * pagination.limit + 1}</span>
                    –
                    <span className="font-medium text-foreground">{Math.min(page * pagination.limit, pagination.total)}</span>{" "}
                    of <span className="font-medium text-foreground">{pagination.total.toLocaleString()}</span> courses
                  </p>
                </div>

                <motion.div
                  key={`${search}-${category}-${difficulty}-${page}`}
                  variants={container}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {courses.map((course, idx) => (
                    <ExploreCard
                      key={course.id}
                      course={course}
                      index={idx}
                      loading={enrolling === course.id}
                      isEnrolled={enrolledCourseIds.has(course.id)}
                      onPurchase={handlePurchase}
                    />
                  ))}
                </motion.div>

                {pagination.pages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <Button
                      variant="glass"
                      size="sm"
                      disabled={page === 1}
                      onClick={() => setPage((p) => p - 1)}
                      className="gap-1 disabled:opacity-40"
                      aria-label="Previous page"
                    >
                      <ChevronLeft className="h-4 w-4" /> Prev
                    </Button>
                    <span className="px-4 py-1.5 rounded-full glass-subtle text-sm text-muted-foreground">
                      Page <span className="font-semibold text-foreground">{page}</span> of {pagination.pages}
                    </span>
                    <Button
                      variant="glass"
                      size="sm"
                      disabled={page >= pagination.pages}
                      onClick={() => setPage((p) => p + 1)}
                      className="gap-1 disabled:opacity-40"
                      aria-label="Next page"
                    >
                      Next <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
