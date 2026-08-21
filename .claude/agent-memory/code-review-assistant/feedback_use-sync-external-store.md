---
name: feedback-use-sync-external-store
description: Pattern to check whenever useSyncExternalStore is used in this repo (or similar localStorage-backed hooks) — snapshot getter must return a stable/cached reference
metadata:
  type: feedback
---

When reviewing any `useSyncExternalStore`-based hook, verify the client snapshot getter returns a value that is `Object.is`-stable across calls when the underlying data hasn't changed. Returning a freshly `JSON.parse`d array/object every call is a bug: React re-invokes the snapshot getter on every render to detect tearing, and a new reference every time can cause "The result of getSnapshot should be cached" warnings or excessive/infinite re-renders.

**Why**: found in `hooks/use-cart.ts` (`readCartFromStorage()` used directly as the `getSnapshot` arg to `useSyncExternalStore`, doing a fresh `JSON.parse` each call) during the Phase 2 Task 003 review (2026-08-21). The project's own established reference pattern, `hooks/use-is-mounted.ts`, does this correctly — its snapshot getters return primitives (`true`/`false`), which are trivially stable. `use-cart.ts` deviated from that pattern by returning a non-primitive without caching.

**How to apply**: When a hook uses `useSyncExternalStore` to read from `localStorage` (or any external mutable store) and the snapshot is an array/object, check that the store keeps a cached copy that's only replaced (and only then triggers a new reference) when a write actually happens — e.g. keep an in-memory cache variable that's updated in the write path and returned as-is by the read path, rather than re-parsing storage on every read.

**Confirmed fixed (2026-08-21, Task 004 review)**: `hooks/use-cart.ts` now caches `cachedItems` at module scope, `getSnapshot`/`getServerSnapshot` both return it directly, and all mutators (`addItem`/`removeItem`/`updateQuantity`/`clearCart`) go through `writeCartToStorage()` which updates `cachedItems` first and then notifies `listeners`. Multiple simultaneous `useCart()` call sites (e.g. `add-to-cart-form.tsx` + `cart-view.tsx` + `checkout-form.tsx`) share the same module-scope `cachedItems`/`listeners`, so no state divergence — this is the correct singleton-store pattern for a `useSyncExternalStore` hook backed by `localStorage`. Good reference implementation to point to in future reviews of similar hooks.
