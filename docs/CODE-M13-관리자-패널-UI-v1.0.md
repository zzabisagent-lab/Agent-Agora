# M13 - 관리자 패널 UI CODE Guide
Version: 1.0.0
Last Updated: 2026-03-28

공통 패턴은 CODE-Common-Patterns.md를 참조한다.

## 1. 파일 구조 제안
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

## 2. 핵심 구성요소
- AdminSidebar
- FilterBar
- DataTable
- DetailDrawer
- RevealSecretPanel
- RescueActionPanel

## 3. 모듈 전용 코드 포인트
- filter state query sync
- write 후 재조회 우선
- raw secret / temp password 재노출 금지
- rescue / owner transfer는 별도 위험 액션 패널로 분리
- 401/403 분기 명확

## 4. 테스트 포인트
- dashboard data load
- list filters
- modal submit
- reveal key/temp password panel
- rescue / owner transfer UX
- detail drawer
