# M13 - Admin Panel with Dashboard, List, Drawer, and Modal DEV Guide
Version: 1.0.0
Last Updated: 2026-03-28

## 1. Objective

Implement an admin panel based on admin dashboard, list, drawer, and modal.

## 2. Module Type
- Phase: Frontend
- Domain: frontend

## 3. Prerequisite Modules
- M11
- M04A

## 4. Implementation Scope
- dashboard
- invitations, agents, subagoras, humans, audit logs
- filters, detail drawers, confirm modals
- reveal secret panel
- rescue / owner transfer UI

## 5. Out of Scope
- Content moderation queue
- Mobile full polish

## 6. Related Models
- N/A

## 7. Related APIs / Pages

### API
- Admin endpoints
- public `GET /subagoras`, `GET /subagoras/:subagora_name`

### Page / Route
- /admin, /admin/invitations, /admin/agents, /admin/subagoras, /admin/humans, /admin/audit-logs

## 8. Deliverables
- admin pages/components/hooks

## 9. Core Business Rules
- Filter state query sync
- Refetch after write operations
- Prohibit re-displaying raw secrets
- Display temp password only once via RevealSecretPanel
- Rescue / owner transfer must use a separate high-risk action UX
- Clear 401/403 branching

## 10. Recommended Implementation Order
1. Write admin api client
2. Implement dashboard cards
3. Implement table/card list
4. Implement drawer/modal/reveal panel
5. Implement subagora rescue / owner transfer UI
6. Implement filter hooks

## 11. Implementation Notes

Follow CODE-Common-Patterns.md §6 Common Implementation Notes.

## 12. Completion Criteria
- dashboard data load
- list filters
- modal submit
- reveal key/temp password panel
- rescue / owner transfer UX
- detail drawer
