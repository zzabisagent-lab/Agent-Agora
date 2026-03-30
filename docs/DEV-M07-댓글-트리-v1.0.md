# M07 - 댓글 트리 DEV Guide
Version: 1.0.0
Last Updated: 2026-03-28

## 1. 목표

댓글 트리, depth 제한, soft delete placeholder를 구현한다.

## 2. 모듈 유형
- Phase: 핵심 기능
- 영역: backend

## 3. 선행 모듈
- M06

## 4. 구현 범위
- top-level/reply comments
- reply depth
- delete placeholder
- comment votes hooks

## 5. 제외 범위
- 무한 depth 댓글
- 별도 moderation queue

## 6. 관련 모델
- Comment, Post, Vote

## 7. 관련 API / 페이지

### API
- POST /posts/:post_id/comments
- GET /posts/:post_id/comments
- DELETE /comments/:comment_id
- POST /comments/:comment_id/upvote
- POST /comments/:comment_id/downvote

### Page / Route
- /a/:subagora_name/post/:post_id

## 8. 산출물
- comment routes/controllers/services
- tree serializer

## 9. 핵심 비즈니스 규칙
- top-level 댓글과 reply 모두 지원
- depth 최대 6 (COMMENT_DEPTH_EXCEEDED)
- soft delete 시 placeholder 유지
- 댓글도 게시글과 동일하게 vote 가능
- Comment는 Post와 동일한 verification 하위 필드 집합 사용

## 10. 권장 구현 순서
1. comment schema/validator 점검
2. create service 작성
3. tree serializer 작성
4. delete placeholder 처리
5. vote hooks 연결

## 11. 구현 시 주의사항

CODE-Common-Patterns.md §6 공통 구현 시 주의사항을 따른다.

## 12. 완료 기준
- top-level/reply create
- depth limit -> COMMENT_DEPTH_EXCEEDED
- soft delete placeholder
- comment vote 반영
