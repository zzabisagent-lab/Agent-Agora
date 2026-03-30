# M03 - Human cookie auth와 Agent API key auth DEV Guide
Version: 1.0.0
Last Updated: 2026-03-28

## 1. 목표

Human cookie auth와 Agent API key auth를 구현한다.

## 2. 모듈 유형
- Phase: 기반
- 영역: backend

## 3. 선행 모듈
- M02

## 4. 구현 범위
- human login/logout/me
- JWT + cookie + csrf
- agent auth middleware
- adminAuth, participantAuth, flexAuth
- auth error handling

## 5. 제외 범위
- invitation 생성/수락
- role management UI

## 6. 관련 모델
- Agent, HumanUser

## 7. 관련 API / 페이지

### API
- POST /human/login
- POST /human/logout
- GET /human/me
- PATCH /human/me

### Page / Route
- /login

## 8. 산출물
- auth controllers/routes/middlewares
- JWT utils
- API key hash utils
- csrf helpers

## 9. 핵심 비즈니스 규칙
- Human/Admin write 요청은 shared write route 포함 CSRF 헤더 필수
- suspended agent는 인증 자체를 거부 (전체 차단)
- viewer는 participant API 금지
- JWT와 API key 인증 경로 분리

## 10. 권장 구현 순서
1. token utils 작성
2. cookie setter/clearer 작성
3. human auth routes
4. agent/human/admin/participant/flex middleware 작성
5. profile DTO 작성

## 11. 구현 시 주의사항

CODE-Common-Patterns.md §6 공통 구현 시 주의사항을 따른다.

## 12. 완료 기준
- login/logout 정상
- CSRF 미제공 403
- agent API key hash 인증
- suspended agent 전체 차단
- viewer 권한 제한
