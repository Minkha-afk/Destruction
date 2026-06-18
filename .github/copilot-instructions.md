# Copilot Instructions for AI Coding Agents

## Big Picture Architecture
- This is a multi-service MERN stack monorepo. Major services are in `backend/` (auth, chat, course, search, settings) and `frontend/` (Next.js app in `my-app/`).
- Backend services are organized as microservices, each with its own `src/`, `prisma/`, and API routes. Communication is via REST APIs.
- The frontend (`frontend/my-app`) uses React, Next.js, and React Query for data fetching. It consumes backend APIs via hooks in `src/hooks/` and API wrappers in `src/api/`.
- Data flows: User actions in frontend trigger React Query hooks, which call backend REST endpoints. Backend services use Prisma for DB access.

## Developer Workflows
- **Frontend**: Start with `npm run dev` in `frontend/my-app`. Main entry is `src/app/`.
- **Backend**: Each service (e.g., `auth-services`, `chat-service`, `course-service`) runs independently. Use `npm run dev` or `ts-node src/server.ts` in each service folder.
- **Database**: Prisma migrations per service. Run `npx prisma migrate dev` in the relevant `prisma/` folder.
- **API Contract**: See each service's `controllers/` and `routes/` for REST endpoints. Course and quiz endpoints are documented in `backend/search-service/course-search-service/README.md`.

## Project-Specific Conventions
- **Hooks**: All frontend data fetching/mutations use React Query hooks in `src/hooks/`. Example: `useCourses`, `useQuizResults` in `course.ts`.
- **API Wrappers**: Frontend API calls are abstracted in `src/api/` (e.g., `course-api.ts`). Hooks import these wrappers.
- **Prisma**: Each backend service has its own `prisma/schema.prisma` and migrations. No shared DB context.
- **TypeScript**: Used throughout. Types for API responses/mutations should be defined and reused.
- **Routes**: Backend REST routes are grouped by resource (e.g., `authRoutes.ts`, `courseRoutes.ts`).

## Integration Points & Patterns
- **Frontend ↔ Backend**: All communication is via REST. Endpoints are versioned and documented in service READMEs.
- **Quiz/Course Search**: See `backend/search-service/course-search-service/README.md` for endpoints and query params.
- **Authentication**: Auth handled by `auth-services`. Use JWT for protected routes.
- **Socket**: Chat service uses socket.io (`src/socket/chatSocket.ts`).

## Examples
- To fetch all courses: use `useCourses` hook in frontend, which calls `getAllCourses` in `course-api.ts`, hitting `/api/courses` on backend.
- To submit a quiz: use `useSubmitQuiz` hook, which calls `submitQuiz` in `course-api.ts`, POSTs to `/api/quizzes/submit`.

## Key Files & Directories
- `frontend/my-app/src/hooks/course.ts`: Main hooks for course/progress/quiz.
- `frontend/my-app/src/api/course-api.ts`: API wrappers for course/quiz endpoints.
- `backend/*/src/controllers/`: Backend logic for each service.
- `backend/search-service/course-search-service/README.md`: API documentation for course/quiz service.

---

If any section is unclear or missing important project-specific details, please provide feedback or point to additional files to improve these instructions.
