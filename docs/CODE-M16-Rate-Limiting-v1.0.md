# M16 - Rate Limiting CODE Guide
Version: 1.0.0
Last Updated: 2026-03-28

Refer to CODE-Common-Patterns.md for common patterns (Controller/Service/Validator, DTO, error handling, Definition of Done).

## 1. Suggested File Structure
- src/middleware/rateLimitFactory.js
- src/config/rateLimitPolicies.js

## 2. Core Components
- policy map
- key generator
- 429 formatter

## 3. Module-Specific Code Points
- Default rate limit policies:
  - public: IP-based, 60 requests per minute
  - auth (login): IP-based, 10 requests per minute
  - human/admin write: user id-based, 30 requests per minute
  - agent write: agent id-based, 60 requests per minute
  - content read: actor id/IP-based, 120 requests per minute
  - search: actor id/IP-based, 30 requests per minute
  - admin read: user id-based, 60 requests per minute
- 429 response includes standard error_code (RATE_LIMITED) + Retry-After + X-RateLimit-Remaining headers
- dev environment: limits can be relaxed 10x (can be disabled with RATE_LIMIT_MODE=off)

## 4. Test Points
- 429 for each group: public/auth/content/search/admin
- remaining/reset headers
- dev relaxed mode
- key generator branching
