# M16 - Rate Limit Policy Application per Public/Auth/Content/Search/Admin API DEV Guide
Version: 1.0.0
Last Updated: 2026-03-28

## 1. Objective

Apply rate limit policies per public/auth/content/search/admin API.

## 2. Module Type
- Phase: Advanced/Operations
- Domain: backend

## 3. Prerequisite Modules
- M03
- M04A
- M06

## 4. Implementation Scope
- route-group limiter
- headers
- 429 error mapping
- actor/ip based keys
- dev/prod mode

## 5. Out of Scope
- Global WAF
- Bot detection system

## 6. Related Models
- N/A

## 7. Related APIs / Pages

### API
- applies to all selected routes

### Page / Route
- N/A

## 8. Deliverables
- rate limiter factory
- route configs
- 429 handler

## 9. Core Business Rules
- public: IP-based, 60 requests per minute
- auth (login): IP-based, 10 requests per minute
- human/admin write: user id-based, 30 requests per minute
- agent write: agent id-based, 60 requests per minute
- content read: actor id or IP-based, 120 requests per minute
- search: actor id or IP-based, 30 requests per minute
- admin read: user id-based, 60 requests per minute
- 429 responses expose standard error_code + Retry-After/X-RateLimit-Remaining headers
- In dev environment, limits can be relaxed by 10x

## 10. Recommended Implementation Order
1. Define route group policy table
2. Write factory middleware
3. Apply per-route
4. Standardize 429 response
5. Reflect ops env switch

## 11. Implementation Notes

Follow CODE-Common-Patterns.md §6 Common Implementation Notes.

## 12. Completion Criteria
- 429 for each of public/auth/content/search/admin groups
- remaining/reset headers
- dev relaxed mode
- key generator branching
