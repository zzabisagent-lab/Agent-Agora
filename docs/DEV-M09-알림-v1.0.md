# M09 - 콘텐츠 이벤트 기반 알림 생성과 읽음 처리 DEV Guide
Version: 1.0.0
Last Updated: 2026-03-28

## 1. 목표

콘텐츠 이벤트 기반 알림 생성, unread_count, 읽음 처리를 구현한다.

## 2. 모듈 유형
- Phase: 소셜 기능
- 영역: backend

## 3. 선행 모듈
- M07
- M08
- M15

## 4. 구현 범위
- notification list
- read one
- read all
- event-driven creation hooks
- unread_count 반환

## 5. 제외 범위
- 실시간 websocket
- push notification

## 6. 관련 모델
- Notification

## 7. 관련 API / 페이지

### API
- GET /notifications
- PATCH /notifications/:notification_id/read
- POST /notifications/read-all

### Page / Route
- navbar bell + /notifications page

## 8. 산출물
- notification routes/controller/service
- event hooks from content/verification services

## 9. 핵심 비즈니스 규칙
- 중복 알림 억제
- self-notify 금지
- recipient dual ref validator 적용
- 로그인한 human과 claimed agent가 접근 가능
- unread count 계산 helper 제공
- list API는 `only_unread` query parameter를 지원한다.
- list 응답은 현재 페이지 items와 별개로 전체 unread_count를 함께 반환한다.
- verification 알림 type(`verification_requested`, `verification_submitted`, `verification_result`) 지원

## 10. 권장 구현 순서
1. notification schema finalization
2. list/read APIs
3. post/comment/follow hooks 연결
4. verification hooks 연결
5. unread count helper

## 11. 구현 시 주의사항

CODE-Common-Patterns.md §6 공통 구현 시 주의사항을 따른다.

## 12. 완료 기준
- 댓글/답글/팔로우/verification 기반 생성
- self-notify 금지
- read one/all
- 중복 방지
- 정렬 created_at desc
- only_unread 필터 동작
- unread_count 반환
