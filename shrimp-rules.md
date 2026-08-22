# Development Guidelines

## 프로젝트 개요

- Next.js 16(App Router, `cacheComponents: true`, `reactCompiler: true`) + Supabase(`@supabase/ssr`) 쿠키 인증 기반 커머스 MVP. 목표 기능은 `docs/PRD.md`, 개발 순서는 `docs/ROADMAP.md`, 사업 가설은 `docs/LEANCANVAS.md`에 정의되어 있다.
- 핵심 도메인: 결제 승인 시 재고 차감과 임계치 기반 자동 발주(`purchase_orders`)를 하나의 Postgres 트랜잭션으로 처리하는 것이 이 프로젝트의 존재 이유다. 이 트랜잭션 경계를 흩트리는 구현(클라이언트에서 재고 차감, 여러 API 호출로 분할 등)은 금지한다.
- `src/` 디렉토리는 사용하지 않는다. 루트에 `app/`, `components/`, `lib/`, `hooks/`를 둔다.

## 작업 시작 전 필수 확인 순서

1. `AGENTS.md`/`CLAUDE.md`의 Next.js 16 breaking change 경고를 따라, App Router 관련 코드를 작성하기 전에 반드시 `node_modules/next/dist/docs/`에서 관련 가이드를 확인한다(경로는 `CLAUDE.md` 기준 resolve).
2. 새 Task를 시작하기 전 `docs/ROADMAP.md`의 "현재 코드베이스 기준선" 및 해당 Phase/Task 항목을 읽어 이미 구현된 범위와 다음 우선순위를 확인한다.
3. DB 스키마를 다루는 작업이면 `mcp__supabase__list_tables`로 원격 실제 스키마를 먼저 확인한다 — `supabase/migrations/*.sql` 파일 목록만으로 현재 스키마를 추정하지 않는다(원격 전용 프로젝트이므로 로컬 CLI 스택 없음, `supabase/config.toml` 없음).

## 파일 동시 수정 규칙 (Multi-file coordination)

- **Supabase 클라이언트 3종을 컨텍스트 바꿔서 쓰지 말 것**: Client Component는 `lib/supabase/client.ts`, Server Component/Route Handler는 `lib/supabase/server.ts`(`await createClient()`), 루트 `proxy.ts`의 세션 갱신은 `lib/supabase/proxy.ts`의 `updateSession()`만 사용한다. 세 파일 모두 `lib/supabase/database.types.ts`의 `Database` 제네릭을 사용하므로, 스키마 변경 후에는 이 파일을 반드시 재생성한다(`mcp__supabase__generate_typescript_types`).
- **`lib/supabase/proxy.ts` 수정 시**: `createServerClient(...)` 호출과 `await supabase.auth.getClaims()` 호출 사이에 어떤 코드도 추가하지 않는다. 응답 객체를 새로 만들 경우 기존 `supabaseResponse`의 쿠키를 반드시 복사해서 반환한다(파일 내 주석 규칙 참조). 이 파일과 루트 `proxy.ts`의 `config.matcher`는 함께 검토한다 — 새 공개/보호 라우트를 추가하면 `updateSession()`의 경로 조건과 `proxy.ts`의 matcher 둘 다 갱신 대상인지 확인한다.
- **스키마 변경 시 항상 함께 갱신할 파일**: `supabase/migrations/`에 새 마이그레이션 추가 → `mcp__supabase__apply_migration`으로 원격 적용 → `lib/supabase/database.types.ts` 재생성 → 해당 테이블을 사용하는 `lib/queries/*`, `lib/schemas/*`, 관련 페이지의 타입을 함께 갱신한다. 마이그레이션 파일만 추가하고 타입 재생성을 건너뛰지 않는다.
- **관리자 전용 라우트 신설 시**: 페이지 구현과 함께 권한 체크 로직(`profiles.role = 'admin'` 검증)을 반드시 포함한다. `lib/auth/require-admin.ts`가 보여주는 패턴처럼, `proxy.ts`의 optimistic check와 별개로 Server Component 내부에서 `supabase.auth.getClaims()`(관리자 라우트는 추가로 `profiles.role` 조회)로 재검증한 뒤 실패 시 `redirect()` 한다.
- **`docs/ROADMAP.md` 갱신**: Task 단위 작업을 완료하면 해당 Task를 완료 표시로 갱신한다(`update-roadmap` 스킬 사용 가능). PRD(`docs/PRD.md`)의 기능 ID(F001~F027)나 페이지 구조를 변경했다면 `docs/ROADMAP.md`의 "기능 ID 커버리지" 표도 함께 갱신한다.

## 코드 작성 표준 (프로젝트 특화)

- **폼**: 신규로 작성하는 폼은 `react-hook-form` + `zod` + `@hookform/resolvers/zod` 조합을 사용한다. `components/login-form.tsx`를 표준 패턴으로 참조한다 — `useForm<T>({ resolver: zodResolver(schema) })` + `Controller` + `components/ui/field.tsx`의 `Field`/`FieldLabel`/`FieldError`. 폼 검증 스키마는 `lib/schemas/`에 도메인별 파일로 작성하고(`lib/schemas/auth.ts` 참고), `z.infer`로 타입을 함께 export한다. 기존 `useState` 기반 수기 폼 패턴(구 로그인 폼)은 신규 코드에 재사용하지 않는다.
- **Cache Components(`cacheComponents: true`)가 활성화된 상태에서는 `dynamic`, `revalidate`, `fetchCache` 같은 route segment config를 절대 사용하지 않는다(빌드 에러 발생)**. 정적으로 캐시할 부분만 `"use cache"` 디렉티브 + `cacheLife`로 명시하고, 캐시되지 않는 런타임 데이터(재고 수량 등 변동성 높은 값)는 `<Suspense>`로 감싼다.
- **SSR/CSR hydration 불일치가 필요한 컴포넌트**는 `useEffect` + `setState`로 mounted 플래그를 만들지 말고 `hooks/use-is-mounted.ts`의 `useIsMounted()`를 재사용한다(`react-hooks/set-state-in-effect` ESLint 규칙 위반 방지).
- **결제 금액/재고 신뢰 경계**: 클라이언트가 전달한 금액이나 재고 수량을 그대로 신뢰해 DB에 반영하지 않는다. 결제 승인 Route Handler에서는 서버가 `products.price`로 총액을 재계산해 토스페이먼츠 승인 금액과 대조한다.
- **신규 shadcn/ui 컴포넌트**는 `mcp__shadcn__*` 도구로 설치 여부를 먼저 확인 후 `components/ui/`에 추가한다. `components.json`의 별칭(`@/components`, `@/components/ui`, `@/lib`, `@/hooks`)을 따른다. 하드코딩 색상 대신 `app/globals.css`의 `@theme` 토큰만 사용한다.
- **주석/커밋 언어**: 사용자 응답과 문서화는 한국어, 변수명/함수명은 영어(`CLAUDE.md` 전역 규칙). 마이그레이션 SQL 파일 상단 주석처럼 기존 파일의 한국어 주석 스타일을 유지한다.

## 워크플로우 표준

- 코드 변경 후에는 `docs/ROADMAP.md`에 명시된 순서대로 `npm run lint` → `npm run typecheck` → `npm run format:check`(실패 시 `npm run format`) → `npm run build`를 실행해 회귀를 확인한다.
- API 연동/비즈니스 로직(특히 결제, 재고 차감, 발주 생성) 구현 시 `mcp__playwright__*` 도구로 시나리오 테스트를 수행한다 — 이 프로젝트에는 별도 테스트 러너가 구성되어 있지 않으므로 Playwright E2E 확인이 실질적 검증 수단이다.
- UI를 변경했다면 `npm run dev`로 로컬 서버를 띄운 뒤 `mcp__playwright__browser_navigate`/`browser_snapshot`/`browser_resize`로 반응형·다크모드 상태를 확인한다.
- `npm run lint` / `next build`에는 더 이상 `next lint`가 없다(Next.js 16에서 제거됨). 스크립트나 git hook에 `next lint`를 추가하지 않는다.
- `.husky/pre-commit`은 스테이징된 파일에 `eslint --fix` + `prettier --write`만 자동 적용한다(`lint-staged`). 타입체크·빌드는 훅에 없으므로 커밋 전 수동으로 `npm run typecheck`, `npm run build`를 실행한다.

## AI 의사결정 기준

- **어떤 페이지에 로직을 넣을지 애매할 때**: `docs/PRD.md`의 "5. 페이지별 상세 기능"에서 해당 기능 ID(F001~F027)가 매핑된 페이지를 확인하고 그 페이지에 구현한다. PRD와 실제 라우트 구조가 어긋나 보이면 `docs/ROADMAP.md`의 Task 설명을 우선 참조하되, 구조적 불일치를 발견하면 임의로 새 라우트를 만들기 전에 PRD/ROADMAP 갱신이 필요한지 먼저 판단한다.
- **RLS 정책 작성 시**: `docs/PRD.md`의 "6. 데이터 모델 > RLS 정책 방향"을 그대로 따른다 — `products`는 select 공개/변경 admin만, `orders`/`order_items`는 본인 또는 admin만 select, 클라이언트 직접 insert는 차단(서버 함수 내부에서만 insert), `purchase_orders`는 admin 전용. 이 방향과 다른 정책을 임의로 설계하지 않는다.
- **중복 발주 방지 로직을 만들 때**: 동일 `product_id`에 대해 `pending` 또는 `confirmed` 상태의 `purchase_orders`가 이미 존재하면 새로 생성하지 않는다. `received`로 완료된 이후에는 재차 임계치 미만이 되면 새 발주 생성을 허용한다. 이 규칙을 애플리케이션 레이어에서만 체크하지 말고 DB 함수(`process_order_payment`) 내부에서도 강제한다.
- **에이전트 선택**: 라우트+DB+RLS가 함께 얽힌 풀스택 작업은 `nextjs-supabase-fullstack-dev`, App Router 구조/캐싱 이슈만 다룰 때는 `nextjs-app-router-dev`, UI 컴포넌트 구현/스타일링은 `shadcn-ui-architect`, `docs/ROADMAP.md` 갱신은 `development-planner`, `docs/PRD.md` 신규 작성/정합성 검증은 `prd-generator`를 사용한다.

## 금지 사항

- `middleware.ts` 파일을 생성하지 않는다 — Next.js 16에서는 루트 `proxy.ts` + `proxy`(또는 default export) 함수명을 사용한다.
- `next.config.ts`의 `cacheComponents: true` 상태에서 route segment config(`export const dynamic`, `export const revalidate`, `export const fetchCache`)를 사용하지 않는다.
- `next lint`를 스크립트, git hook, CI 어디에도 사용하지 않는다(제거된 명령).
- `eslint.config.mjs`에서 `eslint-config-next`를 `@eslint/eslintrc`의 `FlatCompat.extends(...)`로 감싸지 않는다(순환 참조 에러 발생) — 배열을 그대로 스프레드해서 사용한다.
- `lib/supabase/server.ts`/`lib/supabase/client.ts`로 생성한 클라이언트를 전역 변수에 저장해 재사용하지 않는다(Fluid compute 환경에서 세션 오염 위험) — 함수 호출마다 새로 생성한다.
- 결제 승인 로직에서 재고 차감과 임계치 체크를 별도 API 호출이나 클라이언트 로직으로 분리하지 않는다 — 반드시 서버의 단일 Postgres 함수(`process_order_payment`) 트랜잭션으로 처리한다.
- `purchase_orders`, `orders`, `order_items` 테이블에 클라이언트(브라우저)에서 직접 `insert`하는 코드를 작성하지 않는다 — RLS로 차단되어 있어야 하며, 서버 로직(Route Handler 또는 Postgres 함수)에서만 생성한다.
- `docs/PRD.md`, `docs/ROADMAP.md`, `docs/LEANCANVAS.md`의 기존 구조(섹션 번호, 표 형식)를 별도 지시 없이 임의로 재구성하지 않는다 — 내용 갱신은 기존 구조를 유지한 채 진행한다.
