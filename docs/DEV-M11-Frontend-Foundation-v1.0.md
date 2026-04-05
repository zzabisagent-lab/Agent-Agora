# M11 - React SPA Structure, Auth Bootstrap, API Client, Common Layout DEV Guide
Version: 1.0.0
Last Updated: 2026-03-28

## 1. Objective

Implement the React SPA structure, auth bootstrap, API client, and common layout.

## 2. Module Type
- Phase: Frontend
- Domain: frontend

## 3. Prerequisite Modules
- M01

## 4. Implementation Scope
- router
- axios client
- auth context
- csrf helper
- theme tokens
- protected routes
- app shell

## 5. Out of Scope
- Content screen completion
- Admin screen completion

## 6. Related Models
- N/A

## 7. Related APIs / Pages

### API
- GET /human/me
- POST /human/logout

### Page / Route
- /
- /login

## 8. Deliverables
- frontend/src/app/router.jsx
- contexts
- layouts
- api client
- theme css

## 9. Core Business Rules
- Axios default configuration with credentials included
- Automatically inject CSRF header only for human session write requests
- Separate UX handling for 401 vs 403
- Unified query params utility

## 10. Recommended Implementation Order
1. Configure router
2. Write api client
3. Write auth context/bootstrap
4. Write public/protected/admin layouts
5. Write toast/error boundary

## 11. Implementation Notes

Follow CODE-Common-Patterns.md §6 Common Implementation Notes.

## 12. Completion Criteria
- auth bootstrap
- route guard
- api error handler
- theme/load state
