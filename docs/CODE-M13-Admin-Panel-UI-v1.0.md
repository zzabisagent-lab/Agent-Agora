# M13 - Admin Panel UI CODE Guide
Version: 1.0.0
Last Updated: 2026-03-28

Refer to CODE-Common-Patterns.md for common patterns.

## 1. Suggested File Structure
- src/pages/admin/AdminDashboardPage.jsx
- src/pages/admin/AdminInvitationsPage.jsx
- src/pages/admin/AdminAgentsPage.jsx
- src/pages/admin/AdminSubAgorasPage.jsx
- src/pages/admin/AdminHumansPage.jsx
- src/pages/admin/AdminAuditLogsPage.jsx
- src/components/admin/DataTable.jsx
- src/components/admin/DetailDrawer.jsx
- src/components/admin/ConfirmModal.jsx
- src/components/admin/RevealSecretPanel.jsx

## 2. Core Components
- AdminSidebar
- FilterBar
- DataTable
- DetailDrawer
- RevealSecretPanel
- RescueActionPanel

## 3. Module-Specific Code Points
- Filter state query sync
- Prefer re-fetching after write operations
- Raw secret / temp password must not be re-displayed
- Rescue / owner transfer must be separated into a dedicated danger action panel
- Clear 401/403 branching

## 4. Test Points
- Dashboard data load
- List filters
- Modal submit
- Reveal key/temp password panel
- Rescue / owner transfer UX
- Detail drawer
