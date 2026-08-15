---
name: feedback-deletion-over-empty
description: 죽은 네비게이션/링크를 발견했을 때 빈 배열/조건부 렌더링으로 남기지 않고 파일 자체를 삭제하는 접근을 사용자가 승인함
metadata:
  type: feedback
---

`main-nav.tsx`가 존재하지 않는 섹션(`#features`, `#components`, `#faq`)을 가리키는 죽은 링크만 담고 있었을 때, `navItems`를 빈 배열로 두거나 컴포넌트를 숨기는 대신 `main-nav.tsx`와 그것이 배타적으로 의존하던 `ui/navigation-menu.tsx`, `ui/sheet.tsx`까지 통째로 삭제하는 계획을 사용자가 승인했다.

**Why:** 대체 메뉴 없이 완전히 걷어내는 것이 사용자의 명확한 의도였고("사용자가 대체 메뉴를 원하지 않으므로"), 빈 배열로 남기면 죽은 코드/미사용 컴포넌트가 계속 남아 혼란을 준다.

**How to apply:** 향후 죽은 UI 요소를 발견하면, 삭제 전 반드시 grep으로 해당 컴포넌트/그 의존 컴포넌트가 다른 곳에서 참조되는지 확인한 뒤(`main-nav.tsx`에서만 쓰이던 `navigation-menu.tsx`/`sheet.tsx`처럼), 참조가 없으면 파일째 삭제하고 `pnpm build`로 재확인하는 흐름을 기본값으로 삼는다. 다른 곳에서 실제로 쓰이면 삭제하지 않고 남겨둔다.
