# API Migration Examples

This document provides practical examples of migrating from the old API pattern to the new one.

## Example 1: Simple GET Request

### Old Pattern ❌
```typescript
import { courseService } from '@/api/courseService';

// In your composable or component
const data = await courseService.getUserCourses(userId);
```

### New Pattern ✅
```typescript
import { API_BASE_URLS, apiFetch } from '@/lib/api-config';

// In your composable
const data = await apiFetch<{ enrollments: any[] }>(
  `/courses/user/${userId}`,
  {},
  API_BASE_URLS.course
);
```

## Example 2: POST Request with Body

### Old Pattern ❌
```typescript
import { courseService } from '@/api/courseService';

const result = await courseService.enroll(userId, courseId);
```

### New Pattern ✅
```typescript
import { API_BASE_URLS, apiFetch } from '@/lib/api-config';

const result = await apiFetch<EnrollmentResponse>(
  '/courses/enroll',
  {
    method: 'POST',
    body: JSON.stringify({ userId, courseId }),
  },
  API_BASE_URLS.course
);
```

## Example 3: Authentication

### Old Pattern ❌
```typescript
import { authAPI, setAuthToken } from '@/api/auth-api';

const response = await authAPI.login({ email, password });
setAuthToken(response.token);
```

### New Pattern ✅
```typescript
import { API_BASE_URLS, apiFetch } from '@/lib/api-config';
import { setAuthToken } from '@/lib/token';

const response = await apiFetch<AuthResponse>(
  '/auth/login',
  {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  },
  API_BASE_URLS.auth
);
setAuthToken(response.token);
```

## Example 4: Using API Client Factory

### New Pattern ✅
```typescript
import { createApiClient, API_BASE_URLS } from '@/lib/api-config';

// Create a scoped client for course service
const courseApi = createApiClient(API_BASE_URLS.course);

// GET request
const courses = await courseApi.get<{ enrollments: any[] }>(
  `/courses/user/${userId}`
);

// POST request
const enrollment = await courseApi.post<EnrollmentResponse>(
  '/courses/enroll',
  { userId, courseId }
);

// PUT request
const updated = await courseApi.put<Course>(
  `/courses/${courseId}`,
  { title: 'New Title' }
);

// DELETE request
await courseApi.delete(`/courses/${courseId}`);
```

## Example 5: Complete Composable Migration

### Old Pattern ❌
```typescript
import { courseService } from '@/api/courseService';
import { useState, useEffect } from 'react';

export function useEnrollment(userId: string, courseId: string) {
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkEnrollment = async () => {
      try {
        const result = await courseService.checkEnrollment(userId, courseId);
        setEnrolled(result.enrolled);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    checkEnrollment();
  }, [userId, courseId]);
  
  const enroll = async () => {
    await courseService.enroll(userId, courseId);
    setEnrolled(true);
  };
  
  return { enrolled, loading, enroll };
}
```

### New Pattern ✅
```typescript
import { API_BASE_URLS, apiFetch } from '@/lib/api-config';
import { useState, useEffect } from 'react';

interface EnrollmentStatus {
  enrolled: boolean;
}

interface EnrollmentResponse {
  success: boolean;
  enrollment: any;
}

export function useEnrollment(userId: string, courseId: string) {
  const [enrolled, setEnrolled] = useState(false);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const checkEnrollment = async () => {
      try {
        const result = await apiFetch<EnrollmentStatus>(
          `/courses/user/${userId}/course/${courseId}/status`,
          {},
          API_BASE_URLS.course
        );
        setEnrolled(result.enrolled);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    checkEnrollment();
  }, [userId, courseId]);
  
  const enroll = async () => {
    await apiFetch<EnrollmentResponse>(
      '/courses/enroll',
      {
        method: 'POST',
        body: JSON.stringify({ userId, courseId }),
      },
      API_BASE_URLS.course
    );
    setEnrolled(true);
  };
  
  return { enrolled, loading, enroll };
}
```

## Example 6: Error Handling

### New Pattern ✅
```typescript
import { API_BASE_URLS, apiFetch } from '@/lib/api-config';

try {
  const data = await apiFetch<CourseData>(
    `/courses/${courseId}`,
    {},
    API_BASE_URLS.catalog
  );
  // Handle success
} catch (error) {
  if (error instanceof Error) {
    // apiFetch throws Error with the server error message
    console.error('API Error:', error.message);
    // Display to user: error.message
  }
}
```

## Example 7: Multiple API Calls in Parallel

### New Pattern ✅
```typescript
import { API_BASE_URLS, apiFetch } from '@/lib/api-config';

// Fetch multiple resources in parallel
const [courses, progress, enrollments] = await Promise.all([
  apiFetch<{ courses: Course[] }>(
    '/courses',
    {},
    API_BASE_URLS.catalog
  ),
  apiFetch<ProgressData>(
    `/progress/user/${userId}`,
    {},
    API_BASE_URLS.course
  ),
  apiFetch<{ enrollments: Enrollment[] }>(
    `/courses/user/${userId}`,
    {},
    API_BASE_URLS.course
  ),
]);
```

## Example 8: Custom Headers

### New Pattern ✅
```typescript
import { API_BASE_URLS, apiFetch } from '@/lib/api-config';

const data = await apiFetch<ResponseType>(
  '/endpoint',
  {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: {
      'X-Custom-Header': 'value',
      // Auth header is automatically added by apiFetch
    }
  },
  API_BASE_URLS.serviceName
);
```

## Example 9: Dealing with Different Services

### New Pattern ✅
```typescript
import { API_BASE_URLS, apiFetch } from '@/lib/api-config';

// Browsing courses (uses catalog service)
const allCourses = await apiFetch<{ courses: Course[] }>(
  '/courses',
  {},
  API_BASE_URLS.catalog  // Port 7000
);

// User's enrolled courses (uses course service)
const myCourses = await apiFetch<{ enrollments: Enrollment[] }>(
  `/courses/user/${userId}`,
  {},
  API_BASE_URLS.course  // Port 6000
);

// Sending a chat message (uses chat service)
const message = await apiFetch<Message>(
  '/messages',
  {
    method: 'POST',
    body: JSON.stringify({ text, recipientId }),
  },
  API_BASE_URLS.chat  // Port 5000
);
```

## Example 10: Type Safety

### New Pattern ✅
```typescript
import { API_BASE_URLS, apiFetch } from '@/lib/api-config';
import type { Course } from '@/features/courses/types';
import type { AuthResponse } from '@/features/auth/types';

// Strongly typed response
const course = await apiFetch<Course>(
  `/courses/${courseId}`,
  {},
  API_BASE_URLS.catalog
);
// TypeScript knows 'course' has Course type

const authResult = await apiFetch<AuthResponse>(
  '/auth/login',
  {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  },
  API_BASE_URLS.auth
);
// TypeScript knows 'authResult' has AuthResponse type with token, user, etc.
```

## Quick Reference

### Import Statements
```typescript
// For making API calls
import { API_BASE_URLS, apiFetch, createApiClient } from '@/lib/api-config';

// For token management
import { setAuthToken, getAuthToken, removeAuthToken } from '@/lib/token';

// For types
import type { Course, Level, Quiz } from '@/features/courses/types';
import type { User, AuthResponse } from '@/features/auth/types';
```

### Available Base URLs
```typescript
API_BASE_URLS.auth      // http://localhost:4000
API_BASE_URLS.course    // http://localhost:6000
API_BASE_URLS.catalog   // http://localhost:7000
API_BASE_URLS.chat      // http://localhost:5000
API_BASE_URLS.search    // http://localhost:7000
```

### HTTP Methods
```typescript
// GET (default)
await apiFetch('/endpoint', {}, baseUrl);

// POST
await apiFetch('/endpoint', { method: 'POST', body: JSON.stringify(data) }, baseUrl);

// PUT
await apiFetch('/endpoint', { method: 'PUT', body: JSON.stringify(data) }, baseUrl);

// DELETE
await apiFetch('/endpoint', { method: 'DELETE' }, baseUrl);

// Or use API client
const api = createApiClient(baseUrl);
await api.get('/endpoint');
await api.post('/endpoint', data);
await api.put('/endpoint', data);
await api.delete('/endpoint');
```
