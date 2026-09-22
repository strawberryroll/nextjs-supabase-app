-- ============================================================================
-- Migration: add_performance_indexes
-- Purpose: mcp__supabase__get_advisors(performance)가 실측한 미인덱싱 외래키
--          3건(order_items.order_id, order_items.product_id, orders.user_id)과
--          자주 쓰이는 조회 패턴(본인 주문 목록의 user_id+created_at 정렬,
--          발주 상태별 필터링)을 위한 인덱스를 추가한다.
-- ============================================================================

create index if not exists idx_order_items_order_id on public.order_items (order_id);
create index if not exists idx_order_items_product_id on public.order_items (product_id);
create index if not exists idx_orders_user_id_created_at on public.orders (user_id, created_at desc);
create index if not exists idx_purchase_orders_status on public.purchase_orders (status);
