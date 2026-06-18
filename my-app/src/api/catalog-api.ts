/**
 * Catalog Service API wrapper (search-service, port 7000)
 * Covers:
 *  - Course browsing (getAllCourses, getCourseById, searchCourses, getFeatured)
 *  - Admin CRUD (create, update, delete)
 *  - Categories & difficulties
 */

import { API_BASE_URLS, apiFetch } from '@/lib/api-config';

const BASE = API_BASE_URLS.catalog; // http://localhost:7000

export interface CatalogCourseInput {
  courseData: {
    id?: string;
    title: string;
    description: string;
    instructor: string;
    difficulty?: string;
    category?: string;
    duration?: number;
    price?: number;
    imageUrl?: string;
  };
  // IDs are optional throughout: when present on update, the backend reconciles
  // the existing record in place (preserving learner progress); when absent it
  // creates new content.
  levels?: Array<{
    id?: string;
    title: string;
    description: string;
    order: number;
    content?: string;
    videoUrl?: string;
    duration?: number;
    requiredScore?: number;
    quizzes?: Array<{
      id?: string;
      title: string;
      description?: string;
      passingScore?: number;
      timeLimit?: number;
      questions?: Array<{
        id?: string;
        questionText: string;
        questionType?: string;
        points?: number;
        options: Array<{
          id?: string;
          optionText: string;
          isCorrect: boolean;
        }>;
      }>;
    }>;
  }>;
  tags?: string[];
}

export interface CatalogTag {
  id: string;
  name: string;
  color: string;
}

export const catalogAPI = {
  // ── Browse ─────────────────────────────────────────────────────────────

  getAllCourses: (params?: {
    search?: string;
    category?: string;
    difficulty?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: string;
  }) => {
    const q = new URLSearchParams();
    if (params?.search) q.set('search', params.search);
    if (params?.category) q.set('category', params.category);
    if (params?.difficulty) q.set('difficulty', params.difficulty);
    if (params?.page) q.set('page', String(params.page));
    if (params?.limit) q.set('limit', String(params.limit));
    if (params?.sortBy) q.set('sortBy', params.sortBy);
    if (params?.order) q.set('order', params.order);
    const qs = q.toString();
    return apiFetch<{ courses: any[]; pagination: any }>(`/courses${qs ? `?${qs}` : ''}`, {}, BASE);
  },

  getCourseById: (id: string) =>
    apiFetch<any>(`/courses/${id}`, {}, BASE),

  /**
   * Admin: load a course for editing INCLUDING which options are correct.
   * Requires authentication (token is attached automatically).
   */
  getCourseForManage: (id: string) =>
    apiFetch<any>(`/courses/${id}/manage`, {}, BASE),

  /**
   * Teacher: courses owned by the authenticated teacher (requires auth token).
   */
  getMyCourses: () =>
    apiFetch<any[]>('/courses/mine', {}, BASE),

  getTags: () =>
    apiFetch<CatalogTag[]>('/courses/tags', {}, BASE),

  searchCourses: (title: string) =>
    apiFetch<any[]>(`/courses/search?title=${encodeURIComponent(title)}`, {}, BASE),

  getFeaturedCourses: () =>
    apiFetch<any[]>('/courses/featured', {}, BASE),

  getCategories: () =>
    apiFetch<string[]>('/courses/categories', {}, BASE),

  getDifficulties: () =>
    apiFetch<string[]>('/courses/difficulties', {}, BASE),

  // ── Admin CRUD ─────────────────────────────────────────────────────────

  createCourse: (data: CatalogCourseInput) =>
    apiFetch<{ message: string; course: any }>(
      '/courses',
      { method: 'POST', body: JSON.stringify(data) },
      BASE,
    ),

  updateCourse: (id: string, data: Partial<CatalogCourseInput>) =>
    apiFetch<{ message: string; course: any }>(
      `/courses/${id}`,
      { method: 'PUT', body: JSON.stringify(data) },
      BASE,
    ),

  deleteCourse: (id: string) =>
    apiFetch<{ message: string }>(
      `/courses/${id}`,
      { method: 'DELETE' },
      BASE,
    ),
};
