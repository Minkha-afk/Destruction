"use client"

import { Suspense, useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sidebar } from "@/features/dashboard"
import { useAuth } from "@/features/auth"
import { catalogAPI } from "@/api/catalog-api"
import { courseService } from "@/api/courseService"
import {
  BookOpen,
  Users,
  Plus,
  ArrowRight,
  ShieldCheck,
  GraduationCap,
  CheckCircle2,
  Award,
  Target,
  Pencil,
  Eye,
  Layers,
  TrendingUp,
  Sparkles,
} from "lucide-react"
import "@/styles/global.css"

type Insight = {
  courseId: string
  enrollments: number
  activeLearners: number
  completions: number
  avgProgress: number
  attempts: number
  passedAttempts: number
  passRate: number
  avgScore: number
}
type Totals = {
  courses: number
  totalEnrollments: number
  activeLearners: number
  completions: number
  avgProgress: number
  totalAttempts: number
  passedAttempts: number
  passRate: number
  avgScore: number
}

const ZERO_TOTALS: Totals = {
  courses: 0, totalEnrollments: 0, activeLearners: 0, completions: 0,
  avgProgress: 0, totalAttempts: 0, passedAttempts: 0, passRate: 0, avgScore: 0,
}

export default function TeacherStudioPage() {
  const { user } = useAuth()
  const [courses, setCourses] = useState<any[]>([])
  const [totals, setTotals] = useState<Totals>(ZERO_TOTALS)
  const [byId, setById] = useState<Map<string, Insight>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const mine = await catalogAPI.getMyCourses()
      setCourses(mine || [])
      const ids = (mine || []).map((c: any) => c.id)
      if (ids.length) {
        const ins = await courseService.getCourseInsights(ids)
        setTotals(ins.totals)
        setById(new Map(ins.perCourse.map((p) => [p.courseId, p])))
      } else {
        setTotals({ ...ZERO_TOTALS })
        setById(new Map())
      }
    } catch (e: any) {
      setError(e.message || "Failed to load your studio")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const stats = [
    { icon: BookOpen, label: "My Courses", value: courses.length, tint: "text-indigo-300", from: "from-indigo-500/20 to-violet-500/10 border-indigo-500/20", ring: "from-indigo-500/30 to-violet-500/20" },
    { icon: Users, label: "Total Students", value: totals.totalEnrollments, tint: "text-cyan-300", from: "from-cyan-500/20 to-sky-500/10 border-cyan-500/20", ring: "from-cyan-500/30 to-sky-500/20" },
    { icon: Target, label: "Avg Completion", value: `${Math.round(totals.avgProgress)}%`, tint: "text-emerald-300", from: "from-emerald-500/20 to-green-500/10 border-emerald-500/20", ring: "from-emerald-500/30 to-green-500/20" },
    { icon: Award, label: "Quiz Pass Rate", value: `${totals.passRate}%`, tint: "text-amber-300", from: "from-amber-500/20 to-orange-500/10 border-amber-500/20", ring: "from-amber-500/30 to-orange-500/20" },
  ]

  return (
    <div className="aurora-bg grid-overlay min-h-screen bg-background text-foreground overflow-x-hidden">
      <aside aria-label="Sidebar navigation" className="fixed left-0 top-0 h-full w-72 p-4 sidebar-glass z-10">
        <Suspense>
          <Sidebar />
        </Suspense>
      </aside>

      <main className="ml-72 p-8 min-h-screen">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Hero */}
          <motion.header
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="card-premium relative overflow-hidden rounded-[calc(var(--radius)+4px)] p-7"
          >
            <div className="pointer-events-none absolute -right-10 -top-16 h-48 w-48 rounded-full bg-violet-500/20 blur-3xl" />
            <div className="pointer-events-none absolute -left-8 bottom-0 h-32 w-32 rounded-full bg-indigo-500/15 blur-3xl" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-indigo-500/30 to-violet-500/20 ring-1 ring-inset ring-white/10 shadow-glow">
                    <GraduationCap className="h-6 w-6 text-violet-300" />
                  </span>
                  <h1 className="font-display text-2xl md:text-3xl font-semibold tracking-tight">
                    <span className="text-gradient">Teacher Studio</span>
                  </h1>
                </div>
                <p className="text-sm text-muted-foreground max-w-md">
                  Welcome back, {user?.name ?? "Teacher"}. Create courses and track how
                  your students are doing — all in one place.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button asChild variant="glass" className="gap-1.5">
                  <Link href="/admin/courses">
                    <Layers className="h-4 w-4" />
                    Manage
                  </Link>
                </Button>
                <Button asChild variant="glow" className="gap-1.5">
                  <Link href="/admin/courses/new">
                    <Plus className="h-4 w-4" />
                    Create Course
                  </Link>
                </Button>
              </div>
            </div>
          </motion.header>

          {error && (
            <Card className="border-rose-500/30 bg-rose-500/[0.07] glass-subtle">
              <CardContent className="py-3 text-sm text-rose-300/90">{error}</CardContent>
            </Card>
          )}

          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.map((c, i) => {
              const Icon = c.icon
              return (
                <motion.div
                  key={c.label}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 + i * 0.06 }}
                >
                  <Card className={`group relative overflow-hidden bg-gradient-to-br ${c.from} border hover-lift hover:shadow-glow`}>
                    <div className={`pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-gradient-to-br ${c.ring} blur-2xl opacity-60 transition-opacity group-hover:opacity-100`} />
                    <CardContent className="relative p-5">
                      <div className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-background/50 ring-1 ring-inset ring-white/10">
                        <Icon className={`h-5 w-5 ${c.tint}`} />
                      </div>
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider">{c.label}</p>
                      {loading ? (
                        <div className="mt-1.5 h-7 w-14 shimmer rounded-md" />
                      ) : (
                        <p className="font-display text-3xl font-bold mt-0.5 tabular-nums">{c.value}</p>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </div>

          {/* Your Courses + insights */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-300" />
                <h2 className="font-display text-xl font-semibold">Your Courses</h2>
                {!loading && (
                  <span className="text-sm text-muted-foreground">({courses.length})</span>
                )}
              </div>
              <Button asChild variant="ghost" size="sm" className="gap-1 text-muted-foreground hover:text-foreground">
                <Link href="/admin/courses/new">
                  <Plus className="h-3.5 w-3.5" />
                  New
                </Link>
              </Button>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[0, 1, 2, 3].map((i) => (
                  <div key={i} className="card-premium p-4 flex gap-4">
                    <div className="h-20 w-28 shrink-0 rounded-xl shimmer" />
                    <div className="flex-1 space-y-2 py-1">
                      <div className="h-4 w-2/3 shimmer rounded-md" />
                      <div className="h-3 w-1/2 shimmer rounded-md" />
                      <div className="h-8 w-full shimmer rounded-md mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : courses.length === 0 ? (
              <Card className="card-premium">
                <CardContent className="py-16 text-center">
                  <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-violet-500/10 ring-1 ring-inset ring-white/10 animate-float">
                    <Sparkles className="h-8 w-8 text-indigo-300/80" />
                  </div>
                  <h3 className="font-display text-lg font-semibold">Create your first course</h3>
                  <p className="text-sm text-muted-foreground mt-1 mb-6 max-w-sm mx-auto">
                    Build a course with levels, videos, and quizzes. Once published it appears
                    in the catalog for learners to enroll — and your insights show up here.
                  </p>
                  <Button asChild variant="glow" className="gap-1.5">
                    <Link href="/admin/courses/new">
                      <Plus className="h-4 w-4" />
                      Create Course
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map((course, i) => {
                  const ins = byId.get(course.id)
                  const enrollments = ins?.enrollments ?? 0
                  const completions = ins?.completions ?? 0
                  const avgProgress = ins?.avgProgress ?? 0
                  const passRate = ins?.passRate ?? 0
                  return (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: Math.min(i * 0.05, 0.3) }}
                    >
                      <Card className="card-premium group h-full">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-4">
                            <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-xl ring-1 ring-inset ring-white/10 bg-gradient-to-br from-indigo-500/15 to-violet-500/10">
                              {course.imageUrl ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={course.imageUrl} alt={course.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <BookOpen className="h-7 w-7 text-indigo-300/40" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="truncate font-display text-base font-semibold">{course.title}</h3>
                              <div className="mt-1 flex flex-wrap items-center gap-1.5">
                                <Badge variant="secondary" className="text-[10px] capitalize">{course.category}</Badge>
                                <Badge variant="outline" className="text-[10px] capitalize">{course.difficulty}</Badge>
                                <span className="chip !px-2 !py-0.5"><Layers className="h-3 w-3" />{course.levels?.length ?? 0}</span>
                              </div>
                            </div>
                          </div>

                          {/* Insight chips */}
                          <div className="mt-4 grid grid-cols-4 gap-2 text-center">
                            <Stat icon={Users} value={enrollments} label="Students" tint="text-cyan-300" />
                            <Stat icon={Target} value={`${Math.round(avgProgress)}%`} label="Progress" tint="text-emerald-300" />
                            <Stat icon={CheckCircle2} value={completions} label="Done" tint="text-violet-300" />
                            <Stat icon={Award} value={`${passRate}%`} label="Pass" tint="text-amber-300" />
                          </div>

                          {/* Progress bar */}
                          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/8">
                            <div className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-violet-500" style={{ width: `${Math.min(100, Math.round(avgProgress))}%` }} />
                          </div>

                          {/* Actions */}
                          <div className="mt-4 flex items-center gap-2">
                            <Button asChild variant="glass" size="sm" className="flex-1 gap-1.5">
                              <Link href={`/admin/courses/${course.id}/edit`}>
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                              </Link>
                            </Button>
                            <Button asChild variant="ghost" size="sm" className="flex-1 gap-1.5 text-muted-foreground hover:text-foreground">
                              <Link href={`/courses/${course.id}`}>
                                <Eye className="h-3.5 w-3.5" />
                                View
                              </Link>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </section>

          {/* Manage all link */}
          {!loading && courses.length > 0 && (
            <Link href="/admin/courses" className="block">
              <Card className="card-premium group cursor-pointer">
                <CardContent className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <span className="grid h-11 w-11 place-items-center rounded-xl bg-indigo-500/15 ring-1 ring-inset ring-white/10 group-hover:bg-indigo-500/25 transition-colors">
                      <ShieldCheck className="h-5 w-5 text-indigo-300" />
                    </span>
                    <div>
                      <p className="font-medium">Manage all courses</p>
                      <p className="text-xs text-muted-foreground mt-0.5">Edit, delete, and browse the full catalog</p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-foreground" />
                </CardContent>
              </Card>
            </Link>
          )}
        </div>
      </main>
    </div>
  )
}

function Stat({ icon: Icon, value, label, tint }: { icon: any; value: React.ReactNode; label: string; tint: string }) {
  return (
    <div className="rounded-lg bg-white/[0.03] py-2 ring-1 ring-inset ring-white/5">
      <Icon className={`mx-auto h-3.5 w-3.5 ${tint}`} />
      <p className="mt-1 font-display text-sm font-semibold tabular-nums leading-none">{value}</p>
      <p className="mt-0.5 text-[9px] uppercase tracking-wide text-muted-foreground">{label}</p>
    </div>
  )
}
