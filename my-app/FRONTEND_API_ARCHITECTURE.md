# Frontend API Architecture

## Overview

This document describes the new API architecture for the frontend application. The architecture follows a clean separation of concerns where:

- **API configuration and utilities** are centralized in `src/lib/`
- **API calls are made directly from composables** (hooks) in feature modules
- **The `src/api/` folder is deprecated** and kept only for backward compatibility

## Directory Structure

```
src/
├── lib/
│   ├── api-config.ts      # Base API configuration and utilities
│   ├── token.ts           # Token management utilities
│   └── cookies.ts         # Cookie utilities (existing)
├── features/
│   ├── auth/
│   │   ├── composables/
│   │   │   └── useAuth.ts # Makes auth API calls directly
│   │   ├── types/
│   │   │   └── index.ts   # Auth type definitions
│   │   └── index.ts       # Feature exports
│   └── courses/
│       ├── composables/
│       │   └── useCourses.ts # Makes course API calls directly
│       └── types/
│           └── index.ts      # Course type definitions
└── api/                   # DEPRECATED - for backward compatibility only
    ├── auth-api.ts
    └── courseService.ts
```

## Core Files

### 1. `src/lib/api-config.ts`

Central configuration for all API calls. Contains:

- **`API_BASE_URLS`**: Object containing all service URLs
  - `auth`: Authentication service (port 4000)
  - `course`: Course service (port 6000)
  - `catalog`: Catalog/Search service (port 7000)
  - `chat`: Chat service (port 5000)
  - `search`: Search service (port 7000)

- **`apiFetch<T>(url, options, baseUrl)`**: Generic authenticated fetch helper
  - Automatically includes auth token from cookies
  - Handles errors consistently
  - Returns typed responses

- **`createApiClient(baseUrl)`**: Factory function for creating scoped API clients
  - Returns an object with `get`, `post`, `put`, `delete` methods
  - Automatically handles authentication and error handling

### 2. `src/lib/token.ts`

Token management utilities:

- **`setAuthToken(token)`**: Store auth token in cookies
- **`getAuthToken()`**: Retrieve auth token (returns null if expired)
- **`removeAuthToken()`**: Remove auth token from cookies

### 3. Feature Composables

#### Auth: `src/features/auth/composables/useAuth.ts`

Makes authentication API calls directly:

```typescript
import { API_BASE_URLS, apiFetch } from '@/lib/api-config';
import { setAuthToken, getAuthToken, removeAuthToken } from '@/lib/token';

// Login example
const response = await apiFetch<AuthResponse>(
  '/auth/login',
  {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  },
  API_BASE_URLS.auth
);
```

#### Courses: `src/features/courses/composables/useCourses.ts`

Makes course API calls directly:

```typescript
import { API_BASE_URLS, apiFetch } from '@/lib/api-config';

// Fetch courses from catalog
const data = await apiFetch<{ courses: any[] }>(
  '/courses',
  {},
  API_BASE_URLS.catalog
);

// Fetch user's enrolled courses
const data = await apiFetch<{ enrollments: any[] }>(
  `/courses/user/${userId}`,
  {},
  API_BASE_URLS.course
);
```

## Migration Guide

### Before (Old Pattern)

```typescript
// In composable
import { authAPI } from '@/api/auth-api';
import { courseService } from '@/api/courseService';

const response = await authAPI.login({ email, password });
const courses = await courseService.getUserCourses(userId);
```

### After (New Pattern)

```typescript
// In composable
import { API_BASE_URLS, apiFetch } from '@/lib/api-config';

const response = await apiFetch<AuthResponse>(
  '/auth/login',
  {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  },
  API_BASE_URLS.auth
);

const data = await apiFetch<{ enrollments: any[] }>(
  `/courses/user/${userId}`,
  {},
  API_BASE_URLS.course
);
```

## Benefits of New Architecture

1. **Centralized Configuration**: All API URLs and fetch logic in one place
2. **Type Safety**: Generic `apiFetch<T>` provides typed responses
3. **Consistency**: Same fetch helper used across all features
4. **Testability**: Easier to mock API calls at the composable level
5. **Separation of Concerns**: Composables own their API logic
6. **No Intermediary Layer**: Direct API calls without unnecessary abstraction
7. **Better Tree-Shaking**: Unused API functions are eliminated automatically

## Environment Variables

Configure service URLs in `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_COURSE_SERVICE_URL=http://localhost:6000
NEXT_PUBLIC_CATALOG_SERVICE_URL=http://localhost:7000
NEXT_PUBLIC_CHAT_SERVICE_URL=http://localhost:5000
NEXT_PUBLIC_SEARCH_SERVICE_URL=http://localhost:7000
```

## API Call Examples

### GET Request

```typescript
const course = await apiFetch<Course>(
  `/courses/${courseId}`,
  {},
  API_BASE_URLS.catalog
);
```

### POST Request

```typescript
const result = await apiFetch<EnrollmentResponse>(
  '/courses/enroll',
  {
    method: 'POST',
    body: JSON.stringify({ userId, courseId }),
  },
  API_BASE_URLS.course
);
```

### Using API Client

```typescript
import { createApiClient, API_BASE_URLS } from '@/lib/api-config';

const courseApi = createApiClient(API_BASE_URLS.course);

// GET
const courses = await courseApi.get<{ enrollments: any[] }>(`/courses/user/${userId}`);

// POST
const result = await courseApi.post<EnrollmentResponse>(
  '/courses/enroll',
  { userId, courseId }
);
```

## Best Practices

1. **Always use `apiFetch` or `createApiClient`** for API calls
2. **Define response types** in feature type files
3. **Import from `@/lib/api-config`** for API utilities
4. **Import from `@/lib/token`** for token management
5. **Make API calls in composables**, not in components
6. **Handle errors** at the composable level
7. **Use appropriate base URLs** for each service

## Backward Compatibility

The old `src/api/auth-api.ts` and `src/api/courseService.ts` files are marked as deprecated but still functional for backward compatibility. They should not be used in new code. Existing code should be gradually migrated to the new pattern.

## Future Enhancements

Consider adding:

1. Request/response interceptors
2. Retry logic for failed requests
3. Request caching
4. Request cancellation
5. Upload progress tracking
6. WebSocket integration
