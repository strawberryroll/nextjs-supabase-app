# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## ⚠️ Next.js 16 — 훈련 데이터와 다름

이 프로젝트는 Next.js 16(`latest`, 설치 버전 16.3.0)을 사용하며, App Router에 **breaking change**가 있다. 코드를 작성하기 전에 `node_modules/next/dist/docs/`에서 관련 가이드를 반드시 확인할 것(경로는 이 파일 기준으로 resolve). Deprecation notice를 지킬 것 — 위의 `@AGENTS.md` import 블록이 이 규칙의 원본이며 `next dev`가 자동으로 재생성하므로 직접 편집하지 말 것.

핵심 변경 사항 두 가지가 이미 이 저장소에 적용되어 있다:

1. **Middleware → Proxy**: `middleware.ts`가 아니라 루트의 `proxy.ts`를 사용한다. export 함수명도 `middleware`가 아니라 `proxy`(또는 default export)이며, matcher `config`는 동일하게 export한다. 참고: `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`
2. **Cache Components 활성화**: `next.config.ts`에 `cacheComponents: true`가 설정되어 있다. 이 모드에서는:
   - `dynamic`, `revalidate`, `fetchCache` 같은 route segment config를 쓰면 안 됨(에러 발생) — 대신 `"use cache"` 디렉티브와 `cacheLife`를 사용
   - 모든 페이지는 기본적으로 dynamic이며, 정적으로 캐시하고 싶은 부분만 `"use cache"`로 명시
   - 캐시되지 않은 런타임 데이터는 `<Suspense>`로 감싸야 instant navigation 검증을 통과함
   - 자세한 내용은 `node_modules/next/dist/docs/01-app/02-guides/migrating-to-cache-components.md` 참고

## 명령어

```bash
npm run dev      # 개발 서버 실행 (localhost:3000, Turbopack 기본 사용)
npm run build    # 프로덕션 빌드
npm run start    # 프로덕션 서버 실행
npm run lint     # ESLint 실행 (next/core-web-vitals + next/typescript)
```

테스트 러너, `typecheck`/`format` 스크립트는 아직 구성되어 있지 않다(타입 체크가 필요하면 `npx tsc --noEmit`).

## 아키텍처

Next.js App Router + Supabase(`@supabase/ssr`)로 쿠키 기반 인증을 구현한 스타터 킷. `src/` 없이 루트에 `app/`, `components/`, `lib/`을 둔다.

### Supabase 클라이언트 3종 (`lib/supabase/`)

컨텍스트별로 반드시 알맞은 클라이언트를 사용해야 세션이 깨지지 않는다:

- **`client.ts`** — `createClient()`: 브라우저/Client Component 전용 (`createBrowserClient`)
- **`server.ts`** — `createClient()` (async): Server Component/Route Handler 전용. `next/headers`의 `cookies()`를 사용하며, **Fluid compute 환경에서는 전역 변수에 클라이언트를 저장하면 안 되고 함수마다 새로 생성**해야 한다.
- **`proxy.ts`** — `updateSession(request)`: 루트 `proxy.ts`에서 호출되는 세션 갱신 로직. `createServerClient` 생성과 `supabase.auth.getClaims()` 호출 사이에 다른 코드를 넣지 말 것 — 세션이 랜덤하게 끊기는, 디버깅하기 어려운 버그의 원인이 된다. 응답 객체를 새로 만들 경우 쿠키를 그대로 복사해서 반환해야 한다(파일 내 주석에 상세 규칙 있음).

세 클라이언트 모두 `lib/supabase/database.types.ts`의 `Database` 타입으로 제네릭이 걸려 있다. 스키마를 바꾼 뒤에는 `mcp__supabase__generate_typescript_types`(또는 `supabase gen types`)로 이 파일을 재생성해야 한다.

### 인증 흐름과 라우트 보호

- 루트 `proxy.ts`가 거의 모든 경로에서 실행되며(matcher가 정적 파일/이미지 제외), 비로그인 사용자를 `/auth/login`으로 리다이렉트한다. 단, `/`, `/login*`, `/auth/*` 경로는 예외.
- `app/protected/`는 인증된 사용자 전용 영역. `app/protected/page.tsx`는 proxy의 낙관적 체크와 별개로, Server Component 내부에서 `supabase.auth.getClaims()`로 다시 한 번 인증을 확인하고 실패 시 `redirect("/auth/login")` — proxy는 "optimistic check"일 뿐 완전한 인가 수단이 아니므로 실제 데이터 접근 전에는 항상 서버에서 재확인해야 한다.
- `app/auth/`에 login, sign-up, forgot-password, update-password, sign-up-success, error, confirm(OTP 확인용 Route Handler)이 있다.
- `lib/utils.ts`의 `hasEnvVars`로 Supabase 환경변수 미설정 상태를 감지해 `EnvVarWarning` 컴포넌트를 보여준다(튜토리얼용 체크이므로 실제 배포 시 제거 가능).
- 실제 로그인/회원가입 폼(`components/login-form.tsx` 등)은 react-hook-form 같은 라이브러리 없이 `useState` + Supabase 브라우저 클라이언트 직접 호출 패턴을 쓴다.

### Supabase 프로젝트는 원격 전용

`supabase/config.toml`이 없다 — 로컬 Supabase 스택(CLI)이 아니라 원격 프로젝트에 `supabase/migrations/*.sql`을 직접 관리하는 구조. 스키마 변경은 마이그레이션 파일을 추가하고 `mcp__supabase__apply_migration`(또는 Supabase 대시보드)으로 원격에 적용한다. 현재 `profiles` 테이블은:
- `auth.users`와 1:1, `on_auth_user_created` 트리거(`handle_new_user`, `security definer`)로 회원가입 시 자동 생성
- `handle_new_user()`는 PostgREST RPC로 직접 호출되지 않도록 `anon`/`authenticated`의 EXECUTE 권한을 revoke 처리(보안 어드바이저 경고 대응)
- RLS 활성화: select는 공개, insert/update는 본인(`auth.uid() = id`)만 가능
- `username`은 대소문자 무관 유니크(부분 인덱스), 3~30자 영숫자+언더스코어 형식 제약

### UI 컴포넌트

shadcn/ui("new-york" 스타일, `neutral` base color) + **TailwindCSS v3**(`^3.4.19`, `tailwind.config.ts` + `@tailwind` 디렉티브 방식 — v4의 CSS-first `@theme` 방식이 아님) + `next-themes`. `components.json`의 별칭: `@/components`, `@/components/ui`, `@/lib`, `@/hooks`(폴더는 아직 없음). 새 shadcn 컴포넌트는 `components/ui/`에, 도메인 컴포넌트는 `components/` 루트에 위치. 다크모드는 `tailwind.config.ts`의 `darkMode: ["class"]` + `next-themes`의 `attribute="class"` 조합.

### 문서

`docs/guides/`에 컴포넌트 패턴, 스타일링, 폼(react-hook-form), 프로젝트 구조에 대한 참조 가이드가 있다. 일부는 미설치 라이브러리(react-hook-form, tw-animate-css 등)를 전제로 한 "설치 시 따를 패턴" 문서이므로, 실제 설치 여부는 각 문서 상단의 경고 노트를 확인할 것.
