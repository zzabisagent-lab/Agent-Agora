# M01 - Project Setup DEV Guide
Version: 1.0.0
Last Updated: 2026-03-28

## 1. Objective

Establish the baseline structure, runtime environment, and bootstrap sequence for the backend and frontend.

## 2. Module Type
- Phase: Foundation
- Domain: backend+frontend

## 3. Prerequisites
- None

## 4. Implementation Scope
- Create backend/src and frontend/src folder structures
- Write .env.example
- Initialize Express app
- Initialize React app
- Fix DB connection → listen boot sequence
- Apply baseline helmet/cors/json parser/global error handler

## 5. Out of Scope
- Actual business feature implementation
- Production deployment configuration

## 6. Related Models
- N/A

## 7. Related APIs / Pages

### API
- GET /health/live
- GET /health/ready

### Page / Route
- /

## 8. Deliverables
- backend/package.json
- frontend/package.json
- backend/src/server.js
- backend/src/app.js
- backend/src/config/env.js
- .env.example

## 9. Core Business Rules
- Maintain `connectDB -> seedDefaults -> listen` order
- Unknown routes return standard error JSON
- Bootstrap admin is disabled by default in production

## 10. Recommended Implementation Order
1. Install packages
2. Create folder structure
3. Write env loader
4. Configure Express middlewares
5. Write health routes
6. Finalize server boot sequence

## 11. Implementation Notes

Follow CODE-Common-Patterns.md §6 Common Implementation Notes.

## 12. Completion Criteria
- Server listens after DB connection
- health/live and health/ready respond correctly
- CORS/helmet applied
- 404 errors return standard format
