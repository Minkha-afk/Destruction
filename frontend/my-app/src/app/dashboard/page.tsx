"use client"

import "@/styles/global.css"
import "@/styles/dashboard.css"

import { Suspense } from "react"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"
import {
  Sidebar,
  ProfileCard,
  ProgressOverview,
  ContinueLearningCard,
  RecentActivity,
  AchievementsGrid,
  RecommendationsCarousel,
  useDashboard,
} from "@/features/dashboard"
import { useAuth } from "@/features/auth"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Star,
  Clock,
  Users,
  BookOpen,
  TrendingUp,
  ListChecks,
  Sparkles,
  AlertTriangle,
} from "lucide-react"

export default function DashboardPage() {
  const { user: authUser } = useAuth()
  const {
    loading,
    error,
    stats,
    progressStats,
    nextLesson,
    activities,
    recommendations,
    featuredCourses,
    badges,
    certificates,
  } = useDashboard()

  const user = {
    name: authUser?.name ?? "Welcome",
    email: authUser?.email ?? "",
    avatar: "/student-avatar.png",
    stats,
  }

  const displayLesson = nextLesson ?? {
    course: "No course in progress",
    levelTitle: "Browse Explore to enroll in a course",
    thumbnail: "/images/courses/react-foundations.jpg",
    progress: 0,
    href: "/explore",
    actionLabel: "Browse Courses",
  }

  return (
    <div className="aurora-bg grid-overlay min-h-screen bg-background text-foreground overflow-x-hidden">
      <aside aria-label="Sidebar navigation" className="fixed left-0 top-0 z-10 h-full w-72 p-4 sidebar-glass">
        <Suspense>
          <Sidebar />
        </Suspense>
      </aside>

      <main className="ml-72 p-8">
        <div className="mx-auto max-w-7xl">
          {loading ? (
            <DashboardSkeleton />
          ) : (
            <>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 flex items-center gap-3 rounded-xl border border-rose-500/25 bg-rose-500/10 p-4 text-sm text-rose-200 backdrop-blur-md"
                  role="alert"
                >
                  <AlertTriangle className="h-4 w-4 shrink-0 text-rose-300" aria-hidden="true" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Hero greeting */}
              <motion.header
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="mb-7"
              >
                <span className="chip mb-3">
                  <Sparkles className="h-3 w-3" aria-hidden="true" />
                  {greeting()}
                </span>
                <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
                  Welcome back, <span className="text-gradient">{user.name}</span>
                </h1>
                <p className="mt-2 max-w-xl text-sm text-muted-foreground">
                  Here&apos;s a snapshot of your learning journey. Pick up where you left off and keep the momentum going.
                </p>

                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                  <HeroStat
                    icon={BookOpen}
                    label="Enrolled Courses"
                    value={stats.courses}
                    accent="from-indigo-500/25 to-blue-500/15 text-indigo-300"
                    delay={0.05}
                  />
                  <HeroStat
                    icon={TrendingUp}
                    label="Average Progress"
                    value={`${stats.progress}%`}
                    accent="from-violet-500/25 to-fuchsia-500/15 text-violet-300"
                    delay={0.12}
                  />
                  <HeroStat
                    icon={ListChecks}
                    label="Quiz Attempts"
                    value={stats.quizAttempts}
                    accent="from-cyan-500/25 to-teal-500/15 text-cyan-300"
                    delay={0.19}
                  />
                </div>
              </motion.header>

              <section
                aria-label="Welcome and progress"
                className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3"
              >
                <ProfileCard user={user} />
                <ProgressOverview progress={stats.progress} stats={progressStats} />
                <ContinueLearningCard lesson={displayLesson} />
              </section>

              <section
                aria-label="Recent activity and achievements"
                className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-3"
              >
                <div className="lg:col-span-2">
                  <RecentActivity
                    items={
                      activities.length > 0
                        ? activities
                        : [{ type: "enroll", title: "No activity yet - enroll in a course!", timestamp: "Now" }]
                    }
                  />
                </div>
                <div className="lg:col-span-1">
                  <AchievementsGrid badges={badges} certificates={certificates} />
                </div>
              </section>

              {recommendations.length > 0 && (
                <section aria-label="Recommendations">
                  <RecommendationsCarousel items={recommendations} />
                </section>
              )}

              {featuredCourses.length > 0 && (
                <motion.section
                  aria-label="Featured courses"
                  className="mt-6"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.14, ease: [0.22, 1, 0.36, 1] }}
                >
                  <h2 className="mb-4 flex items-center gap-2 font-display text-lg font-semibold">
                    <span className="grid h-7 w-7 place-items-center rounded-lg bg-gradient-to-br from-amber-500/25 to-orange-500/15 text-amber-300">
                      <Star className="h-4 w-4" />
                    </span>
                    Featured Courses
                  </h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {featuredCourses.map((course, idx) => (
                      <motion.div
                        key={course.id}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: 0.18 + idx * 0.06, ease: "easeOut" }}
                        whileHover={{ y: -6 }}
                      >
                        <Link href={`/courses/${course.id}`} className="block">
                          <Card className="card-premium group overflow-hidden border-0 bg-transparent p-0 shadow-none">
                            <CardContent className="p-0">
                              {course.imageUrl && (
                                <div className="relative h-36 overflow-hidden">
                                  <Image
                                    src={course.imageUrl}
                                    alt={course.title}
                                    fill
                                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                  />
                                  <div className="absolute inset-0 bg-gradient-to-t from-[#0b0a18] via-[#0b0a18]/20 to-transparent" />
                                </div>
                              )}
                              <div className="space-y-2.5 p-4">
                                <h3 className="truncate text-sm font-semibold">{course.title}</h3>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  {course.rating != null && (
                                    <span className="flex items-center gap-1">
                                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                      {course.rating.toFixed(1)}
                                    </span>
                                  )}
                                  {course.duration != null && (
                                    <span className="flex items-center gap-1">
                                      <Clock className="h-3 w-3" />
                                      {course.duration}h
                                    </span>
                                  )}
                                  {course.totalStudents != null && (
                                    <span className="flex items-center gap-1">
                                      <Users className="h-3 w-3" />
                                      {course.totalStudents.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                                <Badge
                                  variant="secondary"
                                  className="rounded-full border border-indigo-500/25 bg-indigo-500/12 text-xs capitalize text-indigo-200"
                                >
                                  {course.difficulty || "all levels"}
                                </Badge>
                              </div>
                            </CardContent>
                          </Card>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return "Good morning"
  if (h < 18) return "Good afternoon"
  return "Good evening"
}

function HeroStat({
  icon: Icon,
  label,
  value,
  accent,
  delay = 0,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number | string
  accent: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -3 }}
      className="neu group flex items-center gap-4 p-4"
    >
      <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${accent}`}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="font-display text-2xl font-bold tabular-nums leading-none">{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{label}</p>
      </div>
    </motion.div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      {/* Hero */}
      <div className="space-y-3">
        <div className="shimmer h-6 w-32 rounded-full" />
        <div className="shimmer h-9 w-72 rounded-lg" />
        <div className="shimmer h-4 w-96 max-w-full rounded" />
        <div className="grid grid-cols-1 gap-4 pt-2 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="neu flex items-center gap-4 p-4">
              <div className="shimmer h-11 w-11 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="shimmer h-5 w-16 rounded" />
                <div className="shimmer h-3 w-24 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card-premium h-56 p-5">
            <div className="flex items-center gap-4">
              <div className="shimmer h-14 w-14 rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="shimmer h-4 w-3/4 rounded" />
                <div className="shimmer h-3 w-1/2 rounded" />
              </div>
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {Array.from({ length: 3 }).map((_, j) => (
                <div key={j} className="shimmer h-16 rounded-xl" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Second row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="card-premium h-64 space-y-4 p-5 lg:col-span-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="shimmer h-16 rounded-xl" />
          ))}
        </div>
        <div className="card-premium h-64 p-5 lg:col-span-1">
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="shimmer h-20 rounded-2xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
