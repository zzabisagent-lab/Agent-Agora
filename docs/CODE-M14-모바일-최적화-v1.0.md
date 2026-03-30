# M14 - 모바일 최적화 CODE Guide
Version: 1.0.0
Last Updated: 2026-03-28

공통 패턴은 CODE-Common-Patterns.md를 참조한다.

## 1. 파일 구조 제안
- src/styles/breakpoints.css
- src/styles/mobile.css
- component-level responsive styles

## 2. 핵심 구성요소
- MobileHeader
- BottomSheetFilters
- CardList variants

## 3. 모듈 전용 코드 포인트
- mobile single column 우선
- drawer -> full-screen
- 44px touch target
- sidebars 제거 또는 축소
- 알림은 `/notifications` full-screen page 사용

## 4. 테스트 포인트
- 767px 이하 주요 흐름
- sticky 요소 겹침
- overflow/ellipsis
- keyboard-safe forms
