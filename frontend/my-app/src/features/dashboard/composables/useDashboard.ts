"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@/features/auth"
import { courseService } from "@/api/courseService"
import type {
    UserStats,
    ProgressStats,
    ActivityItem,
    Lesson,
    Recommendation,
    Badge,
    Certificate,
    DashboardPayload,
} from "../types"

export interface DashboardData {
    loading: boolean;
    error: string | null;
    stats: UserStats;
    progressStats: ProgressStats;
    nextLesson: Lesson | null;
    activities: ActivityItem[];
    enrolledCourseIds: Set<string>;
    recommendations: Recommendation[];
    featuredCourses: DashboardPayload["featuredCourses"];
    badges: Badge[];
    certificates: Certificate[];
}

const DEFAULT_STATS: UserStats = { courses: 0, progress: 0, quizAttempts: 0 }
const DEFAULT_PROGRESS_STATS: ProgressStats = { attempts: 0, avgScore: 0, passed: 0, failed: 0 }
const DEFAULT_DASHBOARD: DashboardPayload = {
    stats: DEFAULT_STATS,
    progressStats: DEFAULT_PROGRESS_STATS,
    nextLesson: null,
    activities: [],
    enrolledCourseIds: [],
    recommendations: [],
    featuredCourses: [],
    badges: [],
    certificates: [],
}

export function useDashboard(): DashboardData {
    const { user } = useAuth()
    const [dashboard, setDashboard] = useState<DashboardPayload>(DEFAULT_DASHBOARD)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (!user?.id) {
            setDashboard(DEFAULT_DASHBOARD)
            setLoading(false)
            return
        }

        const userId = user.id.toString()

        const load = async () => {
            try {
                setLoading(true)
                const data = await courseService.getDashboard(userId)
                setDashboard({
                    stats: data?.stats ?? DEFAULT_STATS,
                    progressStats: data?.progressStats ?? DEFAULT_PROGRESS_STATS,
                    nextLesson: data?.nextLesson ?? null,
                    activities: Array.isArray(data?.activities) ? data.activities : [],
                    enrolledCourseIds: Array.isArray(data?.enrolledCourseIds) ? data.enrolledCourseIds : [],
                    recommendations: Array.isArray(data?.recommendations) ? data.recommendations : [],
                    featuredCourses: Array.isArray(data?.featuredCourses) ? data.featuredCourses : [],
                    badges: Array.isArray(data?.badges) ? data.badges : [],
                    certificates: Array.isArray(data?.certificates) ? data.certificates : [],
                })
                setError(null)
            } catch (error: unknown) {
                setDashboard(DEFAULT_DASHBOARD)
                setError(error instanceof Error ? error.message : "Failed to load dashboard")
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [user?.id])

    const enrolledCourseIds = useMemo(
        () => new Set(dashboard.enrolledCourseIds),
        [dashboard.enrolledCourseIds],
    )

    return {
        loading,
        error,
        stats: dashboard.stats,
        progressStats: dashboard.progressStats,
        nextLesson: dashboard.nextLesson,
        activities: dashboard.activities,
        enrolledCourseIds,
        recommendations: dashboard.recommendations,
        featuredCourses: dashboard.featuredCourses,
        badges: dashboard.badges,
        certificates: dashboard.certificates,
    }
}
