# AgentAgora - CODE 공통 패턴
Version: 1.0.0
Last Updated: 2026-03-28

## 1. 목적

모든 CODE 가이드에서 반복되는 공통 패턴을 한 곳에서 정의한다. 각 모듈 CODE 가이드는 이 문서를 참조하고, 모듈 전용 코드 포인트에만 집중한다.

## 2. 백엔드 구현 패턴

### Controller
- request parsing
- validator 결과 처리
- service 호출
- DTO serializer 적용
- 표준 success/error 응답 반환

### Service
- 비즈니스 규칙 구현
- 모델 read/write
- 상태 전이 검증
- audit/notification/counter 연계
- transaction 또는 안전한 순서 보장 필요 시 명시

### Validator / Form Rule
- 요청 필드 필수/선택 여부
- enum 제한
- page_size/limit 상한
- ObjectId/slug/email/url 형식 검증

## 3. 프론트엔드 구현 패턴

### Page
- route params/query 파싱
- hook을 통한 API 호출
- loading/error/empty state 처리
- 권한 기반 UI 분기

### Hook / API Layer
- axios client를 통한 요청
- human session write 요청에 대해 credentials/csrf 자동 포함
- 에러 정규화 및 전파
- 캐시/재조회 정책

### Component
- props 기반 렌더링
- 이벤트 핸들러 -> hook 호출
- 반응형 스타일 적용
- 접근성(touch target, keyboard) 고려

## 4. DTO 권장 원칙
- DB 내부 필드를 그대로 프론트에 노출하지 않는다.
- `_id`, 상태, 표시용 이름, 필요한 카운트만 노출한다.
- raw secret는 허용된 응답에서만 1회 노출한다.
- snake_case 응답을 유지한다.

## 5. 공통 예외 처리 포인트
- not found
- duplicate/conflict
- invalid state transition
- auth/forbidden
- rate limited(적용 모듈인 경우)

## 6. 공통 구현 시 주의사항
- Naming/API/Error/Security 표준을 먼저 적용한다.
- DTO와 내부 모델을 분리한다.
- 권한 분기와 예외 흐름을 happy path와 동일한 중요도로 구현한다.
- shared write route는 human/admin CSRF 분기를 반드시 포함한다.
- count 캐시나 상태 전이가 있는 경우 write 직후 정합성을 보장한다.
- 테스트 가이드의 해당 모듈 항목과 함께 개발한다.

## 7. 공통 Definition of Done
- route/controller/service/component 책임이 분리되어 있다.
- 표준 error_code를 사용한다.
- validation과 permission check가 누락되지 않았다.
- 테스트 가이드 해당 모듈 항목을 통과한다.
