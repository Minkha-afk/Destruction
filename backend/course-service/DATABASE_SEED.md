# Database Seed Data

This document provides sample data to populate your course service database with realistic content.

## 📊 Sample Data Overview

The seed data includes:

### 👥 Users (3 sample users)
- **John Doe** (john.doe@example.com) - Active learner with React progress
- **Jane Smith** (jane.smith@example.com) - Next.js and Python enthusiast  
- **Alex Johnson** (alex.johnson@example.com) - Backend developer learning Node.js

### 📚 Courses (5 comprehensive courses)

1. **React Foundations** (Beginner)
   - 5 levels: Intro → State/Props → Effects → Lists → Advanced Patterns
   - Focus: Frontend development fundamentals

2. **TypeScript Essentials** (Intermediate)
   - 4 levels: Types → Functions/Generics → Advanced Types → Decorators
   - Focus: Type-safe JavaScript development

3. **Next.js App Router** (Advanced)
   - 5 levels: Routing → Server Components → Server Actions → Data Fetching → Deployment
   - Focus: Full-stack React applications

4. **Node.js Backend Development** (Intermediate)
   - 5 levels: Fundamentals → Express → Databases → Auth/Security → APIs/Testing
   - Focus: Server-side JavaScript development

5. **Python Programming Fundamentals** (Beginner)
   - 5 levels: Basics → Control Flow → Data Structures → OOP → Libraries
   - Focus: Python programming from scratch

### 📊 Progress & Quiz Data
- **Progress Records**: 10 entries showing user advancement through courses
- **Quiz Attempts**: 8 attempts with realistic scores and completion times
- **Various States**: Completed, in-progress, and failed attempts

## 🚀 How to Populate Your Database

### Option 1: Run the Seed Script (Recommended)

```bash
# Navigate to course service directory
cd backend/course-service

# Install dependencies (if not already done)
npm install

# Generate Prisma client
npx prisma generate

# Run the seed script
npm run seed
```

### Option 2: Reset Database and Seed

```bash
# This will reset your database and populate with fresh data
npm run db:reset
```

### Option 3: Manual Database Setup

If you prefer to set up the database manually:

```bash
# Push schema to database
npx prisma db push

# Run seed script
npm run seed
```

## 📋 Seed Data Details

### Course IDs for API Testing
- `react-foundations`
- `typescript-essentials` 
- `nextjs-app-router`
- `nodejs-backend`
- `python-fundamentals`

### Level IDs (examples)
- `react-level-1`, `react-level-2`, etc.
- `ts-level-1`, `ts-level-2`, etc.
- `next-level-1`, `next-level-2`, etc.

### User Credentials
All users have the password: `password123` (hashed in database)

## 🧪 Testing Your Integration

After seeding, test these API endpoints:

```bash
# Get all courses
curl http://localhost:3001/courses

# Get specific course with levels
curl http://localhost:3001/courses/react-foundations

# Get course levels
curl http://localhost:3001/courses/react-foundations/levels

# Get user progress (requires auth)
curl http://localhost:3001/progress

# Health check
curl http://localhost:3001/health
```

## 🎯 Expected Results

After successful seeding, you should see:
- ✅ 5 courses with detailed descriptions
- ✅ 23 levels across all courses
- ✅ 3 sample users
- ✅ 10 progress records showing learning paths
- ✅ 8 quiz attempts with realistic data

## 🔧 Customization

To add your own data, modify `src/seed.ts`:

1. **Add More Courses**:
```typescript
const newCourse = await prisma.course.create({
  data: {
    id: 'your-course-id',
    title: 'Your Course Title',
    desc: 'Course description',
    diff: 'Beginner|Intermediate|Advanced',
    levels: {
      create: [
        {
          id: 'level-1',
          title: 'Level Title',
          description: 'Level description',
          order: 1,
        },
        // ... more levels
      ],
    },
  },
});
```

2. **Add More Users**:
```typescript
const newUser = await prisma.user.create({
  data: {
    name: 'User Name',
    email: 'user@example.com',
    password: '$2b$10$K7L1OJ45/4Y2nIvhRVpCe.FSmhDlwjfuK5VvCdqAqZK8F7/rU5JTi',
  },
});
```

3. **Add Progress Data**:
```typescript
await prisma.progress.create({
  data: {
    userId: user.id,
    courseId: course.id,
    levelId: 'level-id',
    score: 85,
    passed: true,
    unlocked: true,
  },
});
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**:
   - Ensure PostgreSQL is running
   - Check DATABASE_URL in .env file

2. **Prisma Client Not Generated**:
   ```bash
   npx prisma generate
   ```

3. **Seed Script Fails**:
   - Check for existing data conflicts
   - Use `npm run db:reset` to start fresh

4. **Permission Errors**:
   - Ensure database user has proper permissions
   - Check PostgreSQL logs for details

### Verification Queries

Check your data with Prisma Studio:
```bash
npx prisma studio
```

Or use direct SQL queries:
```sql
SELECT COUNT(*) FROM "Course";
SELECT COUNT(*) FROM "Level";
SELECT COUNT(*) FROM "User";
SELECT COUNT(*) FROM "Progress";
SELECT COUNT(*) FROM "QuizAttempt";
```

## 🎉 Next Steps

After seeding your database:

1. **Start your services**:
   ```bash
   # Course service
   npm run dev
   
   # Search service (in separate terminal)
   cd ../search-service/course-search-service
   npm run dev
   
   # Frontend (in separate terminal)
   cd ../../frontend/my-app
   npm run dev
   ```

2. **Test the integration**:
   - Visit http://localhost:3000/courses
   - Navigate through course pages
   - Test quiz functionality

3. **Monitor logs**:
   - Backend logs show API requests
   - Frontend console shows data loading
   - Check for any errors or issues

Your database is now populated with realistic sample data that matches your application structure!
