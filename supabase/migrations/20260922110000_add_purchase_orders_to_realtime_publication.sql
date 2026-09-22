-- ============================================================================
-- Migration: add_purchase_orders_to_realtime_publication
-- Purpose: 관리자 발주 목록(app/admin/purchase-orders)의 실시간 갱신을 위해
--          purchase_orders 테이블을 supabase_realtime publication에 추가한다.
--          (pg_publication_tables 조회 결과 현재 이 publication에는 어떤
--          테이블도 포함되어 있지 않음을 확인했다 — 이 마이그레이션 없이는
--          클라이언트가 채널을 구독해도 이벤트가 전혀 전달되지 않는다.)
-- ============================================================================

alter publication supabase_realtime add table public.purchase_orders;
