# 스타일링 가이드

이 문서는 TailwindCSS v4 + shadcn/ui를 활용한 최신 스타일링 규칙과 모범 사례를 제공합니다.

> **⚠️ 이 프로젝트는 실제로 TailwindCSS v3(`^3.4.1`)를 사용 중이다.** `tailwind.config.ts` + `app/globals.css`의 `@tailwind base/components/utilities` 디렉티브 방식(JS 설정 파일 기반)이며, 아래에서 설명하는 v4의 CSS-first(`@theme`, `@import "tailwindcss"`) 방식이 아니다. v3와 v4의 차이가 중요한 부분(설치, 설정 파일, 다크모드 선언)은 각 섹션에 별도로 표시해 두었으니, 이 프로젝트에서 실제로 코드를 작성할 때는 v3 표기를 따를 것. 클래스 이름 자체(`bg-background`, `rounded-lg` 등 유틸리티 클래스)는 v3/v4 공통이라 그대로 적용 가능하다.

## 🎨 기술 스택 개요

### 핵심 스타일링 도구

- **TailwindCSS v4**: CSS-first 설정(`@theme`)을 도입한 최신 유틸리티 기반 CSS 프레임워크. ⚠️ 이 프로젝트는 v3.4.19가 설치되어 있음 — 아래 "v3 vs v4" 노트 참고
- **shadcn/ui**: Radix UI 기반 컴포넌트 라이브러리 (new-york style)
- **next-themes**: 다크모드 지원
- **tw-animate-css**: 애니메이션 라이브러리 (⚠️ 이 프로젝트에는 미설치 — 실제로는 `tailwindcss-animate` 플러그인을 사용 중)
- **CSS Variables**: 동적 테마 시스템
- **prettier-plugin-tailwindcss**: 자동 클래스 정렬 (⚠️ 이 프로젝트에는 미설치)

### 🔀 v3 vs v4 핵심 차이 (이 프로젝트는 v3)

| 항목 | v4 (최신, 이 문서 기준) | v3 (이 프로젝트 실제 설정) |
| --- | --- | --- |
| 설치 | `npm install tailwindcss @tailwindcss/postcss` | `npm install tailwindcss postcss autoprefixer` |
| PostCSS 설정 | `postcss.config.mjs`에 `"@tailwindcss/postcss": {}` | `postcss.config.mjs`에 `tailwindcss`, `autoprefixer` |
| CSS 진입점 | `@import "tailwindcss";` | `@tailwind base; @tailwind components; @tailwind utilities;` |
| 테마/토큰 설정 | CSS의 `@theme { --color-...: ...; }` | `tailwind.config.ts`의 `theme.extend` (JS 객체) |
| 다크모드 선언 | CSS에서 `@custom-variant dark (&:where(.dark, .dark *));` | `tailwind.config.ts`의 `darkMode: ["class"]` |
| 설정 파일 | 선택 사항(`@config` 지시어로 레거시 JS 설정도 병행 가능) | `tailwind.config.ts` 필수 |

## 🚀 TailwindCSS v4 사용 규칙

> 아래 원칙(인라인 스타일 지양, 클래스 작성 순서, 반응형 우선순위 등)은 v3/v4 공통이며 버전과 무관하게 적용된다.

### 기본 원칙

```tsx
// ✅ 올바른 Tailwind 클래스 사용
<div className="flex items-center justify-between rounded-lg bg-background p-4 shadow-md">
  <h2 className="text-lg font-semibold text-foreground">제목</h2>
  <Button variant="outline" size="sm">버튼</Button>
</div>

// ❌ 인라인 스타일 사용 금지
<div style={{ display: 'flex', padding: '16px' }}>
  <h2 style={{ fontSize: '18px' }}>제목</h2>
</div>
```

### 클래스 작성 순서

Prettier 플러그인이 자동으로 정렬하지만, 수동 작성 시 다음 순서를 따르세요:

```tsx
<div className={cn(
  // 1. 레이아웃 (display, position)
  "flex absolute",

  // 2. 크기 (width, height, padding, margin)
  "w-full h-auto p-4 m-2",

  // 3. 타이포그래피 (font, text)
  "text-lg font-medium text-center",

  // 4. 배경 및 테두리
  "bg-background border border-border rounded-md",

  // 5. 효과 (shadow, opacity, transform)
  "shadow-lg opacity-90 hover:scale-105",

  // 6. 상호작용 (hover, focus, active)
  "hover:bg-accent focus:ring-2 active:scale-95",

  // 조건부 클래스
  isActive && "bg-primary text-primary-foreground",
  className
)}>
```

### 반응형 디자인

```tsx
// ✅ 모바일 우선 접근법
<div className={cn(
  // 기본 (모바일)
  "flex flex-col space-y-4 p-4",

  // 태블릿 (768px+)
  "md:flex-row md:space-y-0 md:space-x-6 md:p-6",

  // 데스크톱 (1024px+)
  "lg:max-w-6xl lg:mx-auto lg:p-8",

  // 대형 화면 (1280px+)
  "xl:max-w-7xl"
)}>

// ❌ 데스크톱 우선 접근법 지양
<div className="hidden lg:block md:hidden">
```

### 커스텀 클래스 최소화

```tsx
// ✅ Tailwind 유틸리티 클래스 우선 사용
<button className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90">

// ❌ 커스텀 CSS 클래스 지양
<button className="custom-button">
```

## 🎭 shadcn/ui 컴포넌트 활용

### 기본 사용법

```tsx
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

// ✅ shadcn/ui 컴포넌트 활용
export function UserCard({ user }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{user.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="outline">프로필 보기</Button>
      </CardContent>
    </Card>
  )
}
```

### 컴포넌트 변형 (Variants)

```tsx
// Button 컴포넌트 변형
<Button variant="default">기본 버튼</Button>
<Button variant="destructive">삭제 버튼</Button>
<Button variant="outline">아웃라인 버튼</Button>
<Button variant="secondary">보조 버튼</Button>
<Button variant="ghost">고스트 버튼</Button>
<Button variant="link">링크 버튼</Button>

// 크기 변형
<Button size="default">기본 크기</Button>
<Button size="sm">작은 크기</Button>
<Button size="lg">큰 크기</Button>
<Button size="icon">아이콘만</Button>
```

### 컴포넌트 커스터마이징

```tsx
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ✅ 기존 컴포넌트 확장
export function CustomButton({ className, ...props }) {
  return (
    <Button
      className={cn(
        'transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-lg',
        className
      )}
      {...props}
    />
  )
}

// ❌ 처음부터 새로 만들기
export function MyButton({ className, ...props }) {
  return (
    <button
      className="bg-blue-500... px-4 py-2" // 긴 클래스 나열
      {...props}
    />
  )
}
```

### 새 shadcn/ui 컴포넌트 추가

```bash
# 컴포넌트 추가
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog

# 모든 컴포넌트 확인
npx shadcn@latest add
```

## 🌓 다크모드 구현

### 다크모드 선언 (v4: CSS / v3: config)

Tailwind v4는 다크모드를 CSS 안에서 `@custom-variant`로 선언한다. `next-themes`가 `<html>`에 `class="dark"`를 붙이는 방식과 맞추려면 클래스 셀렉터 기반 variant를 등록한다.

```css
/* app/globals.css (v4 방식) */
@import "tailwindcss";

@custom-variant dark (&:where(.dark, .dark *));
```

> **⚠️ 이 프로젝트(v3)의 실제 설정**: v3에는 `@custom-variant`가 없다. 대신 `tailwind.config.ts`의 `darkMode` 옵션으로 선언하며, 이 프로젝트는 `darkMode: ["class"]`로 설정되어 있다.
>
> ```typescript
> // tailwind.config.ts (이 프로젝트의 실제 설정)
> import type { Config } from 'tailwindcss'
>
> export default {
>   darkMode: ['class'],
>   // ...
> } satisfies Config
> ```

### next-themes 활용

```tsx
// providers/theme-provider.tsx
import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ children, ...props }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}
```

### 테마 토글 컴포넌트

```tsx
import { useTheme } from 'next-themes'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()

  return (
    <Button
      variant="outline"
      size="icon"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      <Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">테마 전환</span>
    </Button>
  )
}
```

### 다크모드 대응 스타일링

```tsx
// ✅ 시맨틱 색상 변수 사용
<div className="bg-background text-foreground">
  <h1 className="text-primary">제목</h1>
  <p className="text-muted-foreground">설명</p>
</div>

// ❌ 하드코딩된 색상 사용
<div className="bg-white text-black dark:bg-black dark:text-white">
  <h1 className="text-blue-600 dark:text-blue-400">제목</h1>
</div>
```

## 🎨 색상 시스템

### CSS 변수 기반 색상

Tailwind v4에서는 `@theme` 안에 정의한 CSS 변수가 곧바로 유틸리티 클래스(`bg-background` 등)로 매핑된다:

```css
/* app/globals.css (v4 방식) */
@import "tailwindcss";

@theme {
  --color-background: oklch(1 0 0);
  --color-foreground: oklch(0.15 0.02 264);
  --color-primary: oklch(0.21 0.03 264);
  --color-primary-foreground: oklch(0.98 0 0);
  --color-destructive: oklch(0.64 0.21 25);
  /* ... */
}
```

> **⚠️ 이 프로젝트(v3)의 실제 설정**: v3에는 `@theme`이 없다. CSS 변수는 `:root`/`.dark`에 HSL 값만 선언하고, `tailwind.config.ts`의 `theme.extend.colors`에서 `hsl(var(--background))` 형태로 매핑해야 유틸리티 클래스가 생성된다. 실제 `app/globals.css`에 정의된 변수:
>
> ```css
> :root {
>   --background: 0 0% 100%;
>   --foreground: 224 71.4% 4.1%;
>   --primary: 220.9 39.3% 11%;
>   --primary-foreground: 210 20% 98%;
>   --secondary: 220 14.3% 95.9%;
>   --secondary-foreground: 220.9 39.3% 11%;
>   --muted: 220 14.3% 95.9%;
>   --muted-foreground: 220 8.9% 46.1%;
>   --accent: 220 14.3% 95.9%;
>   --accent-foreground: 220.9 39.3% 11%;
>   --destructive: 0 84.2% 60.2%;
>   --destructive-foreground: 210 20% 98%;
>   --border: 220 13% 91%;
>   --input: 220 13% 91%;
>   --ring: 224 71.4% 4.1%;
> }
> ```
>
> 그리고 `tailwind.config.ts`에서 `background: "hsl(var(--background))"` 식으로 별도 매핑한다(자세한 내용은 프로젝트 루트 `tailwind.config.ts` 참고).

### 색상 사용 예시

```tsx
// ✅ 시맨틱 색상 클래스 사용
<div className="bg-background border-border">
  <h1 className="text-foreground">메인 텍스트</h1>
  <p className="text-muted-foreground">보조 텍스트</p>
  <Button className="bg-primary text-primary-foreground">버튼</Button>
</div>

// ❌ 직접 색상 지정
<div className="bg-white border-gray-200">
  <h1 className="text-gray-900">메인 텍스트</h1>
  <p className="text-gray-600">보조 텍스트</p>
</div>
```

## ✨ 애니메이션 가이드

### tw-animate-css 활용

`tw-animate-css`는 v4 환경(shadcn/ui의 v4 기본 템플릿 포함)에서 권장되는 애니메이션 유틸리티 패키지다.

> **⚠️ 이 프로젝트(v3)의 실제 설정**: `tw-animate-css`가 아니라 v3용 `tailwindcss-animate` 플러그인이 설치되어 있으며(`tailwind.config.ts`의 `plugins: [require("tailwindcss-animate")]`), `accordion-down`/`accordion-up` 같은 애니메이션 유틸리티를 제공한다. 아래 `tw-animate-css` 예시를 그대로 쓰려면 v4로 마이그레이션하거나 별도 설치가 필요하다.

```tsx
import 'tw-animate-css'

// ✅ 내장 애니메이션 사용
<div className="animate-fadeIn">페이드 인</div>
<div className="animate-slideUp">슬라이드 업</div>
<div className="animate-bounce">바운스</div>

// ✅ Tailwind transition 활용
<button className="transition-all duration-200 hover:scale-105 hover:shadow-lg">
  호버 효과
</button>

// ✅ 복합 애니메이션
<div className="transform transition-transform duration-300 hover:scale-110 hover:rotate-3">
  복합 효과
</div>
```

### 성능 고려사항

```tsx
// ✅ will-change 사용으로 성능 최적화
<div className="will-change-transform transition-transform hover:scale-105">

// ✅ 애니메이션 종료 후 will-change 제거
<div className="hover:will-change-transform transition-transform hover:scale-105">
```

## 📱 반응형 디자인 패턴

### 컨테이너 패턴

```tsx
// ✅ 반응형 컨테이너
<div className="container mx-auto px-4 sm:px-6 lg:px-8">
  <div className="max-w-7xl mx-auto">
    {/* 컨텐츠 */}
  </div>
</div>

// ✅ 그리드 레이아웃
<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
  {items.map(item => (
    <Card key={item.id}>...</Card>
  ))}
</div>
```

### 네비게이션 패턴

```tsx
// ✅ 반응형 네비게이션
<nav className="flex items-center justify-between p-4">
  <div className="flex items-center space-x-4">
    <Logo />
    <div className="hidden md:flex md:space-x-6">
      <NavLink href="/about">소개</NavLink>
      <NavLink href="/contact">연락처</NavLink>
    </div>
  </div>

  {/* 모바일 메뉴 */}
  <div className="md:hidden">
    <MobileMenu />
  </div>
</nav>
```

## 🛠️ 유틸리티 함수

### cn() 헬퍼 함수

```tsx
import { cn } from '@/lib/utils'

// ✅ cn() 함수로 클래스 조합
<div className={cn(
  "base-classes",
  condition && "conditional-classes",
  variant === 'primary' && "primary-classes",
  className // props에서 받은 추가 클래스
)}>

// ❌ 수동 문자열 조합
<div className={`base-classes ${condition ? 'conditional-classes' : ''} ${className || ''}`}>
```

### 조건부 스타일링

```tsx
// ✅ 조건부 클래스 적용
<Button
  className={cn(
    "base-button-styles",
    isLoading && "opacity-50 cursor-not-allowed",
    variant === 'destructive' && "bg-destructive text-destructive-foreground",
    size === 'sm' && "px-2 py-1 text-sm"
  )}
  disabled={isLoading}
>

// ❌ 복잡한 삼항 연산자
<Button
  className={
    isLoading
      ? "opacity-50 cursor-not-allowed"
      : variant === 'destructive'
        ? "bg-red-500 text-white"
        : "bg-blue-500 text-white"
  }
>
```

## 🚫 금지사항

### ❌ 피해야 할 패턴

```tsx
// 인라인 스타일 사용
<div style={{ backgroundColor: 'red' }}>

// 긴 클래스명 하드코딩
<div className="w-full h-screen flex items-center justify-center bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-bold text-2xl shadow-2xl rounded-lg border-4 border-white">

// 중복된 스타일 정의
<div className="p-4 padding-4 pt-4 pb-4 pl-4 pr-4">

// !important 남용
<div className="!text-red-500 !bg-blue-500">

// Tailwind와 CSS 모듈 혼재
<div className={`${styles.customClass} flex items-center`}>
```

### ❌ 잘못된 색상 사용

```tsx
// 하드코딩된 색상
<div className="bg-gray-100 text-gray-900">

// 다크모드 미고려
<div className="bg-white text-black">

// 접근성 미고려
<button className="bg-red-200 text-red-300">저대비 버튼</button>
```

## ✅ 스타일링 체크리스트

새 컴포넌트 작성 시 확인사항:

### 기본 사항

- [ ] TailwindCSS 유틸리티 클래스 우선 사용
- [ ] cn() 함수로 클래스 조합
- [ ] 시맨틱 색상 변수 사용
- [ ] 반응형 디자인 적용

### 다크모드

- [ ] 다크모드 대응 색상 사용
- [ ] 하드코딩된 색상 없음
- [ ] 테마 전환 시 깨짐 없음

### 성능

- [ ] 불필요한 애니메이션 없음
- [ ] will-change 적절히 사용
- [ ] 인라인 스타일 없음

### 접근성

- [ ] 충분한 색상 대비
- [ ] 포커스 상태 스타일링
- [ ] 스크린 리더 고려

### 유지보수

- [ ] 일관된 클래스 순서
- [ ] 재사용 가능한 컴포넌트 활용
- [ ] 의미있는 클래스 조합

이 가이드를 따라 일관성 있고 아름다운 UI를 구현해보세요!
