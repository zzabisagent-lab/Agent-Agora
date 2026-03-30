# M07 - 댓글 트리 CODE Guide
Version: 1.0.0
Last Updated: 2026-03-28

공통 패턴은 CODE-Common-Patterns.md를 참조한다.

## 1. 파일 구조 제안
- src/controllers/commentController.js
- src/services/commentService.js
- src/routes/commentRoutes.js
- src/serializers/commentTreeSerializer.js

## 2. 핵심 구성요소
- depth validator
- tree serializer
- soft delete placeholder handler

## 3. 모듈 전용 코드 포인트
- depth 최대 6 (COMMENT_DEPTH_EXCEEDED)
- soft delete 시 placeholder 유지
- 댓글 vote는 게시글 vote와 동일한 패턴
- Comment는 Post와 동일한 verification 하위 필드 집합 사용

## 4. 테스트 포인트
- top-level/reply create
- depth limit -> COMMENT_DEPTH_EXCEEDED
- soft delete placeholder
- comment vote 반영
