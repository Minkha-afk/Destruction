import axios from "axios";

// Base URL of Catalog Service (read-only content)
const CATALOG_SERVICE_URL = process.env.CATALOG_SERVICE_URL || "http://localhost:7000";

// Shared secret for internal-only endpoints (e.g. quiz grading). Must match the
// catalog-service INTERNAL_API_SECRET.
const INTERNAL_API_SECRET = process.env.INTERNAL_API_SECRET;

// Single axios instance: consistent base URL + a request timeout so a slow or
// unreachable catalog can't hang learning-service requests indefinitely.
const http = axios.create({
  baseURL: CATALOG_SERVICE_URL,
  timeout: 8000,
});

/**
 * Catalog Service Client
 * This is a READ-ONLY client to fetch content from the catalog-service.
 * All user state (enrollment, progress, attempts) is owned by THIS service (learning-service).
 */
export const catalogService = {
    /**
     * Get a course with all its levels, quizzes, questions, and options.
     * Used to hydrate user's enrolled courses with content.
     */
    async getCourse(courseId: string) {
        try {
            const { data } = await http.get(`/courses/${courseId}`);
            return data;
        } catch (error: any) {
            console.error(`[CatalogService] Error fetching course ${courseId}:`, error?.message || error);
            return null;
        }
    },

    /**
     * Get all courses (paginated) for browsing.
     * Returns { courses: [...], pagination: {...} }
     */
    async getAllCourses(params?: { page?: number; limit?: number; search?: string; category?: string; difficulty?: string }) {
        try {
            const { data } = await http.get(`/courses`, { params });
            return data;
        } catch (error: any) {
            console.error('[CatalogService] Error fetching all courses:', error?.message || error);
            return { courses: [], pagination: { page: 1, limit: 12, total: 0, pages: 0 } };
        }
    },

    /**
     * Get featured courses for homepage.
     */
    async getFeaturedCourses() {
        try {
            const { data } = await http.get(`/courses/featured`);
            return data;
        } catch (error: any) {
            console.error('[CatalogService] Error fetching featured courses:', error?.message || error);
            return [];
        }
    },

    /**
     * Get quiz structure with questions and options.
     * IMPORTANT: This returns options WITHOUT isCorrect flag (for user display).
     */
    async getQuiz(quizId: string) {
        try {
            const { data } = await http.get(`/quizzes/${quizId}`);
            return data;
        } catch (error: any) {
            console.error(`[CatalogService] Error fetching quiz ${quizId}:`, error?.message || error);
            return null;
        }
    },

    /**
     * Get quiz with correct answers for grading.
     * INTERNAL USE ONLY - authenticated with the shared internal secret.
     */
    async getQuizForGrading(quizId: string) {
        try {
            const { data } = await http.get(`/quizzes/${quizId}/grade`, {
                headers: INTERNAL_API_SECRET ? { "x-internal-secret": INTERNAL_API_SECRET } : undefined,
            });
            return data;
        } catch (error: any) {
            console.error(`[CatalogService] Error fetching quiz for grading ${quizId}:`, error?.message || error);
            return null;
        }
    },

    /**
     * Get categories list.
     */
    async getCategories() {
        try {
            const { data } = await http.get(`/courses/categories`);
            return data;
        } catch (error: any) {
            console.error('[CatalogService] Error fetching categories:', error?.message || error);
            return [];
        }
    },

    /**
     * Get difficulties list.
     */
    async getDifficulties() {
        try {
            const { data } = await http.get(`/courses/difficulties`);
            return data;
        } catch (error: any) {
            console.error('[CatalogService] Error fetching difficulties:', error?.message || error);
            return [];
        }
    },

    /**
     * Search courses by title.
     */
    async searchCourses(title: string) {
        try {
            const { data } = await http.get(`/courses/search`, { params: { title } });
            return data;
        } catch (error: any) {
            console.error('[CatalogService] Error searching courses:', error?.message || error);
            return [];
        }
    }
};
