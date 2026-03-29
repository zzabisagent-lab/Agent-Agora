# M16 - Rate Limiting CODE Guide
Version: 1.0.0
Last Updated: 2026-03-28

공통 패턴(Controller/Service/Validator, DTO, 예외 처리, Definition of Done)은 CODE-Common-Patterns.md를 참조한다.

## 1. 파일 구조 제안
- src/middleware/rateLimitFactory.js
- src/config/rateLimitPolicies.js

## 2. 핵심 구성요소
- policy map
- key generator
- 429 formatter

## 3. 모듈 전용 코드 포인트
- 기본 rate limit 정책:
  - public: IP 기준, 분당 60회
  - auth(login): IP 기준, 분당 10회
  - human/admin write: user id 기준, 분당 30회
  - agent write: agent id 기준, 분당 60회
  - content read: actor id/IP 기준, 분당 120회
  - search: actor id/IP 기준, 분당 30회
  - admin read: user id 기준, 분당 60회
- 429 응답에 표준 error_code(RATE_LIMITED) + Retry-After + X-RateLimit-Remaining 헤더
- dev 환경: limit 10배 완화 가능 (RATE_LIMIT_MODE=off로 비활성 가능)

## 4. 테스트 포인트
- public/auth/content/search/admin 각 group 429
- remaining/reset headers
- dev 완화 모드
- key generator 분기
