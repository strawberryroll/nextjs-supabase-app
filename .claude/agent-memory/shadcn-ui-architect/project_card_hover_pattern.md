---
name: project-card-hover-pattern
description: Study Notes 프로젝트에서 카드형 컴포넌트(course-card, note-card)에 통일 적용하는 hover 인터랙션 클래스 패턴
metadata:
  type: project
---

`src/components/common/course-card.tsx`, `src/components/common/note-card.tsx`에 적용된 hover 스타일 컨벤션.

카드 hover 시 공통 클래스:
```
transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg hover:shadow-foreground/5 hover:ring-foreground/20
```

썸네일 이미지가 있는 카드(course-card)는 `Card`(`src/components/ui/card.tsx`)가 이미 `group/card` 네임스페이스를 갖고 있으므로, 이미지 확대 효과는 별도 `group` 클래스 추가 없이 `group-hover/card:scale-105`로 트리거한다 (이미지에 `transition-transform duration-500` 병행).

**Why:** 사용자가 "미니멀 & 여백 중심" 톤으로 카드 hover를 개선해달라고 요청했고, 두 카드 컴포넌트(course-card, note-card)뿐이라 공통 클래스를 별도 유틸/상수로 추상화하지 않고 각 파일에 직접 기술하는 방식을 승인했다 (과설계 방지).

**How to apply:** 이후 카드형 컴포넌트를 추가로 만들 때 이 hover 패턴을 재사용하되, 컴포넌트 수가 3개 이상으로 늘어나면 그때 공통 유틸화를 고려한다. `Card`에 커스텀 `className`을 줄 때는 `card.tsx`의 `group/card` 네임스페이스를 먼저 확인하고 충돌 없이 트리거할 것.

관련: [[project-page-spacing-convention]]
