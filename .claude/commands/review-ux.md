---
description: 코드를 UI/UX 관점에서 리뷰합니다 (접근성, 반응형, 다크모드, 일관성). 인자로 특정 파일/경로 지정 가능, 없으면 git diff 대상
argument-hint: [파일 또는 경로 (선택, 미지정 시 git diff 대상)]
allowed-tools: Bash(git diff:*), Bash(git status:*), Bash(git diff --name-only:*)
---

## 컨텍스트

- 현재 git 상태: !`git status --short`
- 변경 내역 (unstaged + staged): !`git diff HEAD`

## 작업

대상: $ARGUMENTS

- `$ARGUMENTS`가 비어있지 않으면, 지정된 파일/경로를 직접 읽어서 리뷰 대상으로 삼는다.
- `$ARGUMENTS`가 비어있으면, 위 "변경 내역(git diff)"에 포함된 파일들을 리뷰 대상으로 삼는다. 변경 내역이 없으면 "리뷰할 변경 사항이 없습니다"라고 안내하고 종료한다.

리뷰 대상 코드를 **UI/UX 관점**에서 분석하고, 아래 체크리스트를 기준으로 이슈를 찾는다. 이 프로젝트의 `CLAUDE.md`에 정의된 아키텍처/스타일 규칙을 기준으로 판단한다.

### 체크리스트

1. **접근성(a11y)**
   - `aria-*` 속성, 시맨틱 태그(`button`, `nav`, `label` 등) 사용 여부
   - `FieldLabel`의 `htmlFor`와 `Input`의 `id`가 올바르게 매칭되는지
   - 키보드로 포커스/조작 가능한지 (interactive 요소에 `tabIndex`, 클릭 핸들러만 있는 `div` 등)
   - 이미지/아이콘에 적절한 `alt`, `aria-label` 제공 여부

2. **다크모드 대응**
   - `text-black`, `bg-white`, `#fff` 같은 하드코딩된 색상값 대신 `bg-background`, `text-foreground`, `text-muted-foreground` 등 shadcn 테마 변수를 사용하는지
   - `.dark` 클래스 환경에서 대비(contrast)가 깨질 수 있는 색상 조합이 있는지

3. **반응형 디자인**
   - 모바일 우선(`sm:`, `md:`, `lg:`) 클래스 패턴을 따르는지
   - 페이지/섹션 레벨 컴포넌트가 `Container`를 사용해 폭/패딩을 통일하는지
   - 고정 `width`/`height`로 인한 overflow나 줄바꿈 문제 가능성

4. **컴포넌트 일관성**
   - `src/components/ui/`의 기존 원자 컴포넌트(`Button`, `Input`, `Card` 등)로 대체 가능한 중복 구현이 있는지
   - 클래스 병합 시 `cn()` (`@/lib/utils`)을 사용하는지
   - `ui` / `layout` / `common` 디렉토리 분류 규칙에 맞는 위치인지

5. **폼 UX**
   - `FieldError`로 검증 에러를 표시하는지, `aria-invalid` 연결 여부
   - 로딩/disabled 상태 처리, 제출 후 사용자 피드백(`toast` 등)

6. **인터랙션 상태**
   - hover/focus/active/disabled 스타일이 누락된 interactive 요소가 있는지
   - 클릭/탭 영역이 너무 작지 않은지

7. **레이아웃 일관성**
   - spacing/padding 패턴이 기존 컴포넌트와 일치하는지

### 출력 형식

- 이슈가 있다면 각 이슈를 `파일:라인` 형식으로 인용하고, 심각도를 `[필수]`, `[권장]`, `[제안]` 중 하나로 표시한다.
- 이슈가 없다면 "UI/UX 관점에서 문제 없음"으로 짧게 응답한다.
- 과도한 지적(nitpick)은 자제하고, CLAUDE.md 규칙 위반과 실제 사용자 경험에 영향을 주는 문제를 우선한다.
