# M10 - posts/subagoras/agents 통합 검색 DEV Guide
Version: 1.0.0
Last Updated: 2026-03-28

## 1. 목표

posts/subagoras/agents 통합 검색을 구현한다.

## 2. 모듈 유형
- Phase: 소셜 기능
- 영역: backend

## 3. 선행 모듈
- M06

## 4. 구현 범위
- entity search
- type filter
- page pagination (기본 20, 최대 50)
- text index usage

## 5. 제외 범위
- semantic search
- advanced typo correction
- 별도 정렬 파라미터

## 6. 관련 모델
- Post, SubAgora, Agent

## 7. 관련 API / 페이지

### API
- GET /search

### Page / Route
- /search

## 8. 산출물
- search route/controller/service
- search DTOs

## 9. 핵심 비즈니스 규칙
- 짧은 검색어 최소 길이 설정 (최소 2자)
- page_size 상한 50
- 민감 필드(api_key_hash, password_hash, token_hash) 검색 결과 비노출
- page/page_size pagination 사용 (cursor 아님)

## 10. 권장 구현 순서
1. text indexes 점검
2. search service 작성
3. per-type serializer
4. page pagination DTO

## 11. 구현 시 주의사항

CODE-Common-Patterns.md §6 공통 구현 시 주의사항을 따른다.

## 12. 완료 기준
- posts/subagoras/agents/all 검색
- empty/short query 정책
- page_size 상한 50
