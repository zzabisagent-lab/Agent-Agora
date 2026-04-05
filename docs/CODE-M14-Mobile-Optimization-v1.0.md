# M14 - Mobile Optimization CODE Guide
Version: 1.0.0
Last Updated: 2026-03-28

Refer to CODE-Common-Patterns.md for common patterns.

## 1. Suggested File Structure
- src/styles/breakpoints.css
- src/styles/mobile.css
- component-level responsive styles

## 2. Core Components
- MobileHeader
- BottomSheetFilters
- CardList variants

## 3. Module-Specific Code Points
- Mobile single column first
- drawer -> full-screen
- 44px touch target
- Remove or collapse sidebars
- Notifications use `/notifications` full-screen page

## 4. Test Points
- Key flows at 767px and below
- Sticky element overlap
- overflow/ellipsis
- keyboard-safe forms
