# M11 - 프론트엔드 기반 CODE Guide
Version: 1.0.0
Last Updated: 2026-03-28

공통 패턴(Controller/Service/Validator, DTO, 예외 처리, Definition of Done)은 CODE-Common-Patterns.md를 참조한다.

## 1. 파일 구조 제안
- src/api/client.js
- src/api/authApi.js
- src/contexts/AuthContext.jsx
- src/app/router.jsx
- src/layouts/AppLayout.jsx
- src/layouts/AdminLayout.jsx
- src/utils/csrf.js

## 2. 핵심 구성요소
- AuthProvider
- ProtectedRoute
- AdminRoute
- ApiErrorBoundary

## 3. 모듈 전용 코드 포인트
- credentials 포함 axios 기본 설정
- human session write 요청에만 csrf header 자동 주입
- 401과 403의 UX 분리
- query params 유틸 통일

## 4. 테스트 포인트
- auth bootstrap
- route guard
- api error handler
- theme/load state
