"use client"

import { Suspense, useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Sidebar } from "@/features/dashboard"
import { useAuth } from "@/features/auth"
import { catalogAPI } from "@/api/catalog-api"
import { toast } from "sonner"
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  BookOpen,
  Users,
  Star,
  Clock,
  BarChart3,
  RotateCcw,
  Layers,
} from "lucide-react"
import "@/styles/global.css"

interface AdminCourse {
  id: string
  title: string
  description: string
  instructor: string
  difficulty: string
  category: string
  duration: number
  price: number
  imageUrl: string
  rating: number
  totalStudents: number
  levels: any[]
  tags: any[]
  createdAt: string
}

const difficultyColor: Record<string, string> = {
  beginner: "bg-emerald-600/20 text-emerald-300 border-emerald-600/30",
  intermediate: "bg-amber-600/20 text-amber-300 border-amber-600/30",
  advanced: "bg-red-600/20 text-red-300 border-red-600/30",
}

function CourseCardSkeleton() {
  return (
    <Card className="glass-subtle border-white/5">
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="h-20 w-20 shrink-0 rounded-xl shimmer" />
          <div className="flex-1 space-y-2.5 py-1">
            <div className="h-4 w-1/2 shimmer rounded-md" />
            <div className="h-3 w-3/4 shimmer rounded-md" />
            <div className="flex gap-2 pt-1">
              <div className="h-3 w-16 shimmer rounded-md" />
              <div className="h-3 w-16 shimmer rounded-md" />
              <div className="h-3 w-12 shimmer rounded-md" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminCoursesPage() {
  const { user } = useAuth()
  const router = useRouter()

  const [courses, setCourses] = useState<AdminCourse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState("")
  const [deleting, setDeleting] = useState<string | null>(null)

  const loadCourses = useCallback(async () => {
    try {
      setLoading(true)
      // Only the teacher's OWN courses — edit/delete are ownership-guarded server-side.
      const data = await catalogAPI.getMyCourses()
      setCourses(data || [])
      setError(null)
    } catch (e: any) {
      setError(e.message || "Failed to load courses")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadCourses()
  }, [loadCourses])

  const handleDelete = async (course: AdminCourse) => {
    if (!confirm(`Delete "${course.title}"? This cannot be undone.`)) return
    setDeleting(course.id)
    try {
      await catalogAPI.deleteCourse(course.id)
      toast.success(`"${course.title}" deleted`)
      setCourses((prev) => prev.filter((c) => c.id !== course.id))
    } catch (e: any) {
      toast.error(e.message || "Delete failed")
    } finally {
      setDeleting(null)
    }
  }

  const filtered = searchInput.trim()
    ? courses.filter(
        (c) =>
          c.title.toLowerCase().includes(searchInput.toLowerCase()) ||
          c.category?.toLowerCase().includes(searchInput.toLowerCase()) ||
          c.instructor?.toLowerCase().includes(searchInput.toLowerCase())
      )
    : courses

  // Basic role guard — show warning for non-teacher users
  const isTeacher = user?.role === "teacher" || user?.role === "TEACHER"

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

      <main className="ml-72 p-8 min-h-screen">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <motion.header
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="card-premium relative overflow-hidden p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="pointer-events-none absolute -right-12 -top-16 h-44 w-44 rounded-full bg-violet-500/15 blur-3xl" />
            <div className="relative">
              <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-indigo-500/30 to-violet-500/20 ring-1 ring-inset ring-white/10">
                  <BarChart3 className="h-5 w-5 text-violet-300" />
                </span>
                <span className="text-gradient">Course Management</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5" />
                {courses.length} course{courses.length !== 1 ? "s" : ""} in your catalog
              </p>
            </div>
            <div className="relative flex gap-2">
              <Button
                variant="glass"
                size="sm"
                onClick={loadCourses}
                className="gap-1.5"
              >
                <RotateCcw className="h-4 w-4" />
                Refresh
              </Button>
              <Button asChild variant="glow" size="sm" className="gap-1.5">
                <Link href="/admin/courses/new">
                  <Plus className="h-4 w-4" />
                  New Course
                </Link>
              </Button>
            </div>
          </motion.header>

          {!isTeacher && (
            <Card className="border-amber-500/30 bg-amber-500/[0.07] glass-subtle">
              <CardContent className="py-3 text-sm text-amber-300/90 flex items-center gap-2">
                <ShieldDot />
                You are viewing admin pages as a{" "}
                <strong className="text-amber-200">{user?.role || "learner"}</strong>.
                Some actions may require teacher/admin privileges.
              </CardContent>
            </Card>
          )}

          {/* Search */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              className="pl-9 glass border-white/10 focus-visible:border-indigo-400/50"
              placeholder="Search courses by title, category, instructor…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              aria-label="Search courses"
            />
          </div>

          {/* Content */}
          {loading ? (
            <div className="space-y-3">
              {[0, 1, 2, 3].map((i) => (
                <CourseCardSkeleton key={i} />
              ))}
            </div>
          ) : error ? (
            <Card className="card-premium">
              <CardContent className="py-14 text-center">
                <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-red-500/10 ring-1 ring-inset ring-red-500/20">
                  <BarChart3 className="h-7 w-7 text-red-400" />
                </div>
                <p className="text-red-300 mb-1 font-medium">Something went wrong</p>
                <p className="text-sm text-muted-foreground mb-5">{error}</p>
                <Button onClick={loadCourses} variant="glow" className="gap-1.5">
                  <RotateCcw className="h-4 w-4" />
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : filtered.length === 0 ? (
            <Card className="card-premium">
              <CardContent className="py-16 text-center">
                <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10 ring-1 ring-inset ring-white/10 animate-float">
                  {searchInput ? (
                    <Search className="h-8 w-8 text-indigo-300/80" />
                  ) : (
                    <BookOpen className="h-8 w-8 text-indigo-300/80" />
                  )}
                </div>
                <h3 className="font-display text-lg font-semibold">
                  {searchInput ? "No matching courses" : "No courses yet"}
                </h3>
                <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-sm mx-auto">
                  {searchInput
                    ? "Try a different title, category, or instructor name."
                    : "Create your first course with levels, quizzes, and questions to populate the catalog."}
                </p>
                {!searchInput && (
                  <Button asChild variant="glow" className="gap-1.5">
                    <Link href="/admin/courses/new">
                      <Plus className="h-4 w-4" />
                      Create Course
                    </Link>
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filtered.map((course, i) => {
                const diffClass =
                  difficultyColor[course.difficulty?.toLowerCase() ?? ""] ??
                  "bg-indigo-600/20 text-indigo-300 border-indigo-600/30"
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(i * 0.04, 0.3) }}
                  >
                    <Card className="card-premium group">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          {/* Thumbnail */}
                          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl ring-1 ring-inset ring-white/10 bg-gradient-to-br from-indigo-500/15 to-violet-500/10">
                            {course.imageUrl ? (
                              <img
                                src={course.imageUrl}
                                alt={course.title}
                                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <BookOpen className="h-8 w-8 text-indigo-300/40" />
                              </div>
                            )}
                          </div>

                          {/* Info */}
                          <div className="min-w-0 flex-1">
                            <div className="mb-1 flex flex-wrap items-center gap-2">
                              <h3 className="truncate font-display text-base font-semibold">
                                {course.title}
                              </h3>
                              <Badge
                                className={`text-xs capitalize border ${diffClass}`}
                              >
                                {course.difficulty}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {course.category}
                              </Badge>
                            </div>
                            <p className="line-clamp-1 text-xs text-muted-foreground">
                              {course.description}
                            </p>
                            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
                              <span className="text-foreground/70">
                                By {course.instructor}
                              </span>
                              {course.rating != null && (
                                <span className="flex items-center gap-1">
                                  <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                  {course.rating.toFixed(1)}
                                </span>
                              )}
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {course.duration}h
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {(course.totalStudents ?? 0).toLocaleString()}
                              </span>
                              <span className="chip !px-2 !py-0.5">
                                <Layers className="h-3 w-3" />
                                {course.levels?.length ?? 0} levels
                              </span>
                              {course.tags?.map((t: any) => (
                                <Badge
                                  key={t.id}
                                  variant="outline"
                                  className="text-xs"
                                  style={{ borderColor: t.color }}
                                >
                                  {t.name}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex shrink-0 items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              className="hover:bg-indigo-500/15 hover:text-indigo-200"
                              aria-label={`Edit ${course.title}`}
                            >
                              <Link href={`/admin/courses/${course.id}/edit`}>
                                <Pencil className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-red-400 hover:bg-red-500/15 hover:text-red-300"
                              disabled={deleting === course.id}
                              onClick={() => handleDelete(course)}
                              aria-label={`Delete ${course.title}`}
                            >
                              {deleting === course.id ? (
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-400 border-t-transparent" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

/** Small pulsing amber indicator dot for the role-warning banner. */
function ShieldDot() {
  return (
    <span className="relative flex h-2 w-2 shrink-0">
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400/60" />
      <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-400" />
    </span>
  )
}
