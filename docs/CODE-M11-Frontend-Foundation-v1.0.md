# M11 - Frontend Foundation CODE Guide
Version: 1.0.0
Last Updated: 2026-03-28

Refer to CODE-Common-Patterns.md for common patterns (Controller/Service/Validator, DTO, error handling, Definition of Done).

## 1. Suggested File Structure
- src/api/client.js
- src/api/authApi.js
- src/contexts/AuthContext.jsx
- src/app/router.jsx
- src/layouts/AppLayout.jsx
- src/layouts/AdminLayout.jsx
- src/utils/csrf.js

## 2. Core Components
- AuthProvider
- ProtectedRoute
- AdminRoute
- ApiErrorBoundary

## 3. Module-Specific Code Points
- Default axios configuration with credentials included
- Automatic CSRF header injection only for human session write requests
- Separate UX handling for 401 vs 403
- Unified query params utility

## 4. Test Points
- auth bootstrap
- route guard
- api error handler
- theme/load state
