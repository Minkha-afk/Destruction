// Courses feature public API
// Components
export { CourseCard } from './components/CourseCard';
export { CourseDetail } from './components/CourseDetail';
export { LevelCard } from './components/LevelCard';
export { LevelContent } from './components/LevelContent';
export { ProgressRing } from './components/ProgressRing';
export { QuizForm } from './components/QuizForm';
export { CompletionCard } from './components/CompletionCard';

// Composables
export {
    useCourses,
    useCourse,
    useCourseLevels,
    useLevelQuiz,
    useUserCourses,
    useUserEnrollments,
    useEnrolledCourseDetails,
} from './composables/useCourses';

// Types
export type {
    Course,
    CourseTag,
    Level,
    LevelUserProgress,
    EnrolledCourseDetails,
    Resource,
    Quiz,
    QuizQuestion,
    QuizOption,
    QuizAttempt,
    Progress,
    CourseProgress,
} from './types';
