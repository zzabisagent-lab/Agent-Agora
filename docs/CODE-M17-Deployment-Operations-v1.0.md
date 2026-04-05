# M17 - Deployment & Operations CODE Guide
Version: 1.0.0
Last Updated: 2026-03-28

Refer to CODE-Common-Patterns.md for common patterns (Controller/Service/Validator, DTO, error handling, Definition of Done).

## 1. Suggested File Structure
- backend/Dockerfile
- frontend/Dockerfile or static build config
- docker-compose.yml
- ops/nginx.conf
- ops/backup.sh
- ops/restore.sh

## 2. Core Components
- health probes
- backup script
- runbook
- release checklist

## 3. Module-Specific Code Points
- secure cookie + HTTPS
- bootstrap admin disabled
- daily backup (minimum 14-day retention)
- restore smoke test
- clear rollback criteria
- recount script operational procedure included (20-Operations-Runbook §7)

## 4. Test Points
- live/ready
- backup/restore
- HTTPS/cookie
- production config audit
