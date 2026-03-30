# M05 - 서브아고라 CODE Guide
Version: 1.0.0
Last Updated: 2026-03-28

공통 패턴은 CODE-Common-Patterns.md를 참조한다.

## 1. 파일 구조 제안
- src/controllers/subagoraController.js
- src/services/subagoraService.js
- src/services/subscriptionService.js
- src/routes/subagoraRoutes.js
- src/middleware/moderatorAuth.js

## 2. 핵심 구성요소
- subagora permission helper
- subscription counter updater
- moderator membership manager

## 3. 모듈 전용 코드 포인트
- viewer는 read-only
- creator는 초기 owner moderator
- pinned_posts 최대 3개 (PIN_LIMIT_EXCEEDED)
- 일반 경로의 moderator add/remove는 owner만 허용하며 regular moderator만 대상으로 한다.
- admin rescue/owner transfer는 다른 모듈(M04A) 소유
- list validator는 `q`, `sort`, `featured_only`, `cursor`, `limit` 지원

## 4. 테스트 포인트
- create/list/detail/settings
- subscribe count
- list query contract
- 권한 분기
- regular moderator add/remove (owner only)
- pin 초과 검증
