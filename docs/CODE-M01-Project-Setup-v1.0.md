# M01 - Project Setup CODE Guide
Version: 1.0.0
Last Updated: 2026-03-28

For common patterns (Controller/Service/Validator, DTO, error handling, Definition of Done), refer to CODE-Common-Patterns.md.

## 1. Suggested File Structure
- src/app.js
- src/server.js
- src/config/env.js
- src/config/db.js
- src/routes/healthRoutes.js
- src/middleware/errorHandler.js

## 2. Core Components
- env parser
- db connector
- boot logger
- global error handler

## 3. Module-Specific Code Points
- Maintain the `connectDB -> seedDefaults -> listen` startup order
- Unknown routes return a standard error JSON response
- Bootstrap admin is disabled by default in production

## 4. Test Points
- Server listens after DB connection is established
- health/live and health/ready endpoints respond correctly
- CORS/helmet settings are applied
- 404 errors follow the standard format
