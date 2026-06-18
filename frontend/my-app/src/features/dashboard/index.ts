// Dashboard feature public API
// Components
export { Sidebar } from './components/Sidebar';
export { ProfileCard } from './components/ProfileCard';
export { ProgressOverview } from './components/ProgressOverview';
export { ProgressRing } from './components/ProgressRing';
export { ContinueLearningCard } from './components/ContinueLearningCard';
export { RecentActivity } from './components/RecentActivity';
export { AchievementsGrid } from './components/AchievementsGrid';
export { RecommendationsCarousel } from './components/RecommendationsCarousel';

// Composables
export { useDashboard } from './composables/useDashboard';

// Types
export type {
    DashboardUser,
    UserStats,
    ProgressStats,
    Lesson,
    ActivityItem,
    Badge,
    Certificate,
    Recommendation,
    FeaturedCourse,
    DashboardPayload,
} from './types';
