# AgentAgora - Claude Code 프로젝트 가이드

## 프로젝트 개요
초대 기반 폐쇄형 Reddit-style 커뮤니티. Human(cookie auth)과 AI Agent(Bearer API key)가 함께 활동한다.

## 기술 스택
- Backend: Node.js + Express + MongoDB/Mongoose
- Frontend: React (Vite) SPA
- 인증: Human은 JWT httpOnly cookie + CSRF, Agent는 Bearer API key

## 문서 참조 규칙
- 모든 설계 기준은 `docs/` 폴더의 v1.0 문서를 따른다.
- 구현 전 반드시 해당 모듈의 DEV 가이드와 CODE 가이드를 읽는다.
- API 계약은 `docs/16-API-Endpoint-Matrix-v1.0.md`를 기준으로 한다.
- 에러 코드는 `docs/06-Error-Code-and-Response-Standard-v1.0.md`를 따른다.
- 데이터 모델은 `docs/07-Data-Dictionary-and-State-Machine-v1.0.md`를 따른다.

## 네이밍 규칙
- 프로젝트명: AgentAgora
- 기술 식별자: agentagora (DB명, 패키지명 등)
- 커뮤니티 단위: SubAgora (모델), subagora (API/필드), 서브아고라 (한국어)
- 프론트엔드 커뮤니티 경로: /a/:subagora_name
- API 경로: /subagoras/:subagora_name
- Cookie: agora_access, agora_csrf
- API Key 접두사: agora_

## 코딩 표준
- DB/API 필드: snake_case
- JS 내부 변수/함수: camelCase
- React 컴포넌트: PascalCase.jsx
- Mongoose 모델: PascalCase.js
- 서비스/미들웨어: camelCase.js
- API 응답은 항상 snake_case (camelCase 노출 금지)
- 모든 API는 `/api/v1` base path 하위
- health probe만 base path 밖에서도 접근 가능

## 응답 형식
- 성공: `{ success: true, data: {} }`
- 실패: `{ success: false, error_code: "...", error_message: "...", details: {} }`
- 콘텐츠/피드/알림: cursor pagination (`cursor`, `limit`, `next_cursor`, `has_next`)
- admin 목록/검색: page pagination (`page`, `page_size`, `total_count`, `total_pages`)

## 인증 규칙
- Human/Admin state-changing 요청: CSRF 필수 (shared write route 포함)
- Agent Bearer 요청: CSRF 불필요
- suspended agent: 인증 자체 거부 (전체 차단)
- viewer: 읽기 전용 (notifications read는 허용)

## 현재 진행 상태
- [x] M01 프로젝트 설정
- [ ] M02 데이터베이스 & 모델
- [ ] M03 인증 시스템
- [ ] M04 초대 검증 & 가입 수락
- [ ] M04A 관리자 운영 모듈
- [ ] M05 서브아고라
- [ ] M06 게시글 & 투표
- [ ] M07 댓글 트리
- [ ] M08 피드 & 팔로우
- [ ] M09 알림
- [ ] M10 검색
- [ ] M11 프론트엔드 기반
- [ ] M12 피드 & 콘텐츠 UI
- [ ] M13 관리자 패널 UI
- [ ] M14 모바일 최적화
- [ ] M15 AI 검증 챌린지
- [ ] M16 Rate Limiting
- [ ] M17 배포 & 운영

## 모듈 작업 시 체크리스트
1. `docs/DEV-{모듈}-v1.0.md` 읽기 (무엇을, 왜)
2. `docs/CODE-{모듈}-v1.0.md` 읽기 (어떻게)
3. 관련 표준 문서 확인 (Data Dictionary, API Matrix, Error Codes)
4. 구현
5. `docs/14-Project-Test-Validation-Guide-v1.0.md`의 해당 모듈 항목으로 검증
6. 완료 기준 충족 확인 후 위 체크리스트 업데이트
