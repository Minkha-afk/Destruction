// Explore feature type definitions

export interface ExploreCourse {
    id: string;
    title: string;
    category: string;
    difficulty?: string;
    instructor: string;
    image: string;
    description: string;
    levels: number;
    price: string;
    rating?: number;
    totalStudents?: number;
    tags?: Array<{ id: string; name: string; color?: string }>;
}

export interface ExploreFilters {
    search?: string;
    category?: string;
    difficulty?: string;
    page?: number;
    limit?: number;
}

export interface ExplorePagination {
    page: number;
    limit: number;
    total: number;
    pages: number;
}
