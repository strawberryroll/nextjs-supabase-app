---
name: feedback-params-promise
description: Next.js 16에서 page.tsx의 params/searchParams는 Promise 타입 — await 없이 접근 시 타입 에러
metadata:
  type: feedback
---

Next.js 16부터 `params`와 `searchParams`가 `Promise` 타입으로 변경됨. 반드시 `await` 후 구조 분해.

**Why:** Next.js 16 breaking change. 이전 방식(`params: { courseId: string }`)은 타입 에러 발생.

**How to apply:** 모든 dynamic page.tsx에서 아래 패턴 사용:

```tsx
export default async function Page({
  params,
}: {
  params: Promise<{ courseId: string }>
}) {
  const { courseId } = await params
}
```

[[project-overview]]
