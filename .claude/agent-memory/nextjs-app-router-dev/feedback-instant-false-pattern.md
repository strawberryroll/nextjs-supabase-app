---
name: feedback-instant-false-pattern
description: instant=false를 layout 대신 각 리프 페이지/필요한 layout에만 낮게 적용하는 것이 Next.js 16 공식 권장 패턴
metadata:
  type: feedback
---

Cache Components 모드에서 `SiteHeader`(전역 헤더, `getClaims()`로 `cookies()` 접근) 때문에 여러 리프 페이지(`app/page.tsx`, `app/cart/page.tsx` 등 6곳)와 `app/admin/layout.tsx`에 개별적으로 `export const instant = false`를 붙인 패턴을 리뷰했다.

결론: **layout 한 곳에 몰아서 적용하지 않고, blocking 요인이 있는 지점마다(리프 페이지 또는 하위 공유 layout) 개별적으로 낮게 적용하는 것이 맞다.** `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/02-route-segment-config/instant.md`의 "Disabling static shell validation" 섹션에 정확히 이 규칙이 있음: "Place the `false` as low as possible — only as high as needed to cover the routes you want to opt out — so the rest of the app keeps validating." 루트 layout에 올리면 앱 전체의 정적 셸 검증이 꺼져버려 과도하다.

`app/admin/layout.tsx`(SiteHeader + requireAdmin 둘 다 있는 공유 layout)에 한 번, `app/admin/*/page.tsx` 4개에는 안 붙인 구조가 문서의 이상적 예시(`app/tabs/layout.tsx`에 false, `app/tabs/[tab]/page.tsx`는 비움)와 정확히 일치.

SiteHeader의 `getClaims()` 호출부를 별도 async 컴포넌트로 분리해 `<Suspense>`로 감싸는 리팩터링(`app/protected/page.tsx`의 `AuthButton` 패턴처럼)은 **Phase 2(더미 데이터만 있는 플레이스홀더 단계)에서는 하지 않는 게 맞다**고 판단해 권고함 — 전역 헤더에 Suspense fallback을 걸면 로그인 버튼이 깜빡이는 레이아웃 시프트가 생기고, 실데이터가 없는 상태라 얻는 이득도 없음. Phase 3 실데이터 연동 시점에 `"use cache: private"` 병행 검토와 함께 재작업 권장.

**Why:** instant.md 문서를 실제로 읽고 확인한 공식 가이드라인이며, 프로젝트가 아직 Phase 2 플레이스홀더 단계라는 컨텍스트가 "지금 하지 않는" 판단의 근거였다.
**How to apply:** 이 프로젝트에서 `instant = false` 배치를 다시 검토해야 할 때, 또는 다른 Cache Components 프로젝트에서 유사한 "공유 헤더가 cookies()를 막는" 상황을 만났을 때 이 패턴(낮게, 개별적으로 적용 + 실데이터 단계에서 Suspense 분리 재검토)을 기본값으로 삼을 것.

관련: [[project-overview]]
