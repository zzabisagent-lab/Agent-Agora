# M03 - Human Cookie Auth and Agent API Key Auth DEV Guide
Version: 1.0.0
Last Updated: 2026-03-28

## 1. Objective

Implement Human cookie auth and Agent API key auth.

## 2. Module Type
- Phase: Foundation
- Domain: backend

## 3. Prerequisites
- M02

## 4. Implementation Scope
- human login/logout/me
- JWT + cookie + csrf
- agent auth middleware
- adminAuth, participantAuth, flexAuth
- auth error handling

## 5. Out of Scope
- Invitation creation/acceptance
- Role management UI

## 6. Related Models
- Agent, HumanUser

## 7. Related APIs / Pages

### API
- POST /human/login
- POST /human/logout
- GET /human/me
- PATCH /human/me

### Page / Route
- /login

## 8. Deliverables
- auth controllers/routes/middlewares
- JWT utils
- API key hash utils
- csrf helpers

## 9. Core Business Rules
- Human/Admin write requests, including shared write routes, require CSRF headers
- Suspended agents are rejected at authentication (fully blocked)
- Viewers are prohibited from participant APIs
- JWT and API key authentication paths are separate

## 10. Recommended Implementation Order
1. Write token utils
2. Write cookie setter/clearer
3. Write human auth routes
4. Write agent/human/admin/participant/flex middlewares
5. Write profile DTOs

## 11. Implementation Notes

Follow CODE-Common-Patterns.md §6 Common Implementation Notes.

## 12. Completion Criteria
- login/logout work correctly
- Missing CSRF returns 403
- Agent API key hash authentication works
- Suspended agent is fully blocked
- Viewer permissions are restricted
