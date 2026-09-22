# 재고 부족 자동 재주문 커머셜 웹 개발 로드맵

재고가 임계치 아래로 떨어지는 순간 시스템이 스스로 발주를 만들어, 1~2인 셀러가 재고 소진을 놓치지 않게 하는 B2C 쇼핑몰(예: 원두·드립용품 전문 쇼핑몰 "원두산책")

## 개요

재고 부족 자동 재주문 커머셜 웹은 재고 관리 인력 없이 운영하는 소규모 온라인 셀러(관리자)와 일반 소비자(고객)를 위한 쇼핑몰로 다음 기능을 제공합니다:

- **상품 탐색 및 구매**: 상품 목록/상세 조회, 장바구니, 배송정보 입력, 토스페이먼츠 결제 (F003~F008, F010, F011)
- **재고 임계치 기반 자동 발주**: 결제 승인 시 `process_order_payment` Postgres 함수가 주문 생성·재고 차감·임계치 체크·발주 생성을 단일 트랜잭션으로 처리 (F008, F009)
- **관리자 백오피스**: 권한(`profiles.role`) 기반 대시보드, 상품·재고·임계치 관리, 주문 관리, 발주 확인/입고 처리 (F020~F027)

## 개발 워크플로우

1. **작업 계획**
   - 기존 코드베이스를 학습하고 현재 상태를 파악
   - 새로운 작업을 포함하도록 `docs/ROADMAP.md` 업데이트
   - 우선순위 작업은 마지막 완료된 작업 다음에 삽입

2. **작업 생성**
   - 고수준 명세서, 관련 파일, 수락 기준, 구현 단계 포함
   - **API/비즈니스 로직 작업 시 "테스트 체크리스트" 섹션 필수 포함(`mcp__playwright__*` 테스트 시나리오 작성)**
   - 완료된 Task는 체크된 박스(✅)로, 새 Task는 빈 박스로 표시

3. **작업 구현**
   - Task 명세를 따라 기능 구현
   - **API 연동 및 비즈니스 로직 구현 시 `mcp__playwright__*` 도구로 테스트 수행 필수**
   - 각 단계 후 Task의 진행 상황 업데이트
   - `npm run lint` / `npm run typecheck` / `npm run format:check` / `npm run build` 통과 확인 후 다음 단계로 진행
   - 각 단계 완료 후 중단하고 추가 지시를 기다림

4. **로드맵 업데이트**
   - 완료된 작업을 ✅로 표시 (`update-roadmap` 스킬로 코드 구현 상태와 대조해 자동 갱신 가능)

## 현재 코드베이스 기준선

- `supabase/migrations/`에는 `profiles` 테이블 마이그레이션만 존재 — `role` 컬럼, `products`, `orders`, `order_items`, `purchase_orders` 모두 미생성
- `app/`에는 `app/auth/*`(login, sign-up, forgot-password, update-password, sign-up-success, error, confirm)만 존재 — 커머스/관리자 라우트 전무
- `components/ui/`에는 badge, button, card, checkbox, dropdown-menu, field, input, label, separator만 설치 — `table`, `select`, `textarea`, `dialog`, `tabs`, `form` 미설치
- react-hook-form + zod는 설치되어 있으나 적용된 폼 없음(로그인/가입 폼은 `useState` 패턴)
- 토스페이먼츠 SDK, 상태관리 라이브러리 미설치

## 개발 단계

### Phase 1: 애플리케이션 골격 구축

- ✅ **Task 001: 전체 라우트 구조 및 공통 레이아웃 골격 생성** - 우선순위
  - 고객 라우트 빈 페이지 생성: `app/page.tsx`(홈/상품 목록, 기존 랜딩 대체), `app/products/[id]/page.tsx`, `app/cart/page.tsx`, `app/checkout/page.tsx`, `app/orders/page.tsx`, `app/orders/complete/page.tsx`
  - 관리자 라우트 빈 페이지 생성: `app/admin/layout.tsx`, `app/admin/page.tsx`(대시보드), `app/admin/products/page.tsx`, `app/admin/orders/page.tsx`, `app/admin/purchase-orders/page.tsx`
  - 결제 승인 Route Handler 스텁 생성: `app/api/payments/confirm/route.ts` (F008 자리만 확보, 로직 없음)
  - 헤더 네비게이션 컴포넌트 골격 `components/site-header.tsx` 작성 — 비로그인/customer/admin 3종 메뉴 분기 자리 확보(PRD 4장 메뉴 구조)
  - 루트 `proxy.ts` matcher 및 공개 경로 정책 정리 — `/`, `/products/*`는 공개, `/cart`, `/checkout`, `/orders/*`, `/admin/*`는 인증 필요로 구분
  - 관련 기능 ID: F003, F004, F005, F006, F010, F011, F020

- ✅ **Task 002: 타입 정의 및 도메인 유틸리티 기반 마련**
  - `lib/format.ts` 작성 — 원화 금액 포맷, 주문/발주 상태 라벨 매핑
  - `lib/auth/require-admin.ts` 작성 — Server Component에서 `supabase.auth.getClaims()` + `profiles.role` 확인 후 비관리자 시 `redirect("/")` (F020 골격, 실제 DB 조회는 Phase 3에서 연결)
  - 관련 기능 ID: F020

### Phase 2: UI/UX 완성 (더미 데이터 활용)

- ✅ **Task 003: shadcn 컴포넌트 설치 및 더미 데이터 계층 구성** - 우선순위
  - shadcn/ui 신규 컴포넌트 설치: `table`, `select`, `textarea`, `dialog`, `tabs`, `form` → `components/ui/`
  - `lib/mock/products.ts`, `lib/mock/orders.ts`, `lib/mock/purchase-orders.ts` 작성 — 재고 충분/임계치 근접/품절 케이스를 모두 포함한 더미 데이터
  - `components/product-card.tsx`, `components/status-badge.tsx`, `components/empty-state.tsx` 등 공통 도메인 컴포넌트 구현
  - `docs/guides/styling-guide.md` 기준으로 디자인 토큰 일관성 확인, `app/globals.css`의 `@theme` 토큰만 사용(하드코딩 색상 금지)
  - 장바구니 상태 관리 방식 결정 및 구현 — `localStorage` 기반 클라이언트 상태(`hooks/use-cart.ts`), SSR hydration은 `hooks/use-is-mounted.ts` 패턴 재사용
  - 관련 기능 ID: F003, F005

- ✅ **Task 004: 고객 페이지 UI 구현 (더미 데이터)**
  - `app/page.tsx` — 상품 카드 그리드, 반응형 컬럼(모바일 1 / 태블릿 2 / 데스크톱 3~4) (F003)
  - `app/products/[id]/page.tsx` — 상품 정보, 재고 여부 표시(수량 노출 대신 "재고 있음/품절"), 수량 선택기, 담기 버튼 (F004, F005)
  - `app/cart/page.tsx` — 장바구니 목록, 수량 조정, 삭제, 합계, 결제하기 버튼 (F005)
  - `app/checkout/page.tsx` — react-hook-form + zod 기반 배송정보 폼(`components/ui/form` 사용), 주문 요약 패널, 결제 버튼 (F006)
  - `app/orders/complete/page.tsx` — 결제 결과 및 주문 요약 UI (F010) / `app/orders/page.tsx` — 주문 목록 테이블 + 상태 배지 (F011)
  - 로그인/회원가입 폼을 `useState`에서 react-hook-form + zod로 전환(`components/login-form.tsx`, `components/sign-up-form.tsx`) (F001, F002) — 이전 커밋(216f832)에서 이미 완료되어 있음을 확인
  - 반응형·다크모드 검증: `npm run dev` 후 `mcp__playwright__browser_navigate` → `browser_resize`(375/768/1280) + 테마 토글로 `browser_snapshot` 반복 확인

- ✅ **Task 005: 관리자 페이지 UI 구현 (더미 데이터)**
  - `app/admin/layout.tsx` — 관리자 사이드바/탭 네비게이션(대시보드·상품·주문·발주)
  - `app/admin/page.tsx` — 매출 합계, 주문 건수, 재고부족 상품 수 요약 카드 (F021)
  - `app/admin/products/page.tsx` — `table` 기반 상품 목록, 등록/수정 `dialog` + react-hook-form 폼(name/price/stock_quantity/threshold/description), 삭제 확인 다이얼로그 (F022, F023)
  - `app/admin/orders/page.tsx` — 주문 목록 테이블, 상세 다이얼로그, 배송 상태 변경 `select` (F024)
  - `app/admin/purchase-orders/page.tsx` — `tabs`로 pending/confirmed/received 상태별 목록, 확인 처리·입고 처리 버튼 (F025, F026, F027)
  - 헤더 메뉴 admin 전용 항목 노출 분기는 `profiles.role` 조회가 가능해지는 Phase 3 Task 009로 이연(`components/site-header.tsx`에 TODO 명시), 대신 관리자 라우트 자체 서브 네비게이션(`app/admin/layout.tsx`)으로 대체 구현
  - 반응형(테이블 가로 스크롤)·다크모드를 `mcp__playwright__*` 및 사용자 브라우저 확인으로 검증

- ✅ **Task 005-1: 상품 이미지 더미 데이터 적용 (picsum.photos)** - Phase 2 보강
  - `lib/mock/products.ts`에 `imageUrl` 필드 추가, 상품별 고유 picsum seed 부여
  - `lib/schemas/product.ts`에 `imageUrl` optional 필드 추가(관리자 폼 URL 입력용)
  - `hooks/use-cart.ts`의 `CartItem`에 `imageUrl?` 필드 추가
  - `next.config.ts`에 `images.remotePatterns` 설정(picsum.photos)
  - `components/product-card.tsx`, 상품 상세, 장바구니, 체크아웃 요약, 관리자 상품 테이블/폼에 `next/image` 렌더링 추가
  - 반응형·다크모드에서 이미지 aspect-ratio 고정 및 배경(`bg-muted`) 확인
  - Phase 4 Task 012(Supabase Storage 실제 업로드)의 전 단계 더미 UI 작업 — 필드명(`imageUrl`)은 실데이터 전환 시 그대로 유지
  - 관련 기능 ID: F003, F004, F005, F022

### Phase 3: 핵심 기능 구현

- ✅ **Task 006: Supabase 스키마 설계 및 마이그레이션 파일 작성** - 우선순위
  - `supabase/migrations/`에 신규 마이그레이션 파일 작성(원격 적용은 Task 007에서 수행):
    - `profiles.role` 컬럼 추가 + 관리자 판별 헬퍼 + 권한 상승 방지책 마련
    - `products`(name, price, stock_quantity, threshold, description 등)
    - `orders`(user_id, status, total_amount, payment_key, 배송정보) + `order_items`(product_id, quantity, unit_price)
    - `purchase_orders`(status pending/confirmed/received, requested_quantity)
  - 중복 발주 방지 로직 설계: 동일 `product_id`에 pending/confirmed 상태 발주가 있으면 재생성하지 않도록 제약(유니크 인덱스 등) 설계, received 이후에는 재발주 허용
  - `process_order_payment` 함수 시그니처 설계(구현은 Task 010) — 클라이언트가 전달한 가격을 신뢰하지 않고 서버가 `products.price`로 금액을 재계산하는 규약으로 설계
  - RLS 정책 작성(PRD 6장): `products` select 공개·변경 admin, `orders`/`order_items` 본인 또는 admin select, 클라이언트 직접 insert 차단, `purchase_orders` admin 전용
  - `lib/types/commerce.ts` 작성 — `Product`, `CartItem`, `Order`, `OrderItem`, `PurchaseOrder`, `OrderStatus`, `PurchaseOrderStatus` 도메인 타입 정의(추후 `database.types.ts` 재생성 결과와 합성)
  - `lib/schemas/` 작성 — zod 스키마: `productSchema`(name/price/stock_quantity/threshold/description), `shippingSchema`(수령인/주소/연락처)
  - 관련 기능 ID: F009, F020, F022, F023

- ✅ **Task 007: Supabase 스키마 원격 적용 및 타입 재생성**
  - `mcp__supabase__list_tables`로 현재 원격 스키마 확인
  - Task 006에서 작성한 마이그레이션을 `mcp__supabase__apply_migration`으로 순차 적용(profiles.role → products → orders → order_items → purchase_orders)
  - `mcp__supabase__generate_typescript_types`로 `lib/supabase/database.types.ts` 재생성, `lib/types/commerce.ts`를 생성된 `Tables<>` 타입 기반으로 정리
  - 시드 데이터 삽입(`mcp__supabase__execute_sql`) — 상품 5~10건, 관리자 계정 1건의 `profiles.role = 'admin'` 지정
  - `mcp__supabase__get_advisors`(security/performance)로 초기 경고 확인 및 기록
  - 관련 기능 ID: F003, F022

- ✅ **Task 008: 상품 조회 및 장바구니 실데이터 연동**
  - `lib/queries/products.ts` 작성 — `getProducts()`, `getProductById(id)`(`"use cache"` + `cacheLife`, 쿠키 비의존 `lib/supabase/cached-client.ts` 사용), `getProductsByIds(ids)`(캐시 없음)
  - `app/page.tsx`, `app/products/[id]/page.tsx`의 더미 데이터를 실제 쿼리로 교체, 존재하지 않는 상품은 `notFound()` → 404
  - Cache Components 대응: `SiteHeader`(쿠키 접근)를 6개 페이지에서 `<Suspense>`로 분리해 정적 셸 prerender 확보, 동적 세그먼트 `params`는 자식 컴포넌트+Suspense로 재구성
  - `lib/actions/cart.ts`(Server Action `revalidateCartItems`)로 장바구니(`hooks/use-cart.ts`)가 저장한 product_id의 가격·재고를 서버에서 재검증, `CartView`에 통합(품절/삭제/가격변경 배지, 수량 버튼 비활성화)
  - **테스트 체크리스트**: `mcp__playwright__*`로 홈 → 상품 상세 → 담기 → 장바구니 반영 확인, 품절 상품 담기 차단, 새로고침 후 장바구니 유지, 존재하지 않는 상품 ID 접근 시 404 — 완료. 로그인 필요 라우트인 담기/재검증 시나리오는 사용자가 실제 브라우저에서 직접 확인
  - 관련 기능 ID: F003, F004, F005

- ✅ **Task 009: 인증 가드 및 RLS 정책 적용**
  - `lib/supabase/proxy.ts`의 `updateSession()` 공개/보호 경로 규칙 확정(`/`, `/products/*`, `/auth/*`는 공개) — 기존 구현이 이미 요구사항을 충족함을 확인
  - `/checkout` 미인증 진입 시 `redirect=/checkout` 쿼리로 로그인 페이지 이동, 로그인 성공 후 복귀 처리 — `app/auth/login/page.tsx` + `components/login-form.tsx` + `lib/utils.ts`의 `getSafeRedirectPath()`(open-redirect 방어 포함)로 이미 완성되어 있음을 확인
  - `lib/auth/require-admin.ts` 완성 — `profiles.role` 조회 후 비관리자 시 홈 리다이렉트, `app/admin/layout.tsx`에서 호출 (F020) — 기존 구현 확인
  - RLS 정책이 5개 테이블(`profiles`, `products`, `orders`, `order_items`, `purchase_orders`) 모두 마이그레이션 파일에 작성 및 원격 DB에 적용되어 있음을 `pg_policies` 조회로 확인. 로컬/원격 마이그레이션 히스토리 동기화 점검 중 원격 전용 `revoke_handle_new_user_public_execute_v2`를 발견해 로컬에 `20260814121305_revoke_handle_new_user_public_execute_v2.sql` 추가(원격엔 이미 적용되어 있어 재적용 없이 히스토리만 동기화)
  - `mcp__supabase__get_advisors`로 RLS 미적용·정책 누락 경고 0건 확인(범위 밖 경고 2건 — `process_order_payment`의 authenticated 실행 권한(Task 010 설계 의도), Auth leaked password protection 비활성화 — 은 별도 기록만 하고 이번 범위에서 제외)
  - **테스트 체크리스트**: `mcp__playwright__*`로 비로그인 `/checkout` 접근 → `/auth/login?redirect=%2Fcheckout` 리다이렉트 → 로그인 → `/checkout` 복귀 확인, customer 계정으로 `/admin` 접근 시 `/`로 리다이렉트(관리자 메뉴 비노출까지 확인), admin 계정으로 `/admin` 정상 진입 — 모두 통과. "customer가 타인 주문 조회 불가"는 `/orders`가 아직 mock 데이터(Task 010에서 실데이터 연동 예정)라 UI 검증이 불가능해 `mcp__supabase__execute_sql`로 JWT claims를 시뮬레이션한 SQL 레벨 RLS 검증으로 대체 — customer는 본인 주문만 조회(타인 주문은 id 직접 지정해도 0건), admin은 전체 조회 가능함을 확인, 테스트 데이터는 정리 완료

- ✅ **Task 010: 결제 승인 및 자동 발주 트랜잭션 구현**
  - 토스페이먼츠 SDK/키가 프로젝트에 전혀 설치·설정되어 있지 않아(`.env.local` 확인) 실제 PG 연동 대신 **모의 결제**(결제위젯 없이 배송정보+장바구니를 그대로 승인 API로 전송)로 범위를 조정 — DB 트랜잭션 로직은 실제 PG 연동 여부와 무관하게 동일하게 구현했으며, 향후 실 키가 준비되면 `app/api/payments/confirm/route.ts`의 RPC 호출 앞부분에 토스페이먼츠 승인 API 호출만 추가하면 되도록 경계를 분리해둠
  - `process_order_payment` Postgres 함수를 `supabase/migrations/20260921100000_implement_process_order_payment_function.sql`로 구현 후 `mcp__supabase__apply_migration` 적용 — product_id 오름차순 정렬로 `select ... for update` 잠금(데드락 예방) → 서버 조회 `price`로 금액 재계산(클라이언트 가격 불신) → 재고 부족 시 예외 → `orders`/`order_items` insert → `products.stock_quantity` 차감 → 차감 후 `stock_quantity < threshold`면 `purchase_orders`에 `requested_quantity = threshold - stock_quantity`로 자동 발주(`on conflict (product_id) where status in ('pending','confirmed') do nothing`으로 중복 방지) (F008, F009)
  - `app/api/payments/confirm/route.ts` 구현 — `getClaims()`로 인증 확인(401) → `lib/schemas/payment.ts`의 `confirmPaymentSchema`로 요청 바디 검증(400) → `supabase.rpc('process_order_payment', ...)` 호출(모의 `payment_key`는 `crypto.randomUUID()`) → 성공 시 `orderId`/`totalAmount` 응답, 재고 부족 등 실패 시 409와 에러 메시지
  - 금액 위변조 방지: 클라이언트가 보낸 가격은 사용하지 않고, `for update`로 잠가 조회한 `products.price`만을 근거로 서버가 총액을 재계산
  - `components/checkout-form.tsx`의 `onSubmit`을 위 API 호출로 교체 — 성공 시 `orderId`와 함께 `/orders/complete`로 이동, 실패 시 폼에 에러 메시지 표시(페이지 이동 없이 배송정보 유지)
  - `lib/queries/orders.ts` 신규(`getMyOrders`/`getOrderById`, 캐시 없음·RLS 의존) 작성 후 `app/orders/complete/page.tsx`, `app/orders/page.tsx`를 실제 `orders`/`order_items` 조회로 교체 (F010, F011). `lib/format.ts`의 `ORDER_STATUS_LABEL`에 누락되어 있던 `pending_payment` 라벨도 보강
  - **테스트 체크리스트**: `mcp__playwright__*`로 모의 결제 버튼 기반 전체 결제 플로우 E2E(로그인→담기→체크아웃→결제→완료 페이지) 통과, 결제 후 `stock_quantity` 감소 확인(`mcp__supabase__execute_sql`) 통과, 임계치 미만 도달 시 `purchase_orders` pending 1건 생성 통과, 동일 상품 재결제 시 발주 중복 생성 안 됨 통과, 재고 초과 수량 주문 시 폼 내 에러 표시 및 DB 롤백 확인 통과, `/orders` 목록 반영 통과. "결제 테스트 키 기반 E2E"는 모의 결제 버튼 기반으로, "승인 실패/취소 리다이렉트"는 실제 PG 리다이렉트가 없어 체크아웃 폼 내 에러 표시로 대체 수행

- ✅ **Task 011: 관리자 기능 실데이터 연동**
  - `orders` 테이블에 admin `UPDATE` RLS 정책이 없음을 재확인(`products`/`purchase_orders`는 이미 존재)해 `supabase/migrations/20260921120000_add_orders_admin_update_policy.sql`로 선행 추가·적용(F024 전제조건)
  - `lib/queries/admin.ts` 작성 — 대시보드 요약(매출 합계, 주문 건수, `stock_quantity < threshold` 상품 수, 기존 mock 대시보드와 동일하게 상태 필터 없이 전체 합산), `getAllOrders()`(`lib/queries/orders.ts`의 `mapOrderRow`/`OrderRow`를 export해 재사용), `getAllPurchaseOrders()` (F021)
  - 상품 등록/수정/삭제 Server Action(`lib/actions/products.ts`) 구현 — `requireAdmin()` 확인 → `productSchema`(`lib/schemas/`) 재검증 → camelCase→snake_case 매핑 후 `products` 반영, 성공 시 `revalidatePath('/admin/products')`+`revalidatePath('/')`로 "use cache" 캐시까지 무효화 (F022, F023)
  - 주문 관리: `lib/queries/admin.ts`의 `getAllOrders()`로 전체 목록/상세 조회, `lib/actions/orders.ts`의 `updateOrderStatus`로 `orders.status` 변경 Server Action (F024)
  - 발주 관리: `getAllPurchaseOrders()`로 상태별 조회(F025), `lib/actions/purchase-orders.ts`의 `confirmPurchaseOrder`로 pending → confirmed 전환(F026), `receivePurchaseOrder`(RPC 호출)로 confirmed → received 전환 — 재고 가산과 상태 변경의 부분 실패로 인한 이중 가산을 막기 위해 `supabase/migrations/20260921120100_create_receive_purchase_order_function.sql`의 `receive_purchase_order` Postgres 함수(SECURITY INVOKER, 호출자의 기존 admin RLS 권한 사용)로 원자적 처리 (F027)
  - `app/admin/page.tsx`, `app/admin/products/page.tsx`, `app/admin/orders/page.tsx`, `app/admin/purchase-orders/page.tsx` 전부 서버 컴포넌트로 전환해 `<Suspense>` 경계로 데이터 영역을 분리하고, 각각 신규 클라이언트 컴포넌트(`admin-products-table.tsx`, `admin-orders-table.tsx`, `admin-purchase-orders-tabs.tsx`)로 목록/액션 UI 위임
  - `lib/mock/products.ts`, `orders.ts`, `purchase-orders.ts` 참조가 모두 사라져 삭제
  - **테스트 체크리스트**: `mcp__playwright__*`로 상품 등록 → 홈(`/`) 목록 즉시 반영 확인(관리자 상품 등록 시 목록에서 사라지던 기존 버그가 이 Task로 완전히 해결됨), 수정/삭제도 새로고침 후 유지 확인, 주문 상태 변경이 DB에 반영되고 유지됨을 확인, 임계치를 낮게 수정한 상품을 결제해 발주(pending)가 생성됨을 확인, 발주 확인→입고 처리 후 `products.stock_quantity`가 `requested_quantity`만큼 증가하고 `/admin/products`에도 즉시 반영됨을 확인, 입고 완료(received)된 발주가 있어도 재차 임계치 미만이 되면 새 pending 발주가 정상적으로 생성됨(부분 유니크 인덱스가 received를 배제 조건에서 제외하는 설계가 의도대로 동작)을 `mcp__supabase__execute_sql`로 확인 — 모두 통과

- ✅ **Task 011-1: 핵심 기능 통합 테스트**
  - `mcp__playwright__*`로 고객 전체 플로우 E2E 통과: 회원가입 폼 제출(`example.com`처럼 명백한 테스트 도메인은 Supabase가 "사용할 수 없는 이메일 주소"로 거부해 `gmail.com` 도메인으로 재시도) → `/auth/sign-up-success` 도달, `auth.users`에 `email_confirmed_at=null`로 생성되고 `handle_new_user` 트리거로 `profiles`도 자동 생성됨을 확인 → 이메일 확인이 필요해 이후 플로우는 기존 컨펌된 customer 계정으로 이어서 로그인 → 상품 탐색 → 장바구니 → 체크아웃 → 결제 → 주문완료 → 주문내역까지 전 구간 에러 없이 통과. 회원가입 테스트 계정은 삭제(`profiles`는 `on delete cascade`로 연쇄 삭제 확인)
  - 관리자 전체 플로우 E2E 통과: admin 로그인 → 대시보드(매출/주문건수/재고부족 정확히 표시) → 상품 등록/수정/삭제 → 고객 플로우가 만든 주문의 상태 변경(DB 반영 확인) → 발주 확인 → 입고 처리(재고 가산 확인) — 관리자 플로우가 앞 단계들의 주문/발주 데이터를 재사용하며 전체 테스트 데이터 정리도 겸함
  - 자동 발주 임계치 경계값 검증 통과: 재고=threshold일 때 발주 미생성(`<` 조건이 `=`에서는 트리거되지 않음), 재고=threshold-1일 때 발주 1건 정확히 생성됨을 `mcp__supabase__execute_sql`로 확인
  - 에러/엣지 케이스 4종 — 로드맵 원문과 실제 재해석 사유를 명시: **동시 주문 재고 경합**은 `mcp__playwright__*`/`mcp__supabase__execute_sql`이 단일 세션 도구라 진짜 병렬 실행이 불가능해, `process_order_payment`를 순차 두 번 호출해 `for update` 잠금이 갱신된 재고를 정확히 반영함(두 번째 호출이 재고부족으로 거부됨)을 확인하는 것으로 대체. **결제 승인 중복 호출**은 `app/api/payments/confirm/route.ts`가 매 요청 `crypto.randomUUID()`로 새 `payment_key`를 생성해 "동일 payment_key 재요청" 자체가 불가능하므로, 동일 장바구니로 동시 2회 요청 시 각기 다른 주문 2건이 그대로 생성됨을 확인(멱등성 키 미구현이라는 알려진 제약으로 기록). **빈 장바구니 체크아웃**은 `EmptyState`가 정확히 노출되고 결제 폼 자체가 렌더링되지 않음을 확인. **세션 만료**는 쿠키를 전부 제거한 뒤 결제 API 호출 시 `lib/supabase/proxy.ts`가 `/auth/login`으로 리다이렉트(307)시켜 결제가 차단됨을 확인(API route의 401 JSON이 아니라 proxy 레벨 리다이렉트라는 세부 차이가 있으나 결제 차단이라는 목적은 동일하게 달성)
  - `mcp__supabase__get_advisors`로 보안 경고 재확인 — 기존 경고 2건(범위 밖)만 있고 신규 없음. 성능 advisor에서 인덱스 관련 INFO 3건(`order_items`/`orders`의 외래키 미인덱싱)을 신규 발견했으나 `docs/ROADMAP.md` Task 013(성능 최적화)에서 이미 계획된 범위라 이번 Task에서는 기록만 하고 코드 변경 없음
  - `npm run lint` / `typecheck` / `format:check` / `build` 전부 통과. 테스트 전 구간에서 생성/변경한 모든 데이터(테스트 계정, 주문, 발주, 상품 재고/임계치, 등록 상품)를 검증 후 전부 원상 복구(`orders`/`purchase_orders` 0건, 8개 상품 재고/임계치 원래 값과 일치 확인)

### Phase 4: 고급 기능 및 최적화

- ✅ **Task 012: 사용자 경험 향상 기능**
  - 상품 검색·정렬·페이지네이션: `lib/queries/products.ts`의 `getProducts({search?, sort?, page?})`를 URL 쿼리 파라미터(`?q=&sort=&page=`) 기반으로 확장(F003 확장). 정렬은 화이트리스트 매핑(`newest`/`price_asc`/`price_desc`)으로 인젝션 방지, `PAGE_SIZE=12`, `count:'exact'`로 총 개수 조회. `"use cache"` + `cacheLife("minutes")`는 그대로 유지(인자별로 캐시 키 분리됨). 신규 발견 버그 수정: 존재하지 않는 페이지 번호 접근 시 PostgREST가 던지는 `PGRST103`(Requested range not satisfiable)을 감지해 빈 결과로 안전 처리. `app/page.tsx`를 `ProductSearchControls`(검색/정렬, client)와 `ProductGrid`(목록, server)로 분리해 각각 별도 `<Suspense>`로 감쌈(`useSearchParams`가 Suspense 밖에 있으면 Cache Components의 blocking-prerender 에러 발생하던 것을 수정). `components/pagination.tsx` 신규(Link 기반, 비활성 시 `pointer-events-none`)
  - 상품 이미지 업로드(F022 확장): `supabase/migrations/20260922100000_create_product_images_storage_bucket.sql`로 `product-images` public 버킷 생성 — `products` 테이블과 대칭되는 RLS 패턴(select 공개, insert/update/delete는 `is_admin()`). `lib/actions/products.ts`의 `uploadProductImage()`가 `crypto.randomUUID()` 파일명으로 업로드 후 public URL 반환. `components/admin/product-form-dialog.tsx`의 이미지 텍스트 입력을 파일 input + 미리보기로 교체(파일 미선택 시 기존 `image_url` 유지). `next.config.ts`의 `images.remotePatterns`에 Supabase Storage 도메인 추가
  - 로딩/에러 세그먼트 경계: 기존에 각 `page.tsx` 내부에 있던 `<Suspense>`+skeleton 패턴을 대체하지 않는 보완재로 `app/loading.tsx`, `app/error.tsx`, `app/admin/loading.tsx`, `app/admin/error.tsx` 4개 신규 배치(`error.tsx`는 `"use client"` + `reset` 필수). `app/cart`, `app/checkout`, `app/admin/layout.tsx`에 남아있던 "Phase 3 재검토" TODO 주석 제거(실데이터 연동이 이미 완료됐으므로)
  - 토스트 알림(sonner, 기존 `Toaster` 재사용): 기존 인라인 에러 텍스트는 유지한 채, 무피드백이던 성공 케이스에 도입 — 상품 등록/수정/삭제(`admin-products-table.tsx`), 발주 확인/입고 처리(`admin-purchase-orders-tabs.tsx`), Realtime 신규 발주 알림
  - 관리자 발주 목록 Realtime: `supabase/migrations/20260922110000_add_purchase_orders_to_realtime_publication.sql`로 `purchase_orders`를 `supabase_realtime` publication에 추가(적용 전에는 publication이 완전히 비어있어 구독해도 이벤트가 전혀 오지 않았음). `admin-purchase-orders-tabs.tsx`에 `postgres_changes` 채널 구독 추가, `useEffect` cleanup에서 `removeChannel` 처리. **신규 발견 버그 및 수정**: `postgres_changes`는 RLS(`purchase_orders`의 select 정책 `is_admin()`)를 준수하는데, 구독 시점에 realtime 클라이언트가 로그인 세션의 JWT를 갖고 있지 않아 익명 권한으로 평가되어 이벤트가 전혀 도착하지 않는 문제를 발견 — `supabase.auth.getSession()`으로 세션을 먼저 확보한 뒤 `supabase.realtime.setAuth(session.access_token)`을 호출하고 나서 채널을 구독하도록 수정해 해결
  - **테스트 체크리스트**: `mcp__playwright__*`로 4개 영역 통합 검증 — 검색("에티오피아" → 결과 1건), 정렬(가격 낮은순 오름차순 확인), 페이지네이션(존재하지 않는 page 접근 시 안전한 빈 상태 처리) 모두 통과. 관리자 상품 등록에서 실제 PNG 파일 업로드 → 미리보기 → 등록 후 홈/관리자 화면에 정상 표시 확인. `loading.tsx`/`error.tsx` 4개 파일 구조 확인. 상품 CRUD와 발주 확인/입고 처리 토스트 노출 확인. SQL INSERT로 발주 생성 시 관리자 화면이 Realtime으로 즉시 갱신(신규 발주 토스트 포함)되고, 확인→입고 처리 전체 플로우가 재고 반영까지 정확히 동작함을 확인. 테스트로 생성한 상품/발주 데이터와 Storage 이미지 파일(이전 세션부터 미해결로 남아있던 orphan 파일 포함)을 모두 정리해 원상 복구. `npm run lint` / `typecheck` / `format:check` / `build` 전부 통과

- ✅ **Task 013: 성능 최적화 및 배포 준비**
  - **신규 발견 사실 — `instant = false`는 "route segment config 잔재"가 아니었음**: `node_modules/next/dist/docs`를 직접 확인한 결과 `instant`는 Next.js 16의 정식 옵트아웃 API이며, 기본 `'warning'` 레벨은 dev 환경에서만 검증하고 `next build`는 절대 막지 않는다(공식 문서: "the build is unaffected"). `app/cart/page.tsx`, `app/checkout/page.tsx`, `app/orders/page.tsx`, `app/orders/complete/page.tsx` 4개 파일에서 실제로 제거해 `mcp__playwright__*`로 direct visit과 client navigation 양쪽을 재검증(Next.js DevTools Route Info 포함)한 결과 문제없음을 확인하고 제거했다. `app/admin/layout.tsx`는 `requireAdmin()`이 인증 실패 시 호출하는 `redirect()`가 `<Suspense>`나 `"use cache: private"` 스코프에서 사용할 수 없어 이 layout 자체가 구조적으로 블로킹될 수밖에 없음을 확인하고 유지했다(주석을 실제 이유로 갱신)
  - 데이터베이스 인덱스: `supabase/migrations/20260922120000_add_performance_indexes.sql`로 `mcp__supabase__get_advisors(performance)`가 실측한 미인덱싱 외래키 3건(`order_items.order_id`, `order_items.product_id`, `orders.user_id`)과 로드맵이 명시한 `orders(user_id, created_at desc)` 복합 인덱스, `purchase_orders(status)` 인덱스를 추가. 적용 후 advisor 재실행으로 기존 `unindexed_foreign_keys` 경고 3건이 정확히 사라졌음을 확인(신규 인덱스 미사용 INFO는 실트래픽 부족에 따른 정상적인 일시적 신호)
  - 이미지 최적화: `next/image` 사용 5곳(`products/[id]/page.tsx`, `checkout-form.tsx`, `product-card.tsx`, `cart-view.tsx`, `admin-products-table.tsx`)이 이미 전부 `fill`+`sizes`를 정확히 적용하고 있었고 상품 상세 페이지엔 `priority`까지 있어 코드 변경이 불필요했다. `mcp__playwright__browser_network_requests`로 홈/상품상세/장바구니를 확인한 결과 각 컴포넌트의 `sizes`가 실제로 다른 크기의 `/_next/image` 최적화 요청을 유도하고 중복 요청이 없음을 실측으로 확인
  - 환경변수/CI: 이 프로젝트는 토스페이먼츠 시크릿 키 자체가 발급되지 않은 모의 결제 프로젝트(`app/api/payments/confirm/route.ts` 주석에 명시)라 "실키 정리"는 대상이 없어, `.env.example`을 신규 작성해 현재 키 2개(값은 비움)와 향후 토스페이먼츠 연동 시 필요한 키 자리를 문서화하는 것으로 범위를 조정했다. `.github/workflows/ci.yml`을 신규 작성해 `main` 대상 push/PR 시 `lint`→`typecheck`→`format:check`→`build` 4단계를 자동 실행하도록 구성(실제 배포 job은 시크릿이 없어 범위 밖으로 명시)
  - 로깅: `mcp__supabase__query_logs`의 소스 목록(`edge_logs`/`postgres_logs`/`postgrest_logs`/`realtime_logs`/`auth_audit_logs`/`storage_logs`/`auth_logs`/`pgbouncer_logs`)을 확인한 결과 Next.js 서버(API Route, Server Action)의 콘솔 로그를 수집하는 소스가 없음을 확인 — DB 함수 레벨 실패를 `postgres_logs`로 사후 조사하는 보조 도구로만 유효함을 코드 주석에 명시. `app/api/payments/confirm/route.ts`의 `rpcError` 분기와 `lib/actions/purchase-orders.ts`의 `confirmPurchaseOrder`/`receivePurchaseOrder` 에러 분기에 기존 `throw`/`NextResponse.json` 흐름을 바꾸지 않는 `console.error` 로깅만 추가(별도 로깅 서비스 도입 없음). 존재하지 않는 상품으로 결제 API를 실제 호출해 dev 서버 로그 파일에 `[payment] process_order_payment 실패` 로그가 정확히 출력됨을 실증 확인
  - **테스트 체크리스트**: `npm run lint` / `typecheck` / `format:check` / `build` 전부 통과. `mcp__playwright__*`로 홈/관리자 대시보드 등 주요 페이지 회귀 확인(콘솔 에러 없음, 매출/주문건수/재고부족 정확히 표시). `mcp__supabase__get_advisors`로 성능/보안 advisor 최종 재확인 — 성능은 인덱스 미사용 INFO(정상적 일시 상태)만 남고 신규 문제 없음, 보안은 기존 경고 2건(범위 밖, Task 011-1에서 이미 기록)만 유지되고 신규 없음. 테스트로 생성한 발주 데이터는 모두 정리(0건 확인)

## 기능 ID 커버리지

| 기능 ID | 기능명                 | 담당 Task               |
| ------- | ---------------------- | ----------------------- |
| F001    | 회원가입               | Task 004                |
| F002    | 로그인                 | Task 004                |
| F003    | 상품 목록 조회         | Task 003, 004, 008, 012 |
| F004    | 상품 상세 조회         | Task 004, 008           |
| F005    | 장바구니 관리          | Task 003, 004, 008      |
| F006    | 배송정보 입력          | Task 004                |
| F007    | 토스페이먼츠 결제 요청 | Task 010                |
| F008    | 결제 승인 및 주문 생성 | Task 010                |
| F009    | 자동 발주 요청 생성    | Task 006, 010           |
| F010    | 주문완료 확인          | Task 004, 010           |
| F011    | 주문내역 조회          | Task 004, 010           |
| F020    | 관리자 권한 체크       | Task 002, 009           |
| F021    | 대시보드 요약          | Task 005, 011           |
| F022    | 상품 등록              | Task 005, 011, 012      |
| F023    | 상품 수정/삭제         | Task 005, 011           |
| F024    | 주문 관리              | Task 005, 011           |
| F025    | 발주 요청 목록 조회    | Task 005, 011           |
| F026    | 발주 확인 처리         | Task 005, 011           |
| F027    | 입고 처리              | Task 005, 011           |
