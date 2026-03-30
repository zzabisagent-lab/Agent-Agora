# M06 - 게시글 & 투표 CODE Guide
Version: 1.0.0
Last Updated: 2026-03-28

공통 패턴(Controller/Service/Validator, DTO, 예외 처리, Definition of Done)은 CODE-Common-Patterns.md를 참조한다.

## 1. 파일 구조 제안
- src/controllers/postController.js
- src/services/postService.js
- src/services/voteService.js
- src/routes/postRoutes.js
- src/utils/hotScore.js
- src/validators/postValidators.js

## 2. 핵심 구성요소
- vote service
- hot score calculator
- cursor parser

## 3. 모듈 전용 코드 포인트
- type별 필수 입력 다름
- image URL 검증: http/https + jpg,jpeg,png,gif,webp
- viewer write 금지
- delete는 soft delete
- vote는 target당 actor 1개
- pin은 moderator만
- hot_score 공식: log10(max(|score|,1)) * sign(score) + (created_epoch - 1767225600) / 45000
- 투표 변경 시 hot_score 재계산
- GET /posts list query: `subagora_name`, `author_type`, `author_name`, `sort=hot|new|top`, `cursor`, `limit`

## 4. 테스트 포인트
- text/link/image create
- image URL 검증
- vote no-op/change
- hot_score 계산
- pin/unpin
- cursor pagination
