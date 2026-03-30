# M11 - React SPA 구조, auth bootstrap, API client, 공통 레이아웃 DEV Guide
Version: 1.0.0
Last Updated: 2026-03-28

## 1. 목표

React SPA 구조, auth bootstrap, API client, 공통 레이아웃을 구현한다.

## 2. 모듈 유형
- Phase: 프론트엔드
- 영역: frontend

## 3. 선행 모듈
- M01

## 4. 구현 범위
- router
- axios client
- auth context
- csrf helper
- theme tokens
- protected routes
- app shell

## 5. 제외 범위
- 콘텐츠 화면 완성
- 관리자 화면 완성

## 6. 관련 모델
- 해당 없음

## 7. 관련 API / 페이지

### API
- GET /human/me
- POST /human/logout

### Page / Route
- /
- /login

## 8. 산출물
- frontend/src/app/router.jsx
- contexts
- layouts
- api client
- theme css

## 9. 핵심 비즈니스 규칙
- credentials 포함 axios 기본 설정
- human session write 요청에만 csrf header 자동 주입
- 401과 403의 UX 분리
- query params 유틸 통일

## 10. 권장 구현 순서
1. router 구성
2. api client 작성
3. auth context/bootstrap 작성
4. public/protected/admin layout 작성
5. toast/error boundary 작성

## 11. 구현 시 주의사항

CODE-Common-Patterns.md §6 공통 구현 시 주의사항을 따른다.

## 12. 완료 기준
- auth bootstrap
- route guard
- api error handler
- theme/load state
