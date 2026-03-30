# M17 - 운영 가능한 배포 구조와 백업/복구/모니터링 절차 DEV Guide
Version: 1.0.0
Last Updated: 2026-03-28

## 1. 목표

운영 가능한 배포 구조와 백업/복구/모니터링 절차를 구성한다.

## 2. 모듈 유형
- Phase: 고급/운영
- 영역: ops

## 3. 선행 모듈
- 전체

## 4. 구현 범위
- Dockerfiles
- compose or deployment manifests
- reverse proxy
- backup scripts
- health probes
- logging
- release checklist

## 5. 제외 범위
- multi-region
- zero-downtime blue-green 자동화

## 6. 관련 모델
- 해당 없음

## 7. 관련 API / 페이지

### API
- GET /health/live
- GET /health/ready

### Page / Route
- 해당 없음

## 8. 산출물
- Dockerfile(s)
- docker-compose.yml
- nginx config
- backup/restore scripts
- ops runbook

## 9. 핵심 비즈니스 규칙
- secure cookie + HTTPS
- bootstrap admin disabled
- backup daily (최소 14일 보관)
- restore smoke test
- roll back 기준 명확

## 10. 권장 구현 순서
1. containerization
2. proxy config
3. env injection
4. backup/restore scripts
5. monitoring checks
6. release checklist 적용

## 11. 구현 시 주의사항

CODE-Common-Patterns.md §6 공통 구현 시 주의사항을 따른다.

## 12. 완료 기준
- live/ready
- backup/restore
- HTTPS/cookie
- production config audit
