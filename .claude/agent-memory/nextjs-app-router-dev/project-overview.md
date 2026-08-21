---
name: project-overview
description: nextjs-supabase-app 저장소의 실제 정체 — 커머스 MVP, npm/flat 구조, cacheComponents 활성화
metadata:
  type: project
---

이 저장소(`/Users/nuyha/workspace/courses/nextjs-supabase-app`)는 Next.js 16(App Router) + Supabase(`@supabase/ssr`) 기반 **커머스 MVP**다. 이전에 다른 대화에서 다뤘던 Notion CMS 강의 노트 블로그(pnpm, src/ 구조, zod 4.0.17 고정 등)와는 **별개의 프로젝트**이므로 그쪽 메모리 내용은 이 저장소에 적용하지 않는다.

핵심 스택/구조:
- npm 사용, `src/` 없이 루트에 `app/` `components/` `lib/` `hooks/` (flat 구조)
- `next.config.ts`에 `cacheComponents: true` — route segment config(`dynamic`/`revalidate`/`fetchCache`) 사용 시 빌드 에러. `"use cache"` + `cacheLife` + `<Suspense>` 조합이 표준
- `middleware.ts` 대신 루트 `proxy.ts` + `lib/supabase/proxy.ts`의 `updateSession()`
- Supabase 클라이언트 3종: `lib/supabase/client.ts`(브라우저) / `server.ts`(Server Component, async) / `proxy.ts`(updateSession)
- `app/protected/page.tsx`가 `getClaims()`를 Suspense로 감싸는 참조 패턴(`components/auth-button.tsx`)을 이미 보유

진행 상태(2026-08-21 기준): Phase 1(라우트 골격) 커밋 완료, Phase 2 Task 003(shadcn 컴포넌트 + 더미 데이터)이 워킹 트리에 미커밋 상태로 존재. 대부분의 페이지가 "구현 예정 (Phase 2)" 플레이스홀더이며 실데이터 연동은 Phase 3 예정.

**Why:** 세션 시작 시 시스템 프롬프트에서 이 프로젝트가 이전 대화 메모리(Notion 블로그)와 다른 프로젝트임을 명시적으로 알려줬음 — 두 프로젝트를 혼동하지 말 것.
**How to apply:** 이 저장소 작업 시작 시 항상 CLAUDE.md/AGENTS.md를 먼저 읽어 표준을 재확인. 다른 프로젝트의 컨벤션(pnpm, src/, zod 버전 고정 등)을 이 저장소에 끌어오지 말 것.

관련: [[feedback-instant-false-pattern]]
