---
name: project-task004-customer-ui
description: Phase 2 Task 004 (customer-facing UI) review outcome and route-protection nuance for cart/checkout/orders pages
metadata:
  type: project
---

Phase 2 Task 004 (고객 페이지 UI: `app/page.tsx`, `app/products/[id]/page.tsx`, `app/cart/page.tsx`, `app/checkout/page.tsx`, `app/orders/page.tsx`, `app/orders/complete/page.tsx`) was reviewed 2026-08-21, working-tree state (uncommitted, on top of commit `4d58d57`).

**Server/Client split for `instant = false` pages**: confirmed correct. `app/cart/page.tsx` and `app/checkout/page.tsx` have no `"use client"` directive (verified via grep) and keep `export const instant = false` at the Server Component level; only `components/cart-view.tsx` and `components/checkout-form.tsx` (their client children) carry `"use client"`. This is the right shape — `instant` is a route segment config and Next.js 16 rejects it in a `"use client"` file. See [[project-nextjs-supabase-app]].

**Route protection nuance for `/cart`, `/checkout`, `/orders`**: these routes are NOT under `app/protected/`, so the project's documented pattern (proxy optimistic check + `getClaims()` re-check inside the Server Component, per `app/protected/page.tsx`) is NOT applied here. Protection currently relies solely on `proxy.ts`'s matcher/allowlist logic (`lib/supabase/proxy.ts` only allows `/`, `/login*`, `/auth/*`, `/products*` for anonymous users — everything else including `/cart`, `/checkout`, `/orders` redirects to `/auth/login`). This is proxy-only ("optimistic") protection with no server-side re-verification in the page itself — worth flagging if/when these pages start reading real user-scoped data (Phase 3), since CLAUDE.md explicitly says proxy checks alone are not a complete authorization mechanism.

**`useCart()` multi-instance safety**: confirmed safe, see [[feedback-use-sync-external-store]] update.

**`checkout-form.tsx`**: `form.handleSubmit(onSubmit)` used correctly — react-hook-form blocks `onSubmit` on validation failure by construction, no manual guard needed. Follows `components/login-form.tsx` reference pattern (Controller + Field/FieldLabel/FieldError + zodResolver) exactly.

**`notFound()` in `app/products/[id]/page.tsx`**: works correctly — no custom `app/not-found.tsx` exists, Next.js's built-in 404 is used, confirmed present in build output as `○ /_not-found`.

**Format utils**: `formatCurrencyKRW` from `lib/format.ts` is used consistently across `product-card.tsx`, `add-to-cart-form.tsx` (product detail page, not the form itself), `cart-view.tsx`, `checkout-form.tsx`, orders pages — no hardcoded currency formatting found in this batch.

**Verification run 2026-08-21**: `npm run lint`, `npm run typecheck`, `npm run format:check`, `npm run build` all passed clean on this working tree state.
