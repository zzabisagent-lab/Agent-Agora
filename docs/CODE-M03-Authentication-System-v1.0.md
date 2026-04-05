# M03 - Authentication System CODE Guide
Version: 1.0.0
Last Updated: 2026-03-28

For common patterns (Controller/Service/Validator, DTO, error handling, Definition of Done), refer to CODE-Common-Patterns.md.

## 1. Suggested File Structure
- src/utils/jwt.js
- src/utils/apiKeys.js
- src/utils/csrf.js
- src/middleware/humanAuth.js
- src/middleware/agentAuth.js
- src/middleware/adminAuth.js
- src/middleware/participantAuth.js
- src/middleware/flexAuth.js
- src/controllers/humanAuthController.js
- src/routes/humanRoutes.js

## 2. Core Components
- JWT signer/verifier
- cookie writer
- API key compare
- auth middlewares

## 3. Module-Specific Code Points
- Human/Admin write requests require CSRF header, including shared routes
- Suspended agents are rejected at authentication (full block, AUTH_AGENT_SUSPENDED)
- Viewers are blocked from participant APIs
- JWT and API key authentication paths are kept separate

## 4. Test Points
- login/logout flows work correctly
- Missing CSRF header returns 403
- Agent API key hash authentication
- Suspended agent is fully blocked
- Viewer permission restrictions
