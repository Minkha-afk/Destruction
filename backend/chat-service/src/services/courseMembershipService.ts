import Enrollment from "../models/Enrollment";

export interface CourseChatChannel {
  courseId: string;
  title: string;
  description?: string | null;
  thumbnail?: string | null;
  enrolledAt?: Date | string;
}

type EnrollmentRow = {
  courseId: string;
  enrolledAt: Date;
  status: string;
};

type CourseServiceEnrollment = {
  courseId: string;
  enrolledAt?: string;
  status?: string;
  course?: {
    id?: string;
    title?: string;
    description?: string | null;
    imageUrl?: string | null;
    thumbnail?: string | null;
  } | null;
};

const COURSE_SERVICE_URL = process.env.COURSE_SERVICE_URL || "http://localhost:6100";

export const isUserEnrolledInCourse = async (userId: string, courseId: string) => {
  return !!(await Enrollment.findOne({ userId, courseId, status: "active" }).lean());
};

const getEnrollmentRows = async (userId: string): Promise<EnrollmentRow[]> => {
  const rows = await Enrollment.find({ userId, status: "active" })
    .sort({ enrolledAt: -1 })
    .lean();

  return rows.map((row: any) => ({
    courseId: row.courseId,
    enrolledAt: row.enrolledAt,
    status: row.status,
  }));
};

const mapServiceEnrollment = (enrollment: CourseServiceEnrollment): CourseChatChannel | null => {
  if (enrollment.status && enrollment.status !== "active") return null;

  const courseId = enrollment.courseId || enrollment.course?.id;
  if (!courseId) return null;

  return {
    courseId,
    title: enrollment.course?.title || courseId,
    description: enrollment.course?.description || null,
    thumbnail: enrollment.course?.imageUrl || enrollment.course?.thumbnail || null,
    enrolledAt: enrollment.enrolledAt,
  };
};

export const getUserCourseChannels = async (userId: string): Promise<CourseChatChannel[]> => {
  try {
    const response = await fetch(`${COURSE_SERVICE_URL}/courses/user/${encodeURIComponent(userId)}`);

    if (response.ok) {
      const data = (await response.json()) as { enrollments?: CourseServiceEnrollment[] };
      return (data.enrollments || [])
        .map(mapServiceEnrollment)
        .filter((channel): channel is CourseChatChannel => Boolean(channel));
    }
  } catch (error) {
    console.warn("[chat-service] Falling back to enrollment rows for chat channels", error);
  }

  const enrollments = await getEnrollmentRows(userId);
  return enrollments.map((enrollment) => ({
    courseId: enrollment.courseId,
    title: enrollment.courseId,
    enrolledAt: enrollment.enrolledAt,
  }));
};
