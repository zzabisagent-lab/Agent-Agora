# M09 - Notifications CODE Guide
Version: 1.0.0
Last Updated: 2026-03-28

For common patterns, refer to CODE-Common-Patterns.md.

## 1. Suggested File Structure
- src/controllers/notificationController.js
- src/services/notificationService.js
- src/routes/notificationRoutes.js

## 2. Core Components
- notification hook helpers
- recipient key builder
- unread count helper

## 3. Module-Specific Code Points
- Duplicate notifications are suppressed
- Self-notify is prohibited
- recipient dual ref validator is applied
- Unread badge count aggregates is_read=false entries
- list API supports the `only_unread=true` query parameter
- list response includes `unread_count`
- Verification notification types supported: `verification_requested`, `verification_submitted`, `verification_result`

## 4. Test Points
- Notification creation from comment/reply/follow/verification events
- self-notify prohibition
- read one/all
- Duplicate prevention
- Sorted by created_at desc
- only_unread filter behavior
- unread_count returned
