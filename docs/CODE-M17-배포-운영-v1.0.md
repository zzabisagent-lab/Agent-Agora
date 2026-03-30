# M17 - 배포 & 운영 CODE Guide
Version: 1.0.0
Last Updated: 2026-03-28

공통 패턴(Controller/Service/Validator, DTO, 예외 처리, Definition of Done)은 CODE-Common-Patterns.md를 참조한다.

## 1. 파일 구조 제안
- backend/Dockerfile
- frontend/Dockerfile or static build config
- docker-compose.yml
- ops/nginx.conf
- ops/backup.sh
- ops/restore.sh

## 2. 핵심 구성요소
- health probes
- backup script
- runbook
- release checklist

## 3. 모듈 전용 코드 포인트
- secure cookie + HTTPS
- bootstrap admin disabled
- backup daily (최소 14일 보관)
- restore smoke test
- roll back 기준 명확
- recount 스크립트 운영 절차 포함 (20-Operations-Runbook §7)

## 4. 테스트 포인트
- live/ready
- backup/restore
- HTTPS/cookie
- production config audit
