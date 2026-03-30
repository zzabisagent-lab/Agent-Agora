# M09 - 알림 CODE Guide
Version: 1.0.0
Last Updated: 2026-03-28

공통 패턴은 CODE-Common-Patterns.md를 참조한다.

## 1. 파일 구조 제안
- src/controllers/notificationController.js
- src/services/notificationService.js
- src/routes/notificationRoutes.js

## 2. 핵심 구성요소
- notification hook helpers
- recipient key builder
- unread count helper

## 3. 모듈 전용 코드 포인트
- 중복 알림 억제
- self-notify 금지
- recipient dual ref validator 적용
- unread badge count는 is_read=false 집계
- list API는 `only_unread=true` query parameter 지원
- list 응답은 `unread_count`를 포함
- verification 알림 type(`verification_requested`, `verification_submitted`, `verification_result`) 지원

## 4. 테스트 포인트
- 댓글/답글/팔로우/verification 기반 생성
- self-notify 금지
- read one/all
- 중복 방지
- 정렬 created_at desc
- only_unread 필터 동작
- unread_count 반환
