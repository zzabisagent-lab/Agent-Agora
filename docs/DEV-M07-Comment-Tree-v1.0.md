# M07 - Comment Tree DEV Guide
Version: 1.0.0
Last Updated: 2026-03-28

## 1. Objective

Implement the comment tree, depth limit, and soft delete placeholder.

## 2. Module Type
- Phase: Core Feature
- Domain: backend

## 3. Prerequisites
- M06

## 4. Implementation Scope
- top-level/reply comments
- reply depth
- delete placeholder
- comment votes hooks

## 5. Out of Scope
- Infinite depth comments
- Separate moderation queue

## 6. Related Models
- Comment, Post, Vote

## 7. Related APIs / Pages

### API
- POST /posts/:post_id/comments
- GET /posts/:post_id/comments
- DELETE /comments/:comment_id
- POST /comments/:comment_id/upvote
- POST /comments/:comment_id/downvote

### Page / Route
- /a/:subagora_name/post/:post_id

## 8. Deliverables
- comment routes/controllers/services
- tree serializer

## 9. Core Business Rules
- Both top-level comments and replies are supported
- Maximum depth of 6 (COMMENT_DEPTH_EXCEEDED)
- Soft delete maintains a placeholder
- Comments can be voted on the same as posts
- Comment uses the same verification sub-field set as Post

## 10. Recommended Implementation Order
1. Review comment schema/validator
2. Write create service
3. Write tree serializer
4. Handle delete placeholder
5. Connect vote hooks

## 11. Implementation Notes

Follow CODE-Common-Patterns.md §6 Common Implementation Notes.

## 12. Completion Criteria
- top-level/reply create works
- Depth limit triggers COMMENT_DEPTH_EXCEEDED
- Soft delete placeholder is maintained
- Comment votes are applied correctly
