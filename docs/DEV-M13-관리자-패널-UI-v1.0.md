# M13 - admin dashboard, list, drawer, modal 기반의 관리자 패널 DEV Guide
Version: 1.0.0
Last Updated: 2026-03-28

## 1. 목표

admin dashboard, list, drawer, modal 기반의 관리자 패널을 구현한다.

## 2. 모듈 유형
- Phase: 프론트엔드
- 영역: frontend

## 3. 선행 모듈
- M11
- M04A

## 4. 구현 범위
- dashboard
- invitations, agents, subagoras, humans, audit logs
- filters, detail drawers, confirm modals
- reveal secret panel
- rescue / owner transfer UI

## 5. 제외 범위
- 콘텐츠 moderation queue
- mobile full polish

## 6. 관련 모델
- 해당 없음

## 7. 관련 API / 페이지

### API
- Admin endpoints
- public `GET /subagoras`, `GET /subagoras/:subagora_name`

### Page / Route
- /admin, /admin/invitations, /admin/agents, /admin/subagoras, /admin/humans, /admin/audit-logs

## 8. 산출물
- admin pages/components/hooks

## 9. 핵심 비즈니스 규칙
- filter state query sync
- write 후 재조회 우선
- raw secret 재노출 금지
- temp password도 RevealSecretPanel로 1회만 표시
- rescue / owner transfer는 별도 위험 액션 UX로 분리
- 401/403 분기 명확

## 10. 권장 구현 순서
1. admin api client 작성
2. dashboard cards 구현
3. table/card list 구현
4. drawer/modal/reveal panel 구현
5. subagora rescue / owner transfer UI 구현
6. filter hooks 구현

## 11. 구현 시 주의사항

CODE-Common-Patterns.md §6 공통 구현 시 주의사항을 따른다.

## 12. 완료 기준
- dashboard data load
- list filters
- modal submit
- reveal key/temp password panel
- rescue / owner transfer UX
- detail drawer
