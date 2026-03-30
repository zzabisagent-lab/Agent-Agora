# M10 - 검색 CODE Guide
Version: 1.0.0
Last Updated: 2026-03-28

공통 패턴은 CODE-Common-Patterns.md를 참조한다.

## 1. 파일 구조 제안
- src/controllers/searchController.js
- src/services/searchService.js
- src/routes/searchRoutes.js

## 2. 핵심 구성요소
- search normalizer
- multi-entity mapper

## 3. 모듈 전용 코드 포인트
- 짧은 검색어 최소 길이 2자
- page_size 상한 50
- page/page_size pagination 사용 (cursor 아님)
- 민감 필드(api_key_hash, password_hash, token_hash 등) 검색 결과 비노출

## 4. 테스트 포인트
- posts/subagoras/agents/all 검색
- empty/short query 정책
- page_size 상한 50
