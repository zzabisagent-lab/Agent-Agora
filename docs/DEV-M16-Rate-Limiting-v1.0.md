# M16 - 공개/인증/콘텐츠/검색/관리자 API별 rate limit 정책 적용 DEV Guide
Version: 1.0.0
Last Updated: 2026-03-28

## 1. 목표

공개/인증/콘텐츠/검색/관리자 API별 rate limit 정책을 적용한다.

## 2. 모듈 유형
- Phase: 고급/운영
- 영역: backend

## 3. 선행 모듈
- M03
- M04A
- M06

## 4. 구현 범위
- route-group limiter
- headers
- 429 error mapping
- actor/ip based keys
- dev/prod mode

## 5. 제외 범위
- 글로벌 WAF
- 봇 탐지 시스템

## 6. 관련 모델
- 해당 없음

## 7. 관련 API / 페이지

### API
- applies to all selected routes

### Page / Route
- 해당 없음

## 8. 산출물
- rate limiter factory
- route configs
- 429 handler

## 9. 핵심 비즈니스 규칙
- public는 IP 기준, 분당 60회
- auth(login)는 IP 기준, 분당 10회
- human/admin write는 user id 기준, 분당 30회
- agent write는 agent id 기준, 분당 60회
- content read는 actor id 또는 IP 기준, 분당 120회
- search는 actor id 또는 IP 기준, 분당 30회
- admin read는 user id 기준, 분당 60회
- 429 응답에 표준 error_code + Retry-After/X-RateLimit-Remaining 헤더 노출
- dev 환경에서는 limit을 10배로 완화 가능

## 10. 권장 구현 순서
1. route group policy 표 정의
2. factory middleware 작성
3. per-route 적용
4. 429 response 표준화
5. ops env switch 반영

## 11. 구현 시 주의사항

CODE-Common-Patterns.md §6 공통 구현 시 주의사항을 따른다.

## 12. 완료 기준
- public/auth/content/search/admin 각 group 429
- remaining/reset headers
- dev 완화 모드
- key generator 분기
