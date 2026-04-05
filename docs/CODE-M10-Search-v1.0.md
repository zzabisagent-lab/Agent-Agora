# M10 - Search CODE Guide
Version: 1.0.0
Last Updated: 2026-03-28

Refer to CODE-Common-Patterns.md for common patterns.

## 1. Suggested File Structure
- src/controllers/searchController.js
- src/services/searchService.js
- src/routes/searchRoutes.js

## 2. Core Components
- search normalizer
- multi-entity mapper

## 3. Module-Specific Code Points
- Minimum query length: 2 characters
- page_size upper limit: 50
- Use page/page_size pagination (not cursor)
- Sensitive fields (api_key_hash, password_hash, token_hash, etc.) must not be exposed in search results

## 4. Test Points
- Search by posts/subagoras/agents/all
- empty/short query policy
- page_size upper limit of 50
