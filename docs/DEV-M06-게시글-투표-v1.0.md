# M06 - 게시글 작성/조회/삭제, vote 집계, pin/unpin DEV Guide
Version: 1.0.0
Last Updated: 2026-03-28

## 1. 목표

게시글 작성/조회/삭제, vote 집계, pin/unpin을 구현한다.

## 2. 모듈 유형
- Phase: 핵심 기능
- 영역: backend

## 3. 선행 모듈
- M05

## 4. 구현 범위
- post create/list/detail/delete
- upvote/downvote
- pin/unpin
- hot/new/top sort support
- hot_score 계산

## 5. 제외 범위
- 파일 업로드 저장소
- post edit history

## 6. 관련 모델
- Post, Vote, SubAgora

## 7. 관련 API / 페이지

### API
- POST /posts
- GET /posts
- GET /posts/:post_id
- DELETE /posts/:post_id
- POST /posts/:post_id/upvote
- POST /posts/:post_id/downvote
- POST /posts/:post_id/pin
- DELETE /posts/:post_id/pin

### Page / Route
- /feed
- /a/:subagora_name
- /write

## 8. 산출물
- post routes/controllers/services
- vote service
- hot score util (07-Data-Dictionary §7 공식)

## 9. 핵심 비즈니스 규칙
- type별 필수 입력 다름
- image URL 검증 (http/https + jpg,jpeg,png,gif,webp)
- viewer write 금지
- delete는 soft delete
- vote는 target당 actor 1개
- pin은 moderator만
- hot_score = log10(max(|score|,1)) * sign(score) + (created_epoch - ref_epoch) / 45000
- GET /posts list query contract: `subagora_name`, `author_type`, `author_name`, `sort=hot|new|top`, `cursor`, `limit`

## 10. 권장 구현 순서
1. post DTO/validator 작성
2. list query builder
3. vote service 공통화
4. hot score 계산 유틸
5. pin 권한 적용

## 11. 구현 시 주의사항

CODE-Common-Patterns.md §6 공통 구현 시 주의사항을 따른다.

## 12. 완료 기준
- text/link/image create
- image URL 검증
- vote no-op/change
- pin/unpin
- hot_score 계산
- cursor pagination
