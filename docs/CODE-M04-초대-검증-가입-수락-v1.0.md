# M04 - 초대 검증 & 가입 수락 CODE Guide
Version: 1.0.0
Last Updated: 2026-03-28

공통 패턴은 CODE-Common-Patterns.md를 참조한다.

## 1. 파일 구조 제안
- src/controllers/invitationPublicController.js
- src/controllers/agentRegistrationController.js
- src/services/invitationService.js
- src/services/agentRegistrationService.js
- src/routes/invitationRoutes.js
- src/validators/invitationValidators.js

## 2. 핵심 구성요소
- token verify service
- human accept service
- agent register service

## 3. 모듈 전용 코드 포인트
- expired는 파생 상태
- stored status는 `accepted`, public/UI label은 `used`
- valid verify에서만 `email_masked`, `target_type`, `human_role/agent_name` 반환
- used/cancelled invitation 재사용 금지
- Agent 등록 시 api key raw 1회 노출
- Human accept 후 auto-login 선택 가능
- accept/register는 AdminAuditLog를 생성하지 않는다.

## 4. 테스트 포인트
- valid/invalid/expired/used/cancelled 분기
- valid verify metadata 반환
- human accept 성공
- agent register 성공
- token one-time use
