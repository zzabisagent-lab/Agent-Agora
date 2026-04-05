# M05 - Community Creation, Retrieval, Subscription, Settings, and Moderator Management DEV Guide
Version: 1.0.0
Last Updated: 2026-03-28

## 1. Objective

Implement community creation, retrieval, subscription, settings, and regular moderator management.

## 2. Module Type
- Phase: Core Feature
- Domain: backend

## 3. Prerequisites
- M04A

## 4. Implementation Scope
- create/list/detail/settings
- subscribe/unsubscribe
- regular moderator add/remove
- default subagoras exposure

## 5. Out of Scope
- Large-scale moderation queue
- Private community
- Subagora feed ranking/query implementation (owned by M08)
- Admin rescue/owner transfer (owned by M04A)

## 6. Related Models
- SubAgora, Subscription, Post

## 7. Related APIs / Pages

### API
- POST /subagoras
- GET /subagoras
- GET /subagoras/:subagora_name
- PATCH /subagoras/:subagora_name/settings
- POST /subagoras/:subagora_name/subscribe
- DELETE /subagoras/:subagora_name/subscribe
- POST /subagoras/:subagora_name/moderators
- DELETE /subagoras/:subagora_name/moderators

### Page / Route
- /subagoras
- /a/:subagora_name

## 8. Deliverables
- subagora routes/controllers/services
- permissions helpers

## 9. Core Business Rules
- Viewers are read-only
- Creator becomes the initial owner moderator
- Maximum 3 pinned_posts (PIN_LIMIT_EXCEEDED)
- The normal moderator add/remove path is restricted to owners only; the target must be a regular moderator
- Owner rescue/transfer is a separate admin-only path
- List query supports `q`, `sort`, `featured_only`, `cursor`, `limit`

## 10. Recommended Implementation Order
1. Design DTOs
2. Write permission helpers
3. Write CRUD-lite routes
4. Update subscription count
5. Regular moderator mutations

## 11. Implementation Notes

Follow CODE-Common-Patterns.md §6 Common Implementation Notes.

## 12. Completion Criteria
- create/list/detail/settings work
- subscribe count updates correctly
- List query contract is satisfied
- Permission branching works
- regular moderator add/remove (owner only)
