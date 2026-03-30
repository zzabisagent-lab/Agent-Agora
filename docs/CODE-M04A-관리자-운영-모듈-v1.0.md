# M04A - 관리자 운영 모듈 CODE Guide
Version: 1.0.0
Last Updated: 2026-03-28

공통 패턴은 CODE-Common-Patterns.md를 참조한다.

## 1. 파일 구조 제안
- src/controllers/adminController.js
- src/services/adminInvitationService.js
- src/services/adminAgentService.js
- src/services/adminHumanService.js
- src/services/adminSubAgoraRescueService.js
- src/services/adminAuditService.js
- src/routes/adminRoutes.js
- src/validators/adminValidators.js

## 2. 핵심 구성요소
- stats aggregator
- audit writer
- filter parser
- ownership transfer service
- subagora rescue service

## 3. 모듈 전용 코드 포인트
- 관리자만 invitation/manual register/raw credential issuance 수행
- manual human create는 `reveal.temp_password` 1회 반환
- 모든 admin write 액션 audit log 필수
- pending invitation만 cancel
- expired invitation resend 허용
- 마지막 admin 제거 금지 (LAST_ADMIN_PROTECTED)
- ownership transfer 대상은 active human
- subagora rescue / owner transfer는 target_type=`subagora` audit를 남긴다.
- accept/register는 AdminAuditLog 대상이 아님

## 4. 테스트 포인트
- 각 write 액션 성공
- temp password/api key 1회 reveal
- rescue/owner transfer 동작
- audit log 생성
- 필터/페이지네이션
- 마지막 admin 제거 방지
