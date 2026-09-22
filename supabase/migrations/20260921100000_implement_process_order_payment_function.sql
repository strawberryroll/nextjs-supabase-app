-- ============================================================================
-- Migration: implement_process_order_payment_function
-- Purpose: 20260825120400에서 스텁(raise exception)으로 남겨둔
--          public.process_order_payment()의 실제 구현. 해당 마이그레이션의
--          8단계 pseudocode 주석을 그대로 따른다. 함수 시그니처, SECURITY
--          DEFINER, search_path, 권한(anon revoke / authenticated grant)은
--          변경하지 않는다.
--
--          requested_quantity 산정 기준: threshold - stock_quantity(차감 후
--          재고를 정확히 임계치까지 채우는 최소 발주량). 재고 소진을 놓치지
--          않는다는 로드맵 목표에 맞춰 가장 방어적인 규칙을 택했다.
-- ============================================================================

create or replace function public.process_order_payment(
  p_user_id uuid,
  p_items jsonb,
  p_payment_key text,
  p_recipient text,
  p_address text,
  p_phone text
)
returns table (order_id uuid, total_amount integer)
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order_id uuid;
  v_total_amount integer := 0;
  v_product record;
  v_item record;
begin
  -- 1. products를 product_id 오름차순으로 정렬해 select ... for update로
  --    잠금 조회한다. 정렬된 순서로 잠가야 서로 다른 결제 요청이 여러 상품을
  --    반대 순서로 잠그면서 발생하는 데드락을 예방할 수 있다.
  --    동시에 재고 부족 여부도 이 루프에서 함께 확인한다.
  for v_item in
    select (elem->>'product_id')::uuid as product_id,
           (elem->>'quantity')::integer as quantity
    from jsonb_array_elements(p_items) as elem
    order by (elem->>'product_id')::uuid
  loop
    select id, price, stock_quantity, threshold, name
      into v_product
      from public.products
     where id = v_item.product_id
     for update;

    if not found then
      raise exception '존재하지 않는 상품입니다: %', v_item.product_id;
    end if;

    -- 2. 클라이언트가 보낸 가격은 신뢰하지 않고, for update로 잠가 조회한
    --    products.price만을 근거로 총 결제 금액을 서버에서 재계산한다.
    v_total_amount := v_total_amount + v_product.price * v_item.quantity;

    -- 3. 재고 부족 시 즉시 예외를 발생시켜 전체 트랜잭션을 중단한다.
    if v_product.stock_quantity < v_item.quantity then
      raise exception '재고가 부족합니다: %', v_product.name;
    end if;
  end loop;

  -- 4. orders 헤더를 insert한다.
  insert into public.orders (user_id, status, total_amount, payment_key, recipient, address, phone)
  values (p_user_id, 'paid', v_total_amount, p_payment_key, p_recipient, p_address, p_phone)
  returning id into v_order_id;

  -- 5~7. 각 라인에 대해 order_items를 insert하고, products.stock_quantity를
  --      차감한 뒤, 차감 결과 threshold 미만이 된 상품은 자동 발주한다.
  for v_item in
    select (elem->>'product_id')::uuid as product_id,
           (elem->>'quantity')::integer as quantity
    from jsonb_array_elements(p_items) as elem
  loop
    select price, stock_quantity, threshold
      into v_product
      from public.products
     where id = v_item.product_id;

    insert into public.order_items (order_id, product_id, quantity, unit_price)
    values (v_order_id, v_item.product_id, v_item.quantity, v_product.price);

    update public.products
       set stock_quantity = stock_quantity - v_item.quantity
     where id = v_item.product_id
    returning stock_quantity, threshold into v_product.stock_quantity, v_product.threshold;

    if v_product.stock_quantity < v_product.threshold then
      insert into public.purchase_orders (product_id, requested_quantity)
      values (v_item.product_id, v_product.threshold - v_product.stock_quantity)
      on conflict (product_id) where status in ('pending', 'confirmed')
      do nothing;
    end if;
  end loop;

  -- 8. order_id, total_amount를 반환한다.
  return query select v_order_id, v_total_amount;
end;
$$;

comment on function public.process_order_payment(uuid, jsonb, text, text, text, text) is
  '결제 처리 트랜잭션. p_items(jsonb 배열, 각 원소 {product_id, quantity})의 '
  '각 상품을 for update로 잠금 조회해 서버 가격으로 금액을 재계산하고(클라이언트 '
  '가격 조작 방지), 재고 부족 시 예외를 발생시키며, orders/order_items를 '
  'insert하고 products.stock_quantity를 차감한 뒤, threshold 미만으로 떨어진 '
  '상품은 requested_quantity=threshold-stock_quantity로 purchase_orders에 '
  '자동 발주한다(이미 pending/confirmed 발주가 있으면 무시). '
  'orders/order_items/purchase_orders에 쓸 수 있는 유일한 경로(SECURITY DEFINER)다.';
