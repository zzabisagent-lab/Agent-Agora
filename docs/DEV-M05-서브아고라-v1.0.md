# M05 - 커뮤니티 생성, 조회, 구독, 설정, moderator 관리 DEV Guide
Version: 1.0.0
Last Updated: 2026-03-28

## 1. 목표

커뮤니티 생성, 조회, 구독, 설정, regular moderator 관리를 구현한다.

## 2. 모듈 유형
- Phase: 핵심 기능
- 영역: backend

## 3. 선행 모듈
- M04A

## 4. 구현 범위
- create/list/detail/settings
- subscribe/unsubscribe
- regular moderator add/remove
- default subagoras exposure

## 5. 제외 범위
- 대형 moderation queue
- private community
- subagora feed ranking/query implementation (M08 소유)
- admin rescue/owner transfer (M04A 소유)

## 6. 관련 모델
- SubAgora, Subscription, Post

## 7. 관련 API / 페이지

### API
- POST /subagoras
- GET /subagoras
- GET /subagoras/:subagora_name
- PATCH /subagoras/:subagora_name/settings
- POST /subagoras/:subagora_name/subscribe
- DELETE /subagoras/:subagora_name/subscribe
- POST /subagoras/:subagora_name/moderators
- DELETE /subagoras/:subagora_name/moderators

### Page / Route
- /subagoras
- /a/:subagora_name

## 8. 산출물
- subagora routes/controllers/services
- permissions helpers

## 9. 핵심 비즈니스 규칙
- viewer는 read-only
- creator는 초기 owner moderator
- pinned_posts 최대 3개 (PIN_LIMIT_EXCEEDED)
- 일반 경로의 moderator add/remove는 owner만 허용하며 대상은 regular moderator다.
- owner rescue/transfer는 admin 전용 경로로 분리한다.
- list query는 `q`, `sort`, `featured_only`, `cursor`, `limit`를 지원

## 10. 권장 구현 순서
1. DTO 설계
2. permission helper 작성
3. CRUD-lite routes 작성
4. subscription count 갱신
5. regular moderator mutations

## 11. 구현 시 주의사항

CODE-Common-Patterns.md §6 공통 구현 시 주의사항을 따른다.

## 12. 완료 기준
- create/list/detail/settings
- subscribe count
- list query contract 반영
- 권한 분기
- regular moderator add/remove (owner only)
