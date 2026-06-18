/**
 * Course Service API wrapper
 * Covers all learning-service (port 6000) interactions:
 * enrollment, progress, quiz start/submit
 */

import { API_BASE_URLS, apiFetch } from '@/lib/api-config';
import type { DashboardPayload } from '@/features/dashboard/types';

const BASE = API_BASE_URLS.course; // http://localhost:6000

export const courseService = {
  // ── Enrollment ─────────────────────────────────────────────────────────────

  /**
   * Enroll a user in a course
   */
  enroll: (userId: string, courseId: string) =>
    apiFetch('/courses/enroll', { method: 'POST', body: JSON.stringify({ userId, courseId }) }, BASE),

  /**
   * Check enrollment status for a user + course
   * Returns { isEnrolled: boolean, enrollment: Enrollment | null }
   */
  checkEnrollment: (userId: string, courseId: string) =>
    apiFetch<{ isEnrolled: boolean; enrollment: any | null }>(
      `/courses/user/${userId}/course/${courseId}/status`,
      {},
      BASE,
    ),

  /**
   * Get enrolled course details WITH per-level progress merged
   * Returns { enrollment, course (levels include userProgress), progressSummary }
   */
  getEnrolledCourseDetails: (userId: string, courseId: string) =>
    apiFetch<any>(`/courses/user/${userId}/course/${courseId}`, {}, BASE),

  /**
   * Get all courses a user is enrolled in
   * Returns { enrollments: Array<{ course, progressDetails, ... }>, totalEnrolled }
   */
  getUserCourses: (userId: string) =>
    apiFetch<{ enrollments: any[]; totalEnrolled: number }>(
      `/courses/user/${userId}`,
      {},
      BASE,
    ),

  /**
   * Unenroll a user from a course
   */
  unenroll: (userId: string, courseId: string) =>
    apiFetch(`/courses/user/${userId}/course/${courseId}`, { method: 'DELETE' }, BASE),

  // ── Progress ───────────────────────────────────────────────────────────────

  /**
   * Get overall progress for all courses a user is enrolled in
   */
  getProgress: (userId: string) =>
    apiFetch<any[]>(`/progress/user/${userId}`, {}, BASE),

  /**
   * Get progress for a specific course
   * Returns { courseId, courseTitle, overallProgress, completedLevels, totalLevels, levels }
   */
  getCourseProgress: (userId: string, courseId: string) =>
    apiFetch<{
      courseId: string;
      courseTitle: string;
      enrolledAt: string;
      status: string;
      overallProgress: number;
      completedLevels: number;
      totalLevels: number;
      levels: Array<{
        levelId: string;
        levelTitle: string;
        levelOrder: number;
        isUnlocked: boolean;
        isCompleted: boolean;
        completedAt: string | null;
        quizAttempts: number;
        bestScore: number | null;
        passed: boolean;
      }>;
    }>(`/progress/user/${userId}/course/${courseId}`, {}, BASE),

  /**
   * Reset progress for a course
   */
  resetProgress: (userId: string, courseId: string) =>
    apiFetch(`/progress/user/${userId}/course/${courseId}/reset`, { method: 'DELETE' }, BASE),

  // ── Quiz ───────────────────────────────────────────────────────────────────

  /**
   * Start a quiz attempt
   * Returns { attempt, quiz }
   */
  startQuiz: (userId: string, courseId: string, levelId: string, quizId: string) =>
    apiFetch<{ message: string; attempt: any; quiz: any }>(
      '/quiz/start',
      { method: 'POST', body: JSON.stringify({ userId, courseId, levelId, quizId }) },
      BASE,
    ),

  /**
   * Submit quiz answers and get results
   * Returns { attempt, results: { score, passed, totalPoints, ... } }
   */
  submitQuiz: (
    attemptId: string,
    answers: Array<{ questionId: string; optionId: string }>,
  ) =>
    apiFetch<{ message: string; attempt: any; results: { score: number; passed: boolean; totalPoints: number; maxPoints: number; correctAnswers: number; totalQuestions: number; requiredScore: number } }>(
      '/quiz/submit',
      { method: 'POST', body: JSON.stringify({ attemptId, answers }) },
      BASE,
    ),

  /**
   * Get quiz results for an attempt
   */
  getQuizResults: (attemptId: string) =>
    apiFetch<{ attempt: any; quiz: any }>(`/quiz/results/${attemptId}`, {}, BASE),

  /**
   * Get a user's full quiz history
   */
  getUserQuizHistory: (userId: string, courseId?: string) => {
    const params = courseId ? `?courseId=${courseId}` : '';
    return apiFetch<any[]>(`/quiz/user/${userId}/history${params}`, {}, BASE);
  },

  /**
   * Get quiz statistics (attempts, pass rate, avg score)
   */
  getQuizStats: (quizId: string) =>
    apiFetch<{ quizId: string; totalAttempts: number; passedAttempts: number; passRate: number; averageScore: number }>(
      `/quiz/${quizId}/stats`,
      {},
      BASE,
    ),

  /**
   * Get the complete dashboard payload for a user.
   */
  getDashboard: (userId: string) =>
    apiFetch<DashboardPayload>(`/dashboard/user/${userId}`, {}, BASE),

  /**
   * Teacher insights: enrollment + quiz analytics aggregated for a set of courses.
   * Returns { totals, perCourse: [{ courseId, enrollments, completions, ... }] }.
   */
  getCourseInsights: (courseIds: string[]) =>
    apiFetch<{
      totals: {
        courses: number;
        totalEnrollments: number;
        activeLearners: number;
        completions: number;
        avgProgress: number;
        totalAttempts: number;
        passedAttempts: number;
        passRate: number;
        avgScore: number;
      };
      perCourse: Array<{
        courseId: string;
        enrollments: number;
        activeLearners: number;
        completions: number;
        avgProgress: number;
        attempts: number;
        passedAttempts: number;
        passRate: number;
        avgScore: number;
      }>;
    }>('/insights/courses', { method: 'POST', body: JSON.stringify({ courseIds }) }, BASE),
};
