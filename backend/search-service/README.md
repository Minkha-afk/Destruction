# Course Search & Quiz Service

A combined microservice for displaying available courses and managing multiple choice quizzes in the learning platform.

## Features

### Course Search
- **Course Catalog**: Browse all available courses with filtering and search
- **Advanced Search**: Filter by category, difficulty, price range
- **Course Details**: Get comprehensive course information including levels and quizzes
- **Featured Courses**: Display top-rated courses for homepage
- **Pagination**: Efficient pagination for large course catalogs

### Quiz Management
- **Multiple Choice Questions**: Support for 4-option multiple choice questions
- **Quiz Management**: Create, start, and submit quizzes
- **Score Calculation**: Automatic scoring and pass/fail determination
- **Security**: Correct answers hidden until quiz completion
- **Progress Tracking**: Track user attempts and performance
- **Statistics**: Quiz performance analytics

## API Endpoints

### Courses
- `GET /api/courses` - Get all courses with filtering and pagination
- `GET /api/courses/featured` - Get featured (top-rated) courses
- `GET /api/courses/:id` - Get course by ID with full details
- `GET /api/courses/categories` - Get all available categories
- `GET /api/courses/difficulties` - Get all available difficulty levels

### Quizzes
- `GET /api/quizzes/:id` - Get quiz with questions (answers hidden)
- `POST /api/quizzes/start` - Start a new quiz attempt
- `POST /api/quizzes/submit` - Submit quiz answers and get results
- `GET /api/quizzes/results/:attemptId` - Get detailed quiz results
- `GET /api/quizzes/user/:userId/history` - Get user's quiz history
- `GET /api/quizzes/:quizId/stats` - Get quiz statistics

### Query Parameters for Courses
- `search` - Search in title, description, or instructor
- `category` - Filter by course category
- `difficulty` - Filter by difficulty level
- `minPrice` / `maxPrice` - Filter by price range
- `sortBy` - Sort by field (rating, price, duration, etc.)
- `order` - Sort order (asc/desc)
- `page` - Page number for pagination
- `limit` - Items per page

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   DATABASE_URL="postgresql://username:password@localhost:5432/course_search_db"
   PORT=4000
   ```

3. Generate Prisma client:
   ```bash
   npx prisma generate
   ```

4. Run database migrations:
   ```bash
   npx prisma migrate dev
   ```

5. Seed sample data:
   ```bash
   # Seed course data
   npm run seed
   ```

6. Start the service:
   ```bash
   npm run dev
   ```

## Integration with Course Service

This service provides:
- **Course catalog data** to the main course service
- **Quiz functionality** for level progression
- **User progress tracking** integration

The course service fetches course details and quiz information from this combined service via HTTP API calls.

## Service Architecture

- **Single Server**: Both course search and quiz services run on port 4000
- **Shared Database**: Course catalog and quiz data in one database
- **Unified API**: Single service with multiple endpoints
- **Efficient**: No inter-service communication overhead
