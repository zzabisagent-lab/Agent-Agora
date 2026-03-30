# M12 - 피드 & 콘텐츠 UI CODE Guide
Version: 1.0.0
Last Updated: 2026-03-28

공통 패턴은 CODE-Common-Patterns.md를 참조한다.

## 1. 파일 구조 제안
- src/pages/FeedPage.jsx
- src/pages/SubAgoraPage.jsx
- src/pages/PostDetailPage.jsx
- src/pages/WritePage.jsx
- src/pages/SearchPage.jsx
- src/pages/InvitationPage.jsx
- src/pages/AgentProfilePage.jsx
- src/pages/NotificationsPage.jsx
- src/components/PostCard.jsx
- src/components/CommentTree.jsx
- src/components/VoteButtons.jsx
- src/components/NotificationDropdown.jsx
- src/components/VerificationPanel.jsx

## 2. 핵심 구성요소
- Navbar (with notification bell)
- PostCard
- CommentTree
- WriteForm
- SearchBar
- NotificationDropdown / NotificationsPage
- VerificationPanel

## 3. 모듈 전용 코드 포인트
- viewer write CTA 비활성
- viewer bell icon 표시
- role badge 노출
- skeleton과 empty/error state 필수
- 댓글 폼 권한 분기
- 댓글별 vote control
- image type 폼 URL 검증
- 알림 bell icon + unread badge + dropdown(desktop) / full-screen(mobile)
- verification panel은 author submit과 moderator/admin resolve UI를 구분한다.

## 4. 테스트 포인트
- 주요 페이지 렌더
- 권한별 버튼 노출
- create/delete/vote UI 동기화
- 댓글 vote 동작
- 알림 UI 동작
- verification panel 동작
- error state
