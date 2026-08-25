-- ============================================================================
-- Migration: create_purchase_orders_table
-- Purpose: 커머스 스키마(원두산책)의 재입고 발주 테이블 public.purchase_orders 생성.
--          상품 재고가 threshold 이하로 떨어졌을 때의 재입고 요청을 추적하며,
--          클라이언트가 직접 insert할 수 없고 process_order_payment(Task 5,
--          SECURITY DEFINER)가 결제 처리 중 재고 부족을 감지했을 때만 자동
--          생성한다. status 변경(pending→confirmed→received)은 admin 전용
--          UPDATE로 수행하며, 이 마이그레이션은 그 관리자 화면이 사용할 select/
--          update 정책까지만 정의한다(실제 상태 전이 로직은 Task 011 범위).
-- ============================================================================

-- 1. purchase_orders 테이블
create table public.purchase_orders (
  id uuid not null primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id),
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'received')),
  requested_quantity integer not null check (requested_quantity > 0),
  created_at timestamptz not null default now()
);

comment on table public.purchase_orders is
  '재입고 발주 요청. process_order_payment(SECURITY DEFINER)가 결제 처리 중 '
  '재고가 threshold 이하로 떨어진 상품을 감지했을 때만 자동 생성하며, 클라이언트의 '
  '직접 insert는 허용하지 않는다(아래 4번 참고). status는 pending(요청됨) → '
  'confirmed(발주 확정) → received(입고 완료) 순으로 관리자가 수동 전이시킨다.';

-- 2. 부분 유니크 인덱스: 동일 상품에 대한 중복 발주 방지
--    동일 상품에 대해 진행 중인(pending/confirmed) 발주가 이미 있으면 재발주할 수
--    없다. received는 인덱스 조건(where status in ('pending','confirmed')) 밖에
--    있으므로 발주가 완료된 이후에는 같은 상품을 다시 발주할 수 있다.
--    이 제약은 애플리케이션 레벨 체크(예: "발주 전 기존 pending 여부 조회 후 insert")
--    만으로는 동시 결제 요청 두 건이 동시에 재고 부족을 감지해 각각 발주를 만드는
--    race condition을 막을 수 없다 — 부분 유니크 인덱스로 DB 레벨에서 원천 차단한다.
create unique index purchase_orders_product_open_key
  on public.purchase_orders (product_id)
  where status in ('pending', 'confirmed');

-- 3. RLS 활성화 및 정책
alter table public.purchase_orders enable row level security;

create policy "Admins can view purchase orders"
  on public.purchase_orders
  for select
  to authenticated
  using (public.is_admin());

create policy "Admins can update purchase orders"
  on public.purchase_orders
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- 4. insert 정책 없음
--    purchase_orders는 process_order_payment(SECURITY DEFINER, Task 5)에서만
--    자동으로 생성된다. SECURITY DEFINER 함수는 RLS를 우회해 실행되므로 별도의
--    insert 정책이 필요 없으며, 의도적으로 정책을 만들지 않음으로써 admin을
--    포함한 그 누구도 PostgREST를 통한 직접 insert를 할 수 없도록 막는다
--    (delete 정책도 동일한 이유로 두지 않는다).
