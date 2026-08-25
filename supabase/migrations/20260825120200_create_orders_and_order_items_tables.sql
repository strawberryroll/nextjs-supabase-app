-- ============================================================================
-- Migration: create_orders_and_order_items_tables
-- Purpose: 커머스 스키마(원두산책)의 주문 테이블 public.orders 및 주문 상품
--          테이블 public.order_items 생성. status는 pending_payment(결제 대기)를
--          포함한 5단계로 확정한다(paid/preparing/shipping/delivered는 기존
--          lib/mock/orders.ts의 MockOrderStatus 4단계를 계승하고, 결제 완료 전
--          단계인 pending_payment를 새로 추가).
--
--          두 테이블 모두 select 전용 RLS만 적용하고 insert/update/delete
--          정책은 의도적으로 생성하지 않는다 — 모든 쓰기는
--          process_order_payment(SECURITY DEFINER, Task 5에서 생성 예정) 경유만
--          허용해 클라이언트가 가격(total_amount/unit_price)이나 재고를 직접
--          조작하지 못하도록 원천 차단한다. 관리자의 주문 상태 변경(F024)은
--          Task 011에서 별도 update 정책을 추가할 예정이다.
-- ============================================================================

-- 1. orders 테이블
create table public.orders (
  id uuid not null primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  status text not null default 'pending_payment'
    check (
      status in (
        'pending_payment',
        'paid',
        'preparing',
        'shipping',
        'delivered'
      )
    ),
  total_amount integer not null check (total_amount >= 0),
  payment_key text,
  recipient text not null,
  address text not null,
  phone text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.orders is
  '주문 헤더. status는 pending_payment(결제 대기) -> paid(결제 완료) -> '
  'preparing(배송 준비) -> shipping(배송 중) -> delivered(배송 완료) 순서로 '
  '전이한다. total_amount 단위는 원(KRW), 소수점 없는 정수. payment_key는 '
  'PG사(예: 토스페이먼츠) 결제 승인 키로, 결제 완료 전에는 null이다. '
  'insert/update는 process_order_payment(SECURITY DEFINER)를 통해서만 '
  '수행되며, 클라이언트의 직접 쓰기는 RLS로 전면 차단된다(아래 2번 섹션 참고).';

-- 2. order_items 테이블
--    product_name을 비정규화 저장하지 않고 product_id FK로 정규화 유지한다.
--    주문 시점의 상품명 스냅샷이 필요하면 products와 조인하여 얻는다
--    (products.name이 이후 변경되어도 과거 주문 조회에는 영향이 없어야
--    한다면, 이는 이번 스키마의 범위 밖이며 향후 별도 논의가 필요하다).
--    updated_at/moddatetime 트리거는 부착하지 않는다 — 주문 항목은 생성 후
--    변경되지 않는 불변(immutable) 레코드로 설계했기 때문이다.
create table public.order_items (
  id uuid not null primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete cascade,
  product_id uuid not null references public.products (id),
  quantity integer not null check (quantity > 0),
  unit_price integer not null check (unit_price >= 0)
);

comment on table public.order_items is
  '주문 상품 라인 아이템. product_id로 products를 참조하는 정규화 설계이며 '
  'product_name은 비정규화 저장하지 않는다(주문 시점 상품명은 products와 '
  '조인해서 얻는다). unit_price 단위는 원(KRW), 주문 시점의 단가 스냅샷이다. '
  '생성 후 변경되지 않는 불변 레코드이므로 updated_at 컬럼과 트리거가 없다.';

-- 3. RLS 활성화 및 정책
--    두 테이블 모두 select 정책만 생성한다. insert/update/delete 정책은
--    의도적으로 생성하지 않음 — 모든 쓰기는 process_order_payment
--    (SECURITY DEFINER, Task 5에서 생성 예정) 경유만 허용해 가격/재고
--    조작을 방지한다. 관리자의 주문 상태 변경(F024)은 Task 011에서
--    별도 update 정책을 추가할 예정이다.
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

create policy "Users can view their own orders"
  on public.orders
  for select
  to authenticated
  using ((select auth.uid()) = user_id or public.is_admin());

create policy "Users can view their own order items"
  on public.order_items
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.orders o
      where o.id = order_id
        and (o.user_id = (select auth.uid()) or public.is_admin())
    )
  );

-- 4. updated_at 자동 갱신 트리거 (orders만 해당)
--    order_items는 불변 레코드이므로 트리거를 부착하지 않는다.
create trigger set_updated_at
  before update on public.orders
  for each row
  execute function extensions.moddatetime (updated_at);
