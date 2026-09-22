-- ============================================================================
-- Migration: create_receive_purchase_order_function
-- Purpose: 관리자가 발주(purchase_orders)를 confirmed -> received로 전환할 때
--          products.stock_quantity 가산과 purchase_orders.status 변경을
--          하나의 트랜잭션으로 원자적으로 처리한다. 두 개의 별도 UPDATE로
--          나눠 처리하면 두 번째가 실패했을 때 재고만 가산되고 발주 상태는
--          confirmed로 남아, 관리자가 같은 발주를 다시 입고 처리하면 재고가
--          이중으로 가산되는 버그가 생길 수 있다.
--
--          process_order_payment(20260921100000)와 달리 이 함수는 호출자가
--          이미 admin임이 전제되므로(관리자 화면에서만 호출) SECURITY DEFINER가
--          아닌 SECURITY INVOKER로 최소 권한 원칙을 지킨다 — 함수 내부의
--          UPDATE들은 호출자 본인의 RLS를 그대로 적용받으므로, admin이 아닌
--          사용자가 호출하면 products/purchase_orders의 admin 전용 update
--          정책에 막혀 안전하게 실패한다.
-- ============================================================================

create function public.receive_purchase_order(p_purchase_order_id uuid)
returns void
language plpgsql
security invoker
set search_path = ''
as $$
declare
  v_product_id uuid;
  v_requested_quantity integer;
  v_status text;
begin
  select product_id, requested_quantity, status
    into v_product_id, v_requested_quantity, v_status
    from public.purchase_orders
   where id = p_purchase_order_id
   for update;

  if not found then
    raise exception '존재하지 않는 발주입니다: %', p_purchase_order_id;
  end if;

  if v_status != 'confirmed' then
    raise exception '확인(confirmed) 상태의 발주만 입고 처리할 수 있습니다: %', v_status;
  end if;

  update public.products
     set stock_quantity = stock_quantity + v_requested_quantity
   where id = v_product_id;

  update public.purchase_orders
     set status = 'received'
   where id = p_purchase_order_id;
end;
$$;

comment on function public.receive_purchase_order(uuid) is
  '발주 입고 처리. confirmed 상태의 발주를 received로 전환하며, '
  'products.stock_quantity에 requested_quantity를 원자적으로 가산한다. '
  'SECURITY INVOKER — 호출자(관리자)의 기존 RLS 권한을 그대로 사용한다.';

grant execute on function public.receive_purchase_order(uuid) to authenticated;
