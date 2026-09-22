-- ============================================================================
-- Migration: add_orders_admin_update_policy
-- Purpose: 20260825120200_create_orders_and_order_items_tables.sql은 orders에
--          select 정책만 생성하고, "관리자의 주문 상태 변경(F024)은 Task 011에서
--          별도 update 정책을 추가할 예정"이라는 주석을 남겨두었다. 이 마이그레이션이
--          그 update 정책을 추가한다 — 관리자가 주문 상태(orders.status)를
--          pending_payment -> paid -> preparing -> shipping -> delivered
--          순서로 전이시킬 수 있어야 하기 때문이다.
--
--          products/purchase_orders의 기존 admin update 정책과 동일하게
--          using/with check 모두 is_admin()으로 제한한다.
-- ============================================================================

create policy "Admins can update orders"
  on public.orders
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
