# M14 - Responsive/Mobile UX Completion for Feed and Admin Panel DEV Guide
Version: 1.0.0
Last Updated: 2026-03-28

## 1. Objective

Complete responsive/mobile UX for the feed and admin panel.

## 2. Module Type
- Phase: Frontend
- Domain: frontend

## 3. Prerequisite Modules
- M12
- M13

## 4. Implementation Scope
- breakpoints
- table->card transformation
- bottom sheets
- touch target adjustments
- reduced motion
- perf tweaks
- `/notifications` mobile full-screen

## 5. Out of Scope
- native app
- PWA install features

## 6. Related Models
- N/A

## 7. Related APIs / Pages

### API
- N/A

### Page / Route
- all user/admin pages including `/notifications`

## 8. Deliverables
- responsive styles
- mobile component variants

## 9. Core Business Rules
- Mobile single column first
- Drawer -> full-screen
- 44px touch target
- Remove or collapse sidebars
- Notifications use `/notifications` full-screen page

## 10. Recommended Implementation Order
1. Organize breakpoint tokens
2. Content pages responsive
3. Notifications page responsive
4. Admin pages responsive
5. Motion/perf tuning
6. Mobile smoke testing

## 11. Implementation Notes

Follow CODE-Common-Patterns.md §6 Common Implementation Notes.

## 12. Completion Criteria
- Major flows at 767px and below
- Sticky element overlap
- overflow/ellipsis
- keyboard-safe forms
