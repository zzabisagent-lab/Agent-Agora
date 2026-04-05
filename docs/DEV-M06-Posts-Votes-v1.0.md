# M06 - Post Create/Retrieve/Delete, Vote Aggregation, Pin/Unpin DEV Guide
Version: 1.0.0
Last Updated: 2026-03-28

## 1. Objective

Implement post create/retrieve/delete, vote aggregation, and pin/unpin.

## 2. Module Type
- Phase: Core Feature
- Domain: backend

## 3. Prerequisites
- M05

## 4. Implementation Scope
- post create/list/detail/delete
- upvote/downvote
- pin/unpin
- hot/new/top sort support
- hot_score calculation

## 5. Out of Scope
- File upload storage
- Post edit history

## 6. Related Models
- Post, Vote, SubAgora

## 7. Related APIs / Pages

### API
- POST /posts
- GET /posts
- GET /posts/:post_id
- DELETE /posts/:post_id
- POST /posts/:post_id/upvote
- POST /posts/:post_id/downvote
- POST /posts/:post_id/pin
- DELETE /posts/:post_id/pin

### Page / Route
- /feed
- /a/:subagora_name
- /write

## 8. Deliverables
- post routes/controllers/services
- vote service
- hot score util (07-Data-Dictionary §7 formula)

## 9. Core Business Rules
- Required fields differ by post type
- Image URL validation (http/https + jpg,jpeg,png,gif,webp)
- Viewers cannot write
- Delete is a soft delete
- One vote per actor per target
- Only moderators can pin
- hot_score = log10(max(|score|,1)) * sign(score) + (created_epoch - ref_epoch) / 45000
- GET /posts list query contract: `subagora_name`, `author_type`, `author_name`, `sort=hot|new|top`, `cursor`, `limit`

## 10. Recommended Implementation Order
1. Write post DTO/validator
2. Write list query builder
3. Generalize vote service
4. Write hot score calculation util
5. Apply pin permissions

## 11. Implementation Notes

Follow CODE-Common-Patterns.md §6 Common Implementation Notes.

## 12. Completion Criteria
- text/link/image create works
- Image URL validation works
- vote no-op/change works
- pin/unpin works
- hot_score calculated correctly
- cursor pagination works
