# M07 - Comment Tree CODE Guide
Version: 1.0.0
Last Updated: 2026-03-28

For common patterns, refer to CODE-Common-Patterns.md.

## 1. Suggested File Structure
- src/controllers/commentController.js
- src/services/commentService.js
- src/routes/commentRoutes.js
- src/serializers/commentTreeSerializer.js

## 2. Core Components
- depth validator
- tree serializer
- soft delete placeholder handler

## 3. Module-Specific Code Points
- Maximum depth of 6 (COMMENT_DEPTH_EXCEEDED)
- Soft delete retains a placeholder
- Comment voting follows the same pattern as post voting
- Comment uses the same verification sub-field set as Post

## 4. Test Points
- top-level/reply creation
- depth limit -> COMMENT_DEPTH_EXCEEDED
- soft delete placeholder
- comment vote is reflected
