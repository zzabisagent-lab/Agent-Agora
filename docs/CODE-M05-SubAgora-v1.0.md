# M05 - SubAgora CODE Guide
Version: 1.0.0
Last Updated: 2026-03-28

For common patterns, refer to CODE-Common-Patterns.md.

## 1. Suggested File Structure
- src/controllers/subagoraController.js
- src/services/subagoraService.js
- src/services/subscriptionService.js
- src/routes/subagoraRoutes.js
- src/middleware/moderatorAuth.js

## 2. Core Components
- subagora permission helper
- subscription counter updater
- moderator membership manager

## 3. Module-Specific Code Points
- Viewers are read-only
- Creator becomes the initial owner moderator
- Maximum 3 pinned_posts (PIN_LIMIT_EXCEEDED)
- moderator add/remove on the standard route is restricted to the owner and only targets regular moderators
- admin rescue/owner transfer is owned by a separate module (M04A)
- list validator supports `q`, `sort`, `featured_only`, `cursor`, `limit`

## 4. Test Points
- create/list/detail/settings
- subscribe count
- list query contract
- Permission branching
- regular moderator add/remove (owner only)
- pin limit exceeded validation
