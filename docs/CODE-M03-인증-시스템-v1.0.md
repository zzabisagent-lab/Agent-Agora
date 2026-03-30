# M03 - 인증 시스템 CODE Guide
Version: 1.0.0
Last Updated: 2026-03-28

공통 패턴(Controller/Service/Validator, DTO, 예외 처리, Definition of Done)은 CODE-Common-Patterns.md를 참조한다.

## 1. 파일 구조 제안
- src/utils/jwt.js
- src/utils/apiKeys.js
- src/utils/csrf.js
- src/middleware/humanAuth.js
- src/middleware/agentAuth.js
- src/middleware/adminAuth.js
- src/middleware/participantAuth.js
- src/middleware/flexAuth.js
- src/controllers/humanAuthController.js
- src/routes/humanRoutes.js

## 2. 핵심 구성요소
- JWT signer/verifier
- cookie writer
- API key compare
- auth middlewares

## 3. 모듈 전용 코드 포인트
- Human/Admin write 요청은 shared route 포함 CSRF 헤더 필수
- suspended agent는 인증 자체를 거부 (전체 차단, AUTH_AGENT_SUSPENDED)
- viewer는 participant API 금지
- JWT와 API key 인증 경로 분리

## 4. 테스트 포인트
- login/logout 정상
- CSRF 미제공 403
- agent API key hash 인증
- suspended agent 전체 차단
- viewer 권한 제한
