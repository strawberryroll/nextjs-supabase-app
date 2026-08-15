# Next.js 16 개발 지침

이 문서는 Claude Code에서 Next.js 16(현재 프로젝트에 설치된 버전: 16.3.0) 프로젝트를 개발할 때 따라야 할 핵심 규칙과 가이드라인을 제공합니다.

## 🚀 필수 규칙 (엄격 준수)

### App Router 아키텍처

```typescript
// ✅ 올바른 방법: App Router 사용
app/
├── layout.tsx          // 루트 레이아웃
├── page.tsx           // 메인 페이지
├── loading.tsx        // 로딩 UI
├── error.tsx          // 에러 UI
├── not-found.tsx      // 404 페이지
└── dashboard/
    ├── layout.tsx     // 대시보드 레이아웃
    └── page.tsx       // 대시보드 페이지

// ❌ 금지: Pages Router 사용
pages/
├── index.tsx
└── dashboard.tsx
```

### Server Components 우선 설계

```typescript
// 🚀 필수: 기본적으로 모든 컴포넌트는 Server Components
export default async function UserDashboard() {
  // 서버에서 데이터 가져오기
  const user = await getUser()

  return (
    <div>
      <h1>{user.name}님의 대시보드</h1>
      {/* 클라이언트 컴포넌트가 필요한 경우에만 분리 */}
      <InteractiveChart data={user.analytics} />
    </div>
  )
}

// ✅ 클라이언트 컴포넌트는 최소한으로 사용
'use client'

import { useState } from 'react'

export function InteractiveChart({ data }: { data: Analytics[] }) {
  const [selectedRange, setSelectedRange] = useState('week')
  // 상호작용 로직만 클라이언트에서 처리
  return <Chart data={data} range={selectedRange} />
}
```

### 🚀 async request APIs 처리 (필수)

```typescript
// 🚀 Next.js 15부터 필수, 16에서도 동일하게 적용됨
import { cookies, headers } from 'next/headers'

export default async function Page({
  params,
  searchParams
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  // 🚀 필수: async request APIs 올바른 처리
  const { id } = await params
  const query = await searchParams
  const cookieStore = await cookies()
  const headersList = await headers()

  const user = await getUser(id)

  return <UserProfile user={user} />
}

// ❌ 금지: 동기식 접근 (15.x에서 deprecated, 16에서 완전히 제거됨)
export default function Page({ params }: { params: { id: string } }) {
  const user = getUser(params.id) // 에러 발생
  return <UserProfile user={user} />
}
```

### Typed Routes 활용

```typescript
// 🚀 필수: Typed Routes로 타입 안전성 보장
import Link from 'next/link'

// next.config.ts에서 typedRoutes: true 설정 필요
// (Next.js 16부터 stable API로 승격되어 experimental.typedRoutes가 아닌
//  최상위 typedRoutes 옵션을 사용)
export function Navigation() {
  return (
    <nav>
      {/* ✅ 타입 안전한 링크 */}
      <Link href="/dashboard/users/123">사용자 상세</Link>
      <Link href={{
        pathname: '/products/[id]',
        params: { id: 'abc' }
      }}>제품 상세</Link>

      {/* ❌ 컴파일 에러: 존재하지 않는 경로 */}
      <Link href="/nonexistent-route">잘못된 링크</Link>
    </nav>
  )
}
```

## ✅ 권장 사항 (성능 최적화)

### Streaming과 Suspense 활용

```typescript
import { Suspense } from 'react'

export default function DashboardPage() {
  return (
    <div>
      <h1>대시보드</h1>

      {/* ✅ 빠른 컨텐츠는 즉시 렌더링 */}
      <QuickStats />

      {/* ✅ 느린 컨텐츠는 Suspense로 감싸기 */}
      <Suspense fallback={<SkeletonChart />}>
        <SlowChart />
      </Suspense>

      <Suspense fallback={<SkeletonTable />}>
        <SlowDataTable />
      </Suspense>
    </div>
  )
}

async function SlowChart() {
  // 무거운 데이터 처리
  await new Promise(resolve => setTimeout(resolve, 2000))
  const data = await getComplexAnalytics()

  return <Chart data={data} />
}
```

### 🔄 New: after() API 활용

```typescript
import { after } from 'next/server'

export async function POST(request: Request) {
  const body = await request.json()

  // 즉시 응답 반환
  const result = await processUserData(body)

  // 🔄 비블로킹 작업은 after()로 처리
  after(async () => {
    await sendAnalytics(result)
    await updateCache(result.id)
    await sendNotification(result.userId)
  })

  return Response.json({ success: true, id: result.id })
}
```

### 새로운 캐싱 전략

```typescript
// ✅ 세밀한 캐시 제어
export async function getProductData(id: string) {
  const data = await fetch(`/api/products/${id}`, {
    next: {
      revalidate: 3600, // 1시간 캐시
      tags: [`product-${id}`, 'products'], // 태그 기반 무효화
    },
  })

  return data.json()
}

// 캐시 무효화
import { revalidateTag } from 'next/cache'

export async function updateProduct(id: string, data: ProductData) {
  await updateDatabase(id, data)

  // 관련 캐시 무효화
  revalidateTag(`product-${id}`)
  revalidateTag('products')
}
```

> **Cache Components 사용 시 주의**: `next.config.ts`에 `cacheComponents: true`가 설정된 프로젝트(이 프로젝트 포함)에서는 route segment config(`dynamic`, `revalidate`, `fetchCache`)가 아니라 `"use cache"` 디렉티브와 `cacheLife`로 캐싱을 제어한다. 위 `fetch`의 `next: { revalidate, tags }` 옵션은 별도 캐시 레이어라서 Cache Components 활성화 여부와 무관하게 계속 동작한다.

### Turbopack 최적화 설정

> **Next.js 16부터 Turbopack이 `next dev`/`next build`의 기본값**이 되었다. 더 이상 `--turbopack` 플래그가 필요 없으며, `package.json`의 `dev`/`build` 스크립트는 그냥 `next dev`, `next build`로 두면 된다(이 프로젝트도 이미 이 상태). 또한 Turbopack 설정 위치가 `experimental.turbo`에서 최상위 `turbopack` 옵션으로 이동했다(stable화).

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // 🚀 Turbopack 설정 (stable, 최상위 옵션)
  turbopack: {
    rules: {
      // CSS 모듈 최적화
      '*.module.css': {
        loaders: ['css-loader'],
        as: 'css',
      },
    },
  },
  experimental: {
    // 🔄 패키지 import 최적화 (여전히 experimental)
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'date-fns',
      'lodash-es',
    ],
  },
}

export default nextConfig
```

## ⚠️ Breaking Changes 대응

### React 19 호환성

```typescript
// ⚠️ React 19에서 변경된 사항들

// ✅ 새로운 방식: useFormStatus 훅
'use client'

import { useFormStatus } from 'react-dom'

function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending}>
      {pending ? '제출 중...' : '제출'}
    </button>
  )
}

// ✅ Server Actions와 form 통합
export async function createUser(formData: FormData) {
  'use server'

  const name = formData.get('name') as string
  const email = formData.get('email') as string

  await saveUser({ name, email })
  redirect('/users')
}

export default function UserForm() {
  return (
    <form action={createUser}>
      <input name="name" required />
      <input name="email" type="email" required />
      <SubmitButton />
    </form>
  )
}
```

### Middleware → Proxy (Next.js 16 이름 변경)

> **⚠️ Next.js 16부터 Middleware의 이름이 Proxy로 바뀌었다** (기능은 동일). 파일명이 `middleware.ts`가 아니라 프로젝트 루트(또는 `src/` 하위)의 `proxy.ts`여야 하고, export하는 함수명도 `middleware`가 아니라 `proxy`(또는 default export)다. 이 프로젝트도 루트의 `proxy.ts`를 사용한다(`lib/supabase/proxy.ts`의 `updateSession`을 호출).

```typescript
// proxy.ts
import { NextRequest, NextResponse } from 'next/server'

// Node.js Runtime이 기본값 (Edge Runtime 아님)
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}

export function proxy(request: NextRequest) {
  // Node.js API 사용 가능
  const crypto = require('crypto')
  const hash = crypto.createHash('sha256')

  // 인증 로직
  const token = request.cookies.get('auth-token')?.value

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}
```

### 🔄 New: unauthorized/forbidden API

> **여전히 experimental**: `unauthorized()`/`forbidden()`을 사용하려면 `next.config.ts`에 `experimental: { authInterrupts: true }`를 먼저 설정해야 한다.

```typescript
// next.config.ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    authInterrupts: true,
  },
}

export default nextConfig
```

```typescript
// app/api/admin/route.ts
import { unauthorized, forbidden } from 'next/server'

export async function GET(request: Request) {
  const session = await getSession(request)

  // 🔄 새로운 unauthorized 함수
  if (!session) {
    return unauthorized()
  }

  // 🔄 새로운 forbidden 함수
  if (!session.user.isAdmin) {
    return forbidden()
  }

  const data = await getAdminData()
  return Response.json(data)
}
```

## 🔄 New Features 활용

### Route Groups 고급 패턴

```typescript
// ✅ Route Groups로 레이아웃 분리
app/
├── (marketing)/
│   ├── layout.tsx     // 마케팅 레이아웃
│   ├── page.tsx       // 홈페이지
│   └── about/
│       └── page.tsx   // 소개 페이지
├── (dashboard)/
│   ├── layout.tsx     // 대시보드 레이아웃
│   └── analytics/
│       └── page.tsx   // 분석 페이지
└── (auth)/
    ├── login/
    │   └── page.tsx
    └── register/
        └── page.tsx

// (marketing)/layout.tsx
export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="marketing-layout">
      <MarketingHeader />
      {children}
      <MarketingFooter />
    </div>
  )
}
```

### Parallel Routes 활용

```typescript
// ✅ Parallel Routes로 동시 렌더링
app/
├── dashboard/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── @analytics/
│   │   └── page.tsx
│   └── @notifications/
│       └── page.tsx

// dashboard/layout.tsx
export default function DashboardLayout({
  children,
  analytics,
  notifications,
}: {
  children: React.ReactNode
  analytics: React.ReactNode
  notifications: React.ReactNode
}) {
  return (
    <div className="dashboard-grid">
      <main>{children}</main>
      <aside className="analytics-panel">
        <Suspense fallback={<AnalyticsSkeleton />}>
          {analytics}
        </Suspense>
      </aside>
      <div className="notifications-panel">
        <Suspense fallback={<NotificationsSkeleton />}>
          {notifications}
        </Suspense>
      </div>
    </div>
  )
}
```

### Intercepting Routes

```typescript
// ✅ Intercepting Routes로 모달 구현
app/
├── gallery/
│   ├── page.tsx
│   └── [id]/
│       └── page.tsx    // 전체 페이지 보기
└── @modal/
    └── (.)gallery/
        └── [id]/
            └── page.tsx // 모달 보기

// @modal/(.)gallery/[id]/page.tsx
import { Modal } from '@/components/modal'

export default async function PhotoModal({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const photo = await getPhoto(id)

  return (
    <Modal>
      <img src={photo.url} alt={photo.title} />
    </Modal>
  )
}
```

## ❌ 금지 사항

### Pages Router 사용 금지

```typescript
// ❌ 절대 금지: Pages Router 패턴
pages/
├── _app.tsx
├── _document.tsx
├── index.tsx
└── api/
    └── users.ts

// ❌ 금지: getServerSideProps, getStaticProps 사용
export async function getServerSideProps() {
  // 이 방식은 사용하지 마세요
}
```

### 안티패턴 방지

```typescript
// ❌ 금지: 불필요한 'use client' 사용
'use client'

export default function SimpleComponent({ title }: { title: string }) {
  // 상태나 이벤트 핸들러가 없는데 'use client' 사용
  return <h1>{title}</h1>
}

// ✅ 올바른 방법: Server Component로 유지
export default function SimpleComponent({ title }: { title: string }) {
  return <h1>{title}</h1>
}

// ❌ 금지: 클라이언트에서 서버 함수 직접 호출
'use client'

import { getUser } from '@/lib/database' // 서버 전용 함수

export function UserProfile() {
  const user = getUser() // 에러 발생
  return <div>{user.name}</div>
}

// ✅ 올바른 방법: 서버에서 데이터 전달
export default async function UserPage() {
  const user = await getUser()
  return <UserProfile user={user} />
}

function UserProfile({ user }: { user: User }) {
  return <div>{user.name}</div>
}
```

## 코드 품질 체크리스트

개발 완료 후 다음 명령어들을 반드시 실행하세요:

```bash
# 🚀 필수: 린트 검사
npm run lint

# 🚀 필수: 빌드 테스트
npm run build
```

> **참고**: 이 프로젝트의 `package.json`에는 현재 `lint`, `dev`, `build`, `start` 스크립트만 정의되어 있다. `typecheck`, `format:check`, `check-all` 같은 스크립트를 쓰려면 먼저 `package.json`에 추가해야 한다(TypeScript 타입 체크는 `tsc --noEmit`로 대체 가능).

이 지침을 따라 Next.js 16의 모든 기능을 최대한 활용하여 현대적이고 성능 최적화된 애플리케이션을 개발하세요.
