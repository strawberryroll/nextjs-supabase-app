---
name: feedback-review-methodology
description: How the user likes review scope determined in this repo — spans committed + uncommitted changes, verify Next.js 16 API claims against node_modules docs before flagging as issues
metadata:
  type: feedback
---

In this repo, review scope is often "last N commits PLUS current working tree changes" rather than just `git diff HEAD~1`. The user explicitly asked to combine `git status` (untracked/modified) with recent commit history to build full review scope for a logical unit of work (a Phase/Task) that spans a commit boundary.

**Why**: the user's Shrimp-task-manager-driven workflow commits Phase/Task work incrementally, and a "Task" (e.g. Phase 2 Task 003: shadcn install + mock data layer) may be partly committed and partly still in the working tree when review is requested.

**How to apply**: always run both `git log --oneline` and `git status` before scoping a review; ask/infer which commits + uncommitted files together constitute the unit being reviewed, per user's explicit file list if given.

Also: this project runs on Next.js 16 with breaking changes from training data (see `AGENTS.md`). Before flagging any route-segment-config-looking export (e.g. `instant`, `cacheLife`) as wrong or non-standard, grep `node_modules/next/dist/docs/` and `node_modules/next/dist/build/segment-config/` to verify — don't rely on pre-16 Next.js knowledge. See [[project-nextjs-supabase-app]].
