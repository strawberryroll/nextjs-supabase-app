---
name: project-page-spacing-convention
description: Study Notes 프로젝트의 페이지 레벨 여백/타이포그래피 통일 기준 (courses 하위 페이지 vs 홈)
metadata:
  type: project
---

`src/app/courses/[courseId]` 및 `[noteId]` 페이지가 먼저 `py-16 sm:py-24`를 세로 여백 기준으로 채택했고, 홈(`src/app/page.tsx`)도 이에 맞춰 통일했다 (기존 `py-12`에서 변경).

홈 헤딩 컨벤션: `text-4xl font-semibold tracking-tight sm:text-5xl`, 설명문은 `mt-3` + `sm:text-lg`, 헤더 블록과 콘텐츠 사이 `mb-12 sm:mb-16`, 카드 그리드 `gap-6 lg:gap-8`.

**Why:** 프로젝트가 범용 스타터킷에서 "강의 복습 노트 블로그"로 용도가 바뀌면서 홈페이지 본문만 먼저 교체되어 하위 페이지와 여백 기준이 어긋나 있었다. 사용자가 "미니멀 & 여백 중심" 톤 통일을 명시적으로 요청.

**How to apply:** 새 페이지를 추가할 때는 `py-16 sm:py-24`를 기본 세로 여백으로 사용하고, 페이지 대표 헤딩은 `text-4xl ... sm:text-5xl` 스케일을 기준으로 삼는다. 페이지별로 임의의 다른 padding 값을 쓰지 않는다.

관련: [[project-card-hover-pattern]]
