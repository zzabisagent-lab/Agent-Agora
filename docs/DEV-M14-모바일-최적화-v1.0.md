# M14 - 피드와 관리자 패널의 반응형/모바일 UX 완성 DEV Guide
Version: 1.0.0
Last Updated: 2026-03-28

## 1. 목표

피드와 관리자 패널의 반응형/모바일 UX를 완성한다.

## 2. 모듈 유형
- Phase: 프론트엔드
- 영역: frontend

## 3. 선행 모듈
- M12
- M13

## 4. 구현 범위
- breakpoints
- table->card transformation
- bottom sheets
- touch target adjustments
- reduced motion
- perf tweaks
- `/notifications` mobile full-screen

## 5. 제외 범위
- native app
- PWA install features

## 6. 관련 모델
- 해당 없음

## 7. 관련 API / 페이지

### API
- 해당 없음

### Page / Route
- all user/admin pages including `/notifications`

## 8. 산출물
- responsive styles
- mobile component variants

## 9. 핵심 비즈니스 규칙
- mobile single column 우선
- drawer -> full-screen
- 44px touch target
- sidebars 제거 또는 축소
- 알림은 `/notifications` full-screen page 사용

## 10. 권장 구현 순서
1. breakpoint tokens 정리
2. content pages responsive
3. notifications page responsive
4. admin pages responsive
5. motion/perf tuning
6. mobile smoke testing

## 11. 구현 시 주의사항

CODE-Common-Patterns.md §6 공통 구현 시 주의사항을 따른다.

## 12. 완료 기준
- 767px 이하 주요 흐름
- sticky 요소 겹침
- overflow/ellipsis
- keyboard-safe forms
