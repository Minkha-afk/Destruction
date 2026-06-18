"use client"

import { useState, useEffect, useCallback } from 'react';
import { API_BASE_URLS, apiFetch } from '@/lib/api-config';
import type { ExploreCourse, ExploreFilters, ExplorePagination } from '../types';

const DEFAULT_PAGINATION: ExplorePagination = { page: 1, limit: 12, total: 0, pages: 1 };
const DEFAULT_COURSE_IMAGE = "/images/courses/react-foundations.jpg";

export function useExploreCourses(filters?: ExploreFilters) {
    const [courses, setCourses] = useState<ExploreCourse[]>([]);
    const [pagination, setPagination] = useState<ExplorePagination>(DEFAULT_PAGINATION);
    const [categories, setCategories] = useState<string[]>([]);
    const [difficulties, setDifficulties] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load metadata (categories + difficulties) once
    useEffect(() => {
        Promise.all([
            apiFetch<string[]>('/courses/categories', {}, API_BASE_URLS.catalog),
            apiFetch<string[]>('/courses/difficulties', {}, API_BASE_URLS.catalog),
        ]).then(([cats, diffs]) => {
            setCategories(Array.isArray(cats) ? cats.filter(Boolean) : []);
            setDifficulties(Array.isArray(diffs) ? diffs.filter(Boolean) : []);
        }).catch(() => {});
    }, []);

    const search     = filters?.search     ?? '';
    const category   = filters?.category   ?? '';
    const difficulty = filters?.difficulty ?? '';
    const page       = filters?.page       ?? 1;
    const limit      = filters?.limit      ?? 12;

    const fetchCourses = useCallback(async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (search)     params.set('search', search);
            if (category)   params.set('category', category);
            if (difficulty) params.set('difficulty', difficulty);
            params.set('page',  String(page));
            params.set('limit', String(limit));

            const data = await apiFetch<{ courses: any[]; pagination: any }>(
                `/courses?${params.toString()}`,
                {},
                API_BASE_URLS.catalog
            );
            const mapped: ExploreCourse[] = (data.courses || []).map((c: any) => ({
                id:            c.id,
                title:         c.title,
                category:      c.category,
                difficulty:    c.difficulty,
                instructor:    c.instructor,
                image:         c.imageUrl || DEFAULT_COURSE_IMAGE,
                description:   c.description,
                levels:        Array.isArray(c.levels) ? c.levels.length : 0,
                price:         typeof c.price === 'number' ? (c.price === 0 ? 'Free' : `$${c.price}`) : 'Free',
                rating:        c.rating,
                totalStudents: c.totalStudents,
                tags:          c.tags,
            }));
            setCourses(mapped);
            setPagination(data.pagination ?? DEFAULT_PAGINATION);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to load courses');
        } finally {
            setLoading(false);
        }
    }, [search, category, difficulty, page, limit]);

    useEffect(() => { fetchCourses(); }, [fetchCourses]);

    return { courses, pagination, categories, difficulties, loading, error, refetch: fetchCourses };
}
