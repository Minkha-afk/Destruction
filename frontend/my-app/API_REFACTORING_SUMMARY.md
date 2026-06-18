# Frontend API Refactoring Summary

## Overview
Refactored the frontend API architecture to follow clean separation of concerns where API calls are made directly from composables instead of through an intermediary API layer.

## Changes Made

### 1. New Core Files Created

#### `src/lib/api-config.ts`
- Central API configuration file
- Exports `API_BASE_URLS` object with all service endpoints
- Provides `apiFetch<T>()` generic fetch helper with automatic auth
- Provides `createApiClient()` factory for scoped API clients

#### `src/lib/token.ts`
- Token management utilities
- Exports `setAuthToken()`, `getAuthToken()`, `removeAuthToken()`
- Centralized token handling logic

### 2. Updated Composables

#### `src/features/auth/services/authApi.ts`
- **Removed**: This service file was redundant after refactoring
- API calls are now made directly from the composable
- Token management moved to `@/lib/token.ts`

#### `src/features/courses/composables/useCourses.ts`
- **Before**: Called `courseService` methods from `@/api/courseService`
- **After**: Makes API calls directly using `apiFetch()` from `@/lib/api-config`
- Uses appropriate base URLs for catalog vs course service

### 3. Deprecated Files (Kept for Backward Compatibility)

#### `src/api/auth-api.ts`
- Marked as deprecated with JSDoc comments
- Re-exports token functions from `@/lib/token`
- Legacy `authAPI` object still available but not recommended

#### `src/api/courseService.ts`
- Marked as deprecated with JSDoc comments
- Legacy `courseService` object still available but not recommended
- Updated to use new token utilities

### 4. Updated Type Imports

Updated the following files to import types from feature folders instead of API folder:
- `src/hooks/useCourses.ts`
- `src/components/courses/level-card.tsx`
- `src/components/courses/quiz-form.tsx`
- `src/components/courses/course-detail.tsx`
- `src/components/courses/course-card.tsx`

### 5. Documentation

#### `FRONTEND_API_ARCHITECTURE.md`
Complete documentation covering:
- Directory structure
- Core files and their purpose
- Migration guide
- API call examples
- Best practices
- Environment variables
- Future enhancements

## Benefits

1. **Centralized Configuration**: All API URLs in one place
2. **Type Safety**: Generic `apiFetch<T>` provides typed responses
3. **Consistency**: Same fetch helper across all features
4. **Testability**: Easier to mock at composable level
5. **Separation of Concerns**: Composables own their API logic
6. **No Intermediary Layer**: Direct API calls without extra abstraction
7. **Better Tree-Shaking**: Unused code eliminated automatically

## Migration Path

### For New Code
Use the new pattern:
```typescript
import { API_BASE_URLS, apiFetch } from '@/lib/api-config';

const data = await apiFetch<ResponseType>(
  '/endpoint',
  { method: 'POST', body: JSON.stringify(payload) },
  API_BASE_URLS.serviceName
);
```

### For Existing Code
The old API files (`auth-api.ts`, `courseService.ts`) still work but are deprecated. They should be gradually migrated to the new pattern.

## Files Still Using Old Pattern

The following pages still use `courseService` directly (not yet migrated):
- `src/app/courses/[courseId]/page.tsx`
- `src/app/courses/[courseId]/[levelId]/page.tsx`

These can be migrated later or kept as-is since the old API files remain functional.

## Environment Variables Required

```bash
NEXT_PUBLIC_API_URL=http://localhost:4000
NEXT_PUBLIC_COURSE_SERVICE_URL=http://localhost:6000
NEXT_PUBLIC_CATALOG_SERVICE_URL=http://localhost:7000
NEXT_PUBLIC_CHAT_SERVICE_URL=http://localhost:5000
NEXT_PUBLIC_SEARCH_SERVICE_URL=http://localhost:7000
```

## Testing Recommendations

1. Test authentication flow (login/register/logout)
2. Test course browsing (catalog service)
3. Test enrolled courses (course service)
4. Test token expiration handling
5. Test error handling for failed API calls
6. Verify backward compatibility with old API files

## Next Steps

1. Migrate remaining page components to use new pattern
2. Add request interceptors if needed
3. Implement retry logic for failed requests
4. Add request caching where appropriate
5. Consider adding WebSocket support for real-time features
6. Update tests to use new API structure
