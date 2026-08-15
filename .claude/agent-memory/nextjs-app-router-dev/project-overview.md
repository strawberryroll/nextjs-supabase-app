---
name: project-overview
description: 프로젝트 목적, 현재 구현 상태, 주요 파일 위치 요약
metadata:
  type: project
---

Notion CMS 기반 강의 복습 노트 블로그. Phase 1(환경 설정)~Phase 2(공통 모듈) 완료 후 Phase 3(핵심 기능) 구현 완료(2026-06-29 기준).

**Why:** 강의 노트를 Notion에서 작성하면 블로그에 자동 반영되는 구조.

**How to apply:** Phase 4(SEO/태그 필터), Phase 5(배포) 남아있음. 다음 작업 시 ROADMAP.md 참고.

구현 완료 파일:
- `src/lib/notion.ts`: getCourses(), getNotes(), getNote(), Course/Note/BlockObjectResponse 타입
- `src/app/page.tsx`: 강의 목록 Server Component (revalidate=60)
- `src/app/courses/[courseId]/page.tsx`: 노트 목록
- `src/app/courses/[courseId]/[noteId]/page.tsx`: 노트 상세
- `src/components/common/course-card.tsx`: 강의 카드
- `src/components/common/note-card.tsx`: 노트 목록 아이템
- `src/components/common/notion-renderer.tsx`: Notion 블록 렌더러 (8가지 MVP 블록 지원)
