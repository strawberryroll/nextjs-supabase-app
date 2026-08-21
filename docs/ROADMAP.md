# 재고 부족 자동 재주문 커머셜 웹 개발 로드맵

재고가 임계치 아래로 떨어지는 순간 시스템이 스스로 발주를 만들어, 1~2인 셀러가 재고 소진을 놓치지 않게 하는 B2C 쇼핑몰

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
- `app/`에는 `app/auth/*`(login, sign-up, forgot-password, update-password, sign-up-success, error, confirm)과 `app/protected/*`만 존재 — 커머스/관리자 라우트 전무
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

### Phase 3: 핵심 기능 구현

- **Task 006: Supabase 스키마 설계 및 마이그레이션 파일 작성** - 우선순위
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

- **Task 007: Supabase 스키마 원격 적용 및 타입 재생성**
  - `mcp__supabase__list_tables`로 현재 원격 스키마 확인
  - Task 006에서 작성한 마이그레이션을 `mcp__supabase__apply_migration`으로 순차 적용(profiles.role → products → orders → order_items → purchase_orders)
  - `mcp__supabase__generate_typescript_types`로 `lib/supabase/database.types.ts` 재생성, `lib/types/commerce.ts`를 생성된 `Tables<>` 타입 기반으로 정리
  - 시드 데이터 삽입(`mcp__supabase__execute_sql`) — 상품 5~10건, 관리자 계정 1건의 `profiles.role = 'admin'` 지정
  - `mcp__supabase__get_advisors`(security/performance)로 초기 경고 확인 및 기록
  - 관련 기능 ID: F003, F022

- **Task 008: 상품 조회 및 장바구니 실데이터 연동**
  - `lib/queries/products.ts` 작성 — 서버 클라이언트(`lib/supabase/server.ts`) 기반 `getProducts()`, `getProductById(id)`
  - `app/page.tsx`, `app/products/[id]/page.tsx`의 더미 데이터를 실제 쿼리로 교체
  - Cache Components 대응: 상품 목록/상세에 `"use cache"` + `cacheLife` 적용, 재고처럼 변동성 높은 영역은 `<Suspense>` 경계로 분리(route segment config 사용 금지)
  - 장바구니(`hooks/use-cart.ts`)가 저장한 product_id로 서버에서 가격·재고를 재검증하는 로직 추가(클라이언트 가격 신뢰 금지)
  - **테스트 체크리스트**: `mcp__playwright__*`로 홈 → 상품 상세 → 담기 → 장바구니 반영 확인, 품절 상품 담기 차단, 새로고침 후 장바구니 유지, 존재하지 않는 상품 ID 접근 시 404
  - 관련 기능 ID: F003, F004, F005

- **Task 009: 인증 가드 및 RLS 정책 적용**
  - `lib/supabase/proxy.ts`의 `updateSession()` 공개/보호 경로 규칙 확정(`/`, `/products/*`, `/auth/*`는 공개)
  - `/checkout` 미인증 진입 시 `redirect=/checkout` 쿼리로 로그인 페이지 이동, 로그인 성공 후 복귀 처리
  - `lib/auth/require-admin.ts` 완성 — `profiles.role` 조회 후 비관리자 시 홈 리다이렉트, `app/admin/layout.tsx`에서 호출 (F020)
  - Task 006의 RLS 정책을 `mcp__supabase__apply_migration`으로 적용: `products`(select 공개 / 변경 admin), `orders`·`order_items`(select 본인 또는 admin, 클라이언트 insert 차단), `purchase_orders`(admin 전용)
  - `mcp__supabase__get_advisors`로 RLS 미적용·정책 누락 경고 0건 확인
  - **테스트 체크리스트**: `mcp__playwright__*`로 비로그인 `/checkout` 접근 → 로그인 → 체크아웃 복귀, customer 계정으로 `/admin` 접근 시 홈 리다이렉트, admin 계정으로 `/admin` 정상 진입, customer가 타인 주문 조회 불가

- **Task 010: 결제 승인 및 자동 발주 트랜잭션 구현**
  - 토스페이먼츠 결제위젯 SDK 설치 및 `app/checkout/page.tsx`에서 결제창 호출(클라이언트 키는 `NEXT_PUBLIC_*`, 시크릿 키는 서버 전용 환경변수)
  - `process_order_payment` Postgres 함수 구현 후 `mcp__supabase__apply_migration`으로 적용 — 주문·주문상품 생성 → `products.stock_quantity` 차감(재고 부족 시 예외) → 차감 후 `stock_quantity < threshold` 확인 → `purchase_orders` pending 생성, 단 동일 product_id에 pending/confirmed 발주가 있으면 생성 생략 (F008, F009)
  - `app/api/payments/confirm/route.ts` 구현 — 시크릿 키로 토스페이먼츠 승인 API 호출 → 성공 시 `process_order_payment` RPC 실행 → `/orders/complete`로 리다이렉트, 승인 실패 시 에러 페이지
  - 금액 위변조 방지: 클라이언트 전달 금액이 아니라 서버에서 `products.price`로 총액을 재계산해 승인 금액과 대조
  - `app/orders/complete/page.tsx`, `app/orders/page.tsx`를 실제 `orders`/`order_items` 조회로 교체 (F010, F011)
  - **테스트 체크리스트**: `mcp__playwright__*`로 결제 테스트 키 기반 전체 결제 플로우 E2E, 결제 후 `stock_quantity` 감소 확인(`mcp__supabase__execute_sql`), 임계치 미만 도달 시 `purchase_orders` pending 1건 생성, 동일 상품 재결제 시 발주 중복 생성 안 됨, 재고 초과 수량 주문 시 실패 처리, 승인 실패/취소 리다이렉트 처리

- **Task 011: 관리자 기능 실데이터 연동**
  - `lib/queries/admin.ts` 작성 — 대시보드 요약(매출 합계, 주문 건수, `stock_quantity < threshold` 상품 수) (F021)
  - 상품 등록/수정/삭제 Server Action 구현 — zod(`lib/schemas/`) 검증 후 `products` 반영, 성공 시 `revalidatePath` 또는 캐시 태그 무효화 (F022, F023)
  - 주문 관리: 전체 주문 목록/상세 조회 및 `orders.status` 변경 Server Action (F024)
  - 발주 관리: 상태별 조회(F025), pending → confirmed 전환(F026), confirmed → received 전환 시 `products.stock_quantity`에 `requested_quantity` 가산(Postgres 함수 또는 트랜잭션 처리) (F027)
  - 관리자 페이지의 더미 데이터를 모두 실제 쿼리로 교체하고, 재고 변동 영역은 `<Suspense>` 경계로 분리
  - **테스트 체크리스트**: `mcp__playwright__*`로 상품 등록 → 홈 목록 반영 확인, 임계치 수정 후 결제 시 발주 생성 여부 변화, 발주 확인 → 입고 처리 후 재고 증가 검증, 입고 완료(received) 후 재차 임계치 미만 시 새 발주 생성 허용 확인

- **Task 011-1: 핵심 기능 통합 테스트**
  - `mcp__playwright__*`로 고객 전체 플로우 E2E: 회원가입 → 로그인 → 상품 탐색 → 장바구니 → 체크아웃 → 결제 → 주문완료 → 주문내역
  - 관리자 전체 플로우 E2E: admin 로그인 → 대시보드 → 상품 등록/수정 → 주문 상태 변경 → 발주 확인 → 입고 처리
  - 자동 발주 시나리오 검증: 임계치 경계값(정확히 threshold, threshold-1) 동작 확인
  - 에러/엣지 케이스: 동시 주문으로 인한 재고 경합, 결제 승인 중복 호출(같은 payment_key 재요청), 빈 장바구니 체크아웃 진입, 세션 만료 후 결제 시도
  - `mcp__supabase__get_advisors`로 보안·성능 경고 재확인, `npm run lint` / `typecheck` / `format:check` / `build` 전부 통과

### Phase 4: 고급 기능 및 최적화

- **Task 012: 사용자 경험 향상 기능**
  - 상품 목록 검색·정렬·페이지네이션 추가 (F003 확장)
  - 상품 이미지 업로드 — Supabase Storage 버킷 생성 및 관리자 상품 등록 폼 연동 (F022 확장)
  - 로딩 상태 정비: 각 라우트에 `loading.tsx`, 스켈레톤 컴포넌트 적용
  - 에러 바운더리(`error.tsx`) 및 사용자 친화적 에러 메시지, 토스트 알림 도입
  - 관리자 발주 목록 실시간 갱신(Supabase Realtime) 검토 및 적용

- **Task 013: 성능 최적화 및 배포 준비**
  - Cache Components 전략 정리 — 정적 영역 `"use cache"` + `cacheLife` 프로파일 지정, 동적 영역 `<Suspense>` 경계 점검, route segment config 잔재 제거
  - 데이터베이스 인덱스 추가 — `orders(user_id, created_at)`, `order_items(order_id)`, `purchase_orders(status)` 및 `mcp__supabase__get_advisors` 성능 권고 반영
  - `mcp__playwright__browser_network_requests`로 주요 페이지 요청 수·번들 확인, 이미지 최적화(`next/image`) 적용
  - 프로덕션 환경변수 정리(토스페이먼츠 시크릿 키, Supabase 키) 및 배포 파이프라인에서 `lint` / `typecheck` / `format:check` / `build` 실행 구성
  - 결제 실패·발주 생성 실패에 대한 로깅 체계 구성(`mcp__supabase__query_logs` 활용 가능 여부 포함)

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
