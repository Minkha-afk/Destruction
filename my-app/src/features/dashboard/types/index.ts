// Dashboard feature type definitions

export interface DashboardUser {
    name: string;
    email: string;
    avatar: string;
    stats: UserStats;
}

export interface UserStats {
    courses: number;
    progress: number;
    quizAttempts: number;
}

export interface ProgressStats {
    attempts: number;
    avgScore: number;
    passed: number;
    failed: number;
}

export interface Lesson {
    courseId?: string;
    levelId?: string | null;
    course: string;
    levelTitle: string;
    thumbnail: string;
    progress: number;
    href?: string;
    actionLabel?: string;
}

export type ActivityItem =
    | { type: 'quiz'; title: string; timestamp: string; occurredAt?: string; score: number; status: 'Passed' | 'Failed' }
    | { type: 'level'; title: string; timestamp: string; occurredAt?: string }
    | { type: 'enroll'; title: string; timestamp: string; occurredAt?: string };

export interface Badge {
    id: string;
    label: string;
    icon: 'sparkles' | 'flame' | 'zap';
}

export interface Certificate {
    id: string;
    title: string;
    date: string;
}

export interface Recommendation {
    id: string;
    title: string;
    instructor: string;
    category: string;
    thumbnail: string;
}

export interface FeaturedCourse {
    id: string;
    title: string;
    imageUrl: string;
    rating: number | null;
    duration: number | null;
    totalStudents: number | null;
    difficulty: string | null;
}

export interface DashboardPayload {
    stats: UserStats;
    progressStats: ProgressStats;
    nextLesson: Lesson | null;
    activities: ActivityItem[];
    enrolledCourseIds: string[];
    recommendations: Recommendation[];
    featuredCourses: FeaturedCourse[];
    badges: Badge[];
    certificates: Certificate[];
}
