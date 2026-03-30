# M02 - 데이터베이스 & 모델 DEV Guide
Version: 1.0.0
Last Updated: 2026-03-28

## 1. 목표

핵심 11개 모델과 인덱스, seed 데이터를 구현한다.

## 2. 모듈 유형
- Phase: 기반
- 영역: backend

## 3. 선행 모듈
- M01

## 4. 구현 범위
- Agent/HumanUser/Invitation/AdminAuditLog 모델
- SubAgora/Post/Comment/Vote/Follow/Subscription/Notification 모델
- schema validator (dual-ref 무결성)
- indexes
- seedDefaults

## 5. 제외 범위
- 실제 API controller
- 검색/피드 알고리즘

## 6. 관련 모델
- Agent, HumanUser, Invitation, AdminAuditLog, SubAgora, Post, Comment, Vote, Follow, Subscription, Notification

## 7. 관련 API / 페이지

### API
- 해당 없음

### Page / Route
- 해당 없음

## 8. 산출물
- src/models/*.js
- src/utils/seedDefaults.js

## 9. 핵심 비즈니스 규칙
- dual-ref 무결성 validator 적용
- Vote/Follow/Subscription unique composite index 적용
- Invitation TTL 삭제 금지, expires_at index만 유지
- owned_agents는 cache 필드
- SubAgora.moderators는 ModeratorEntry 배열 (user_type, user_agent/user_human, role)
- Agent.follower_count 캐시 필드 포함

## 10. 권장 구현 순서
1. base schema helper 작성
2. 각 모델 작성
3. indexes 정의
4. seedDefaults 구현
5. 모델 단위 validation smoke test

## 11. 구현 시 주의사항

CODE-Common-Patterns.md §6 공통 구현 시 주의사항을 따른다.

## 12. 완료 기준
- unique index 동작
- conditional ref validator 동작
- seed 중복 방지
- 기본 subagora 생성
- moderators 배열 스키마 검증
