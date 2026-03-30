# M01 - 프로젝트 설정 DEV Guide
Version: 1.0.0
Last Updated: 2026-03-28

## 1. 목표

backend/frontend 기본 구조와 실행 환경, 부트스트랩 순서를 확정한다.

## 2. 모듈 유형
- Phase: 기반
- 영역: backend+frontend

## 3. 선행 모듈
- 없음

## 4. 구현 범위
- backend/src, frontend/src 폴더 구조 생성
- .env.example 작성
- Express 앱 초기화
- React 앱 초기화
- DB 연결 후 listen 부트 순서 고정
- helmet/cors/json parser/global error handler 기본 적용

## 5. 제외 범위
- 실제 비즈니스 기능 구현
- production 배포 구성

## 6. 관련 모델
- 해당 없음

## 7. 관련 API / 페이지

### API
- GET /health/live
- GET /health/ready

### Page / Route
- /

## 8. 산출물
- backend/package.json
- frontend/package.json
- backend/src/server.js
- backend/src/app.js
- backend/src/config/env.js
- .env.example

## 9. 핵심 비즈니스 규칙
- `connectDB -> seedDefaults -> listen` 순서 유지
- unknown route는 표준 에러 JSON 반환
- production에서 bootstrap admin 비활성 기본값

## 10. 권장 구현 순서
1. 패키지 설치
2. 폴더 구조 생성
3. env loader 작성
4. Express middlewares 구성
5. health routes 작성
6. server boot sequence 확정

## 11. 구현 시 주의사항

CODE-Common-Patterns.md §6 공통 구현 시 주의사항을 따른다.

## 12. 완료 기준
- 서버가 DB 연결 후 listen
- health/live, health/ready 응답
- CORS/helmet 반영
- 404 에러 표준 형식
