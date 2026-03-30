# M01 - 프로젝트 설정 CODE Guide
Version: 1.0.0
Last Updated: 2026-03-28

공통 패턴(Controller/Service/Validator, DTO, 예외 처리, Definition of Done)은 CODE-Common-Patterns.md를 참조한다.

## 1. 파일 구조 제안
- src/app.js
- src/server.js
- src/config/env.js
- src/config/db.js
- src/routes/healthRoutes.js
- src/middleware/errorHandler.js

## 2. 핵심 구성요소
- env parser
- db connector
- boot logger
- global error handler

## 3. 모듈 전용 코드 포인트
- `connectDB -> seedDefaults -> listen` 순서 유지
- unknown route는 표준 에러 JSON 반환
- production에서 bootstrap admin 비활성 기본값

## 4. 테스트 포인트
- 서버가 DB 연결 후 listen
- health/live, health/ready 응답
- CORS/helmet 반영
- 404 에러 표준 형식
