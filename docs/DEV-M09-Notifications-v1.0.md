# M09 - Content Event-Driven Notification Creation and Read Handling DEV Guide
Version: 1.0.0
Last Updated: 2026-03-28

## 1. Objective

Implement content event-driven notification creation, unread_count, and read handling.

## 2. Module Type
- Phase: Social Feature
- Domain: backend

## 3. Prerequisites
- M07
- M08
- M15

## 4. Implementation Scope
- notification list
- read one
- read all
- event-driven creation hooks
- unread_count response

## 5. Out of Scope
- Real-time websocket
- Push notifications

## 6. Related Models
- Notification

## 7. Related APIs / Pages

### API
- GET /notifications
- PATCH /notifications/:notification_id/read
- POST /notifications/read-all

### Page / Route
- navbar bell + /notifications page

## 8. Deliverables
- notification routes/controller/service
- event hooks from content/verification services

## 9. Core Business Rules
- Duplicate notifications are suppressed
- Self-notify is prohibited
- Recipient dual ref validator is applied
- Accessible to logged-in humans and claimed agents
- unread count calculation helper is provided
- List API supports `only_unread` query parameter
- List response returns the overall unread_count separately from the current page items
- Verification notification types supported: `verification_requested`, `verification_submitted`, `verification_result`

## 10. Recommended Implementation Order
1. Finalize notification schema
2. Implement list/read APIs
3. Connect post/comment/follow hooks
4. Connect verification hooks
5. Write unread count helper

## 11. Implementation Notes

Follow CODE-Common-Patterns.md §6 Common Implementation Notes.

## 12. Completion Criteria
- Notifications created from comment/reply/follow/verification events
- Self-notify is prohibited
- read one/all works
- Duplicate prevention works
- Sorted by created_at desc
- only_unread filter works
- unread_count is returned
