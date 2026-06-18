"use client"

import { useState, useEffect, useCallback } from 'react';
import type { Course, Level, Quiz, EnrolledCourseDetails } from '../types';
import { API_BASE_URLS, apiFetch } from '@/lib/api-config';
import { useAuth } from '@/features/auth';

const DEFAULT_COURSE_IMAGE = "/images/courses/react-foundations.jpg";

// Data mapping helpers
const mapCourse = (apiCourse: any): Course => ({
    id: apiCourse.id,
    title: apiCourse.title,
    category: apiCourse.category,
    instructor: apiCourse.instructor,
    description: apiCourse.description,
    thumbnail: apiCourse.imageUrl || DEFAULT_COURSE_IMAGE,
    levels: (apiCourse.levels || []).map(mapLevel),
    difficulty: apiCourse.difficulty,
    price: apiCourse.price,
    rating: apiCourse.rating,
    duration: apiCourse.duration,
    totalStudents: apiCourse.totalStudents,
    tags: apiCourse.tags,
});

const mapLevel = (apiLevel: any): Level => ({
    id: apiLevel.id,
    title: apiLevel.title,
    description: apiLevel.description,
    order: apiLevel.order,
    courseId: apiLevel.courseId,
    content: apiLevel.content ?? undefined,
    videoUrl: apiLevel.videoUrl ?? undefined,
    duration: apiLevel.duration ?? undefined,
    materials: [],
    quizzes: (apiLevel.quizzes || []).map(mapQuiz),
    userProgress: apiLevel.userProgress ?? undefined,
});

const mapQuiz = (apiQuiz: any): Quiz => ({
    id: apiQuiz.id,
    courseId: apiQuiz.courseId,
    levelId: apiQuiz.levelId,
    title: apiQuiz.title,
    description: apiQuiz.description,
    passingPercent: apiQuiz.passingScore,
    timeLimit: apiQuiz.timeLimit,
    questions: (apiQuiz.questions || []).map((q: any) => ({
        id: q.id,
        prompt: q.questionText,
        options: (q.options || []).map((o: any) => ({
            id: o.id,
            text: o.optionText || o.text
        })),
        correctId: '', // Not available in frontend
        points: q.points
    }))
});

export function useCourses() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCourses = useCallback(async () => {
        try {
            setLoading(true);
            // Fetch all courses from catalog service
            const data = await apiFetch<{ courses: any[] }>(
                '/courses',
                {},
                API_BASE_URLS.catalog
            );
            setCourses((data.courses || []).map(mapCourse));
            setError(null);
        } catch (err: any) {
            console.error(err);
            const message = err?.message || 'Failed to load courses';
            if (String(message).includes('Unable to reach backend')) {
                setError(`${message}. Make sure search-service is running on ${API_BASE_URLS.catalog}.`);
            } else {
                setError(message);
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    return { courses, loading, error, refetch: fetchCourses };
}

export function useCourse(courseId: string, options: { enabled?: boolean } = {}) {
    const enabled = options.enabled ?? true;
    const [course, setCourse] = useState<Course | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!courseId || !enabled) {
            setLoading(false);
            return;
        }
        const fetchCourse = async () => {
            try {
                setLoading(true);
                // Fetch from catalog service
                const data = await apiFetch<any>(
                    `/courses/${courseId}`,
                    {},
                    API_BASE_URLS.catalog
                );
                setCourse(mapCourse(data));
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to load course');
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [courseId, enabled]);

    return { course, loading, error };
}

export function useCourseLevels(courseId: string) {
    const { course, loading, error } = useCourse(courseId);
    return { levels: course?.levels || [], loading, error };
}

export function useLevelQuiz(courseId: string, levelId: string) {
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [attemptId, setAttemptId] = useState<string | null>(null);

    useEffect(() => {
        if (!courseId || !levelId) return;
        const fetchQuiz = async () => {
            try {
                setLoading(true);
                // Get Course to find Quiz ID for this level
                const courseData = await apiFetch<any>(
                    `/courses/${courseId}`,
                    {},
                    API_BASE_URLS.catalog
                );
                const level = courseData.levels?.find((l: any) => l.id === levelId);
                const quizData = level?.quizzes?.[0]; // Assume 1 quiz per level

                if (quizData) {
                    setQuiz(mapQuiz(quizData));
                } else {
                    setQuiz(null);
                }
                setError(null);
            } catch (err: any) {
                console.error(err);
                setError(err.message || 'Failed to load quiz');
            } finally {
                setLoading(false);
            }
        };
        fetchQuiz();
    }, [courseId, levelId]);

    return { quiz, loading, error, attemptId };
}

export function useUserCourses() {
    const { user } = useAuth();
    const userId = user?.id?.toString() ?? '';
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) { setLoading(false); return; }
        const load = async () => {
            try {
                setLoading(true);
                // Fetch user's enrolled courses from course service
                const data = await apiFetch<{ enrollments: any[] }>(
                    `/courses/user/${userId}`,
                    {},
                    API_BASE_URLS.course
                );
                // data.enrollments contains { course: ... }
                const mapped = (data.enrollments || []).map((e: any) => mapCourse(e.course));
                setCourses(mapped);
                setError(null);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [userId]);

    return { courses, loading, error };
}

/**
 * Get all courses a user is enrolled in, with per-course progress details.
 * Calls GET /courses/user/:userId on the learning service.
 */
export function useUserEnrollments() {
    const { user } = useAuth();
    const userId = user?.id?.toString() ?? '';
    type Enrollment = {
        id: string;
        courseId: string;
        enrolledAt: string;
        status: string;
        progress: number;
        course: Course | null;
        progressDetails: {
            completedLevels: number;
            totalLevels: number;
            percentComplete: number;
            currentLevelId: string | null;
        };
    };
    const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = useCallback(async () => {
        if (!userId) { setLoading(false); return; }
        try {
            setLoading(true);
            const data = await apiFetch<{ enrollments: any[]; totalEnrolled: number }>(
                `/courses/user/${userId}`,
                {},
                API_BASE_URLS.course
            );
            const mapped: Enrollment[] = (data.enrollments || []).map((e: any) => ({
                id: e.id,
                courseId: e.courseId,
                enrolledAt: e.enrolledAt,
                status: e.status,
                progress: e.progress ?? 0,
                course: e.course ? mapCourse(e.course) : null,
                progressDetails: {
                    completedLevels: e.progressDetails?.completedLevels ?? 0,
                    totalLevels: e.progressDetails?.totalLevels ?? 0,
                    percentComplete: e.progressDetails?.percentComplete ?? e.progress ?? 0,
                    currentLevelId: e.progressDetails?.currentLevelId ?? null,
                },
            }));
            setEnrollments(mapped);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to load enrollments');
        } finally {
            setLoading(false);
        }
    }, [userId]);

    useEffect(() => { load(); }, [load]);
    return { enrollments, loading, error, refetch: load };
}

/**
 * Fetch a course's full details merged with the user's progress.
 * Calls GET /courses/user/:userId/course/:courseId on the learning service.
 * Returns enrolled course details with levels that each carry `userProgress`.
 */
export function useEnrolledCourseDetails(courseId: string) {
    const { user } = useAuth();
    const userId = user?.id?.toString() ?? '';

    const [data, setData] = useState<EnrolledCourseDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [notEnrolled, setNotEnrolled] = useState(false);

    const refetch = useCallback(async () => {
        if (!userId || !courseId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setNotEnrolled(false);
            const result = await apiFetch<any>(
                `/courses/user/${userId}/course/${courseId}`,
                {},
                API_BASE_URLS.course
            );
            // Map the returned course (levels include userProgress from backend)
            const mappedCourse = {
                ...mapCourse(result.course),
                levels: (result.course.levels || []).map(mapLevel),
            };
            setData({ ...result, course: mappedCourse });
            setError(null);
        } catch (err: any) {
            if (err.message?.includes('404') || err.message?.includes('not found') || err.message?.includes('Enrollment not found')) {
                setNotEnrolled(true);
            } else {
                setError(err.message || 'Failed to load enrolled course details');
            }
        } finally {
            setLoading(false);
        }
    }, [userId, courseId]);

    useEffect(() => { refetch(); }, [refetch]);

    return { data, loading, error, notEnrolled, refetch };
}
