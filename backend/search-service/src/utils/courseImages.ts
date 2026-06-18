const COURSE_IMAGE_PATHS: Record<string, string> = {
  "react-foundations": "/images/courses/react-foundations.jpg",
  "typescript-essentials": "/images/courses/typescript-essentials.jpg",
  "nextjs-app-router": "/images/courses/nextjs-app-router.jpg",
  "nodejs-backend": "/images/courses/nodejs-backend.jpg",
  "python-fundamentals": "/images/courses/python-fundamentals.jpg",
};

const LEGACY_IMAGE_MATCHES: Array<{ token: string; path: string }> = [
  { token: "photo-1633356122544-f134324a6cee", path: COURSE_IMAGE_PATHS["react-foundations"] },
  { token: "photo-1516259762381-22954d7d3ad2", path: COURSE_IMAGE_PATHS["typescript-essentials"] },
  { token: "photo-1555066931-4365d14bab8c", path: COURSE_IMAGE_PATHS["nextjs-app-router"] },
  { token: "photo-1558494949-ef010cbdcc31", path: COURSE_IMAGE_PATHS["nodejs-backend"] },
  { token: "photo-1526379095098-d400fd0bf935", path: COURSE_IMAGE_PATHS["python-fundamentals"] },
];

export const getLocalCourseImageUrl = (courseId?: string | null, imageUrl?: string | null) => {
  if (courseId && COURSE_IMAGE_PATHS[courseId]) return COURSE_IMAGE_PATHS[courseId];
  if (!imageUrl) return imageUrl;
  if (imageUrl.startsWith("/images/courses/")) return imageUrl;

  const legacyMatch = LEGACY_IMAGE_MATCHES.find((entry) => imageUrl.includes(entry.token));
  return legacyMatch?.path || imageUrl;
};

export const withLocalCourseImage = <T extends { id?: string | null; imageUrl?: string | null }>(course: T): T => ({
  ...course,
  imageUrl: getLocalCourseImageUrl(course.id, course.imageUrl),
});
