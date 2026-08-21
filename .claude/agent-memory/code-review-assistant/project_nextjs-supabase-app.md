---
name: project-nextjs-supabase-app
description: Project identity and standards for the nextjs-supabase-app commerce MVP repo (not to be confused with other Next.js/Supabase starter projects in memory)
metadata:
  type: project
---

This repo (`/Users/nuyha/workspace/courses/nextjs-supabase-app`) is a **재고 부족 자동 재주문 커머스 MVP** built on Next.js 16 (App Router, `cacheComponents: true`, `reactCompiler: true`) + Supabase (`@supabase/ssr`). It is a *different* project from other starter kits that may appear in general memory (e.g. one using pnpm/radix-nova/zod pinned/`src/`) — those details do NOT apply here.

**Package manager**: npm. **Layout**: no `src/`, root-level `app/`, `components/`, `lib/`, `hooks/`.

**Source of truth for standards**: `CLAUDE.md` and `AGENTS.md` at repo root — always re-read them each session since Next.js 16 deviates from training data (e.g. `proxy.ts` replaces `middleware.ts`, `next lint` is removed — must call `eslint` directly).

**Roadmap-driven dev**: `docs/ROADMAP.md` tracks Phase 1-4 tasks with checkboxes; `docs/PRD.md` has the full feature spec (F001-F027). Both are useful to check when reviewing whether a partial/stub implementation is intentional scope-limiting vs. an oversight.

**Verified-legit Next.js 16 API**: `export const instant = false` is a real, documented route segment config (see `node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md`) used to opt a segment out of instant-navigation prerender validation during incremental Cache Components migration. Do not flag this as a hack — it's the sanctioned escape hatch. Confirmed via grep in `node_modules/next/dist/build/segment-config/app/app-segment-config.js` that `instant` is schema-validated and requires `cacheComponents: true`.

See [[feedback-use-sync-external-store]] and [[feedback-review-methodology]].
