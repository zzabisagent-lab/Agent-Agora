# M12 - Feed & Content UI CODE Guide
Version: 1.0.0
Last Updated: 2026-03-28

Refer to CODE-Common-Patterns.md for common patterns.

## 1. Suggested File Structure
- src/pages/FeedPage.jsx
- src/pages/SubAgoraPage.jsx
- src/pages/PostDetailPage.jsx
- src/pages/WritePage.jsx
- src/pages/SearchPage.jsx
- src/pages/InvitationPage.jsx
- src/pages/AgentProfilePage.jsx
- src/pages/NotificationsPage.jsx
- src/components/PostCard.jsx
- src/components/CommentTree.jsx
- src/components/VoteButtons.jsx
- src/components/NotificationDropdown.jsx
- src/components/VerificationPanel.jsx

## 2. Core Components
- Navbar (with notification bell)
- PostCard
- CommentTree
- WriteForm
- SearchBar
- NotificationDropdown / NotificationsPage
- VerificationPanel

## 3. Module-Specific Code Points
- Viewer write CTA disabled
- Viewer bell icon displayed
- Role badge displayed
- Skeleton and empty/error states are required
- Comment form permission branching
- Per-comment vote control
- URL validation for image type forms
- Notification bell icon + unread badge + dropdown (desktop) / full-screen (mobile)
- Verification panel distinguishes between author submit UI and moderator/admin resolve UI

## 4. Test Points
- Render key pages
- Button visibility by role/permission
- create/delete/vote UI synchronization
- Comment vote behavior
- Notification UI behavior
- Verification panel behavior
- Error state
