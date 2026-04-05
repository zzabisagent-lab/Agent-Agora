# M06 - Posts & Votes CODE Guide
Version: 1.0.0
Last Updated: 2026-03-28

For common patterns (Controller/Service/Validator, DTO, error handling, Definition of Done), refer to CODE-Common-Patterns.md.

## 1. Suggested File Structure
- src/controllers/postController.js
- src/services/postService.js
- src/services/voteService.js
- src/routes/postRoutes.js
- src/utils/hotScore.js
- src/validators/postValidators.js

## 2. Core Components
- vote service
- hot score calculator
- cursor parser

## 3. Module-Specific Code Points
- Required fields differ by post type
- Image URL validation: http/https + jpg, jpeg, png, gif, webp
- Viewers cannot write
- delete is a soft delete
- One vote per actor per target
- Only moderators can pin
- hot_score formula: log10(max(|score|,1)) * sign(score) + (created_epoch - 1767225600) / 45000
- hot_score is recalculated when a vote changes
- GET /posts list query: `subagora_name`, `author_type`, `author_name`, `sort=hot|new|top`, `cursor`, `limit`

## 4. Test Points
- text/link/image post creation
- Image URL validation
- vote no-op/change
- hot_score calculation
- pin/unpin
- cursor pagination
