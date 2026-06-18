// Courses feature type definitions

export interface CourseTag {
    id: string;
    name: string;
    color?: string;
}

export interface Course {
    id: string;
    title: string;
    category: string;
    instructor: string;
    description: string;
    thumbnail?: string;
    videoId?: string;
    levels: Level[];
    resources?: Resource[];
    difficulty?: string;
    price?: number;
    rating?: number;
    duration?: number;       // hours
    totalStudents?: number;
    tags?: CourseTag[];
}

export interface LevelUserProgress {
    isUnlocked: boolean;
    isCompleted: boolean;
    completedAt: string | null;
    quizAttempts: number;
    bestScore: number | null;
    passed: boolean;
}

export interface Level {
    id: string;
    title: string;
    description: string;
    order: number;
    courseId: string;
    content?: string;        // detailed learning content (may be markdown)
    videoUrl?: string;       // YouTube or other video link
    duration?: number;       // minutes
    materials?: Resource[];
    quizzes?: Quiz[];
    userProgress?: LevelUserProgress; // present when fetched via getEnrolledCourseDetails
}

export interface EnrolledCourseDetails {
    enrollment: {
        id: string;
        enrolledAt: string;
        status: string;
        progress: number;
    };
    course: Course;
    progressSummary: {
        completedLevels: number;
        totalLevels: number;
        percentComplete: number;
        isCompleted: boolean;
    };
}

export interface Resource {
    title: string;
    href: string;
}

export interface Quiz {
    id: string;
    courseId: string;
    levelId: string;
    title: string;
    description?: string;
    passingPercent: number;
    timeLimit?: number;
    questions: QuizQuestion[];
}

export interface QuizQuestion {
    id: string;
    prompt: string;
    options: QuizOption[];
    correctId: string;
    points?: number;
}

export interface QuizOption {
    id: string;
    text: string;
    optionText?: string;
}

export interface QuizAttempt {
    id: string;
    userId: string;
    courseId: string;
    levelId: string;
    quizId: string;
    startedAt: string;
    completedAt?: string;
    score?: number;
    passed?: boolean;
    status: 'in_progress' | 'completed' | 'abandoned';
    timeTaken?: number;
}

export interface Progress {
    id: string;
    userId: string;
    courseId: string;
    levelId: string;
    score?: number;
    passed: boolean;
    unlocked: boolean;
}

export interface CourseProgress {
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
}
export interface CourseProgressSummary {
    completedLevelIds: string[];
    percent: number;
}

export interface QuizAttemptDetail {
    id: string;
    quizId: string;
    quizTitle: string;
    courseId: string;
    levelId: string;
    userId: string;
    score: number | null;
    passed: boolean;
    status: string;
    startedAt: string;
    completedAt: string | null;
    answers: Array<{
        id: string;
        questionId: string;
        optionId: string;
        isCorrect: boolean;
    }>;
}

export interface QuizStats {
    quizId: string;
    totalAttempts: number;
    passedAttempts: number;
    passRate: number;
    averageScore: number;
}
