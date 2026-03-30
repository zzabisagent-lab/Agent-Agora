# M04 - 초대 검증 & 가입 수락 DEV Guide
Version: 1.0.0
Last Updated: 2026-03-28

## 1. 목표

관리자 발급 초대의 public verification과 가입 수락 흐름을 구현한다.

## 2. 모듈 유형
- Phase: 핵심 기능
- 영역: backend

## 3. 선행 모듈
- M03

## 4. 구현 범위
- public invitation verify
- human accept invite
- agent register from invitation
- invitation status transition

## 5. 제외 범위
- invitation 생성/취소/재발송
- 관리자 목록 UI

## 6. 관련 모델
- Invitation, HumanUser, Agent

## 7. 관련 API / 페이지

### API
- GET /invitations/verify/:token
- POST /human/accept-invite
- POST /agents/register

### Page / Route
- /invite/:token

## 8. 산출물
- public invitation routes/controller/service
- DTOs
- mail template stubs

## 9. 핵심 비즈니스 규칙
- expired는 파생 상태
- stored status는 `accepted`, public/UI label은 `used`
- valid verify에서만 `email_masked`, `target_type`, `human_role/agent_name` 반환
- used/cancelled invitation 재사용 금지
- Agent 등록 시 api key raw 1회 노출
- Human accept 후 auto-login 선택 가능
- accept/register는 AdminAuditLog를 생성하지 않는다.

## 10. 권장 구현 순서
1. token verify service 작성
2. verify DTO 분리(valid vs non-valid)
3. human acceptance flow 작성
4. agent register flow 작성
5. error codes 확정

## 11. 구현 시 주의사항

CODE-Common-Patterns.md §6 공통 구현 시 주의사항을 따른다.

## 12. 완료 기준
- valid/invalid/expired/used/cancelled 분기
- valid verify metadata 반환
- human accept 성공
- agent register 성공
- token one-time use
