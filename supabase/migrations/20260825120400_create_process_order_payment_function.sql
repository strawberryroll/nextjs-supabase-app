-- ============================================================================
-- Migration: create_process_order_payment_function
-- Purpose: 커머스 스키마(원두산책)의 결제 처리 트랜잭션 함수
--          public.process_order_payment의 시그니처와 SECURITY DEFINER/권한
--          설정을 확정한다. 본문은 이번 마이그레이션에서는 스텁(예외 발생)으로
--          두고, 실제 구현은 Task 010에서 진행한다 — 아래 pseudocode 주석이
--          그 실제 구현자를 위한 상세 설계 문서 역할을 겸한다.
--
--          orders/order_items(20260825120200)와 purchase_orders
--          (20260825120300)는 insert/update RLS 정책을 두지 않으므로, 이
--          SECURITY DEFINER 함수만이 두 테이블에 쓸 수 있는 유일한 경로다.
--          이를 통해 클라이언트가 가격(total_amount/unit_price)이나 재고
--          수량을 직접 조작하는 것을 원천 차단한다.
-- ============================================================================

-- 1. process_order_payment() 함수 시그니처 + 스텁 본문
--    plpgsql을 사용하는 이유: is_admin()과 달리 이 함수는 for update 잠금,
--    조건 분기, 다중 insert/update로 구성된 트랜잭션 절차를 수행해야 하므로
--    단일 SELECT로 표현 가능한 sql language로는 작성할 수 없다.
--    security definer + set search_path = '' 조합은 이 함수가 호출자(RLS로
--    쓰기가 막힌 authenticated 사용자) 대신 orders/order_items/products/
--    purchase_orders에 쓰기 작업을 수행할 수 있게 하면서도, 검색 경로 조작으로
--    의도치 않은 스키마의 동명 객체가 실행되는 것을 방지한다.
create function public.process_order_payment(
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
begin
  -- Task 010에서 실제 구현 예정. 아래는 그 구현자가 그대로 따라 작성할 수 있는
  -- 실제 트랜잭션 절차의 pseudocode다. 함수 전체가 단일 호출로 완결되는 한
  -- PL/pgSQL 함수 본문은 이미 하나의 트랜잭션으로 실행되므로 별도의
  -- begin/commit 없이도 아래 단계 중 하나라도 실패(exception)하면 전체가
  -- 롤백된다.
  --
  -- 1. p_items(jsonb 배열, 각 원소는 {"product_id": uuid, "quantity": int})를
  --    jsonb_to_recordset() 또는 jsonb_array_elements()로 순회하면서,
  --    각 product_id로 public.products row를 `select ... for update`로
  --    잠금 조회한다. for update로 잠가야 동시에 들어온 다른 결제 요청이
  --    같은 상품의 stock_quantity를 동시에 읽어 재고를 초과 판매하는
  --    race condition을 막을 수 있다.
  --
  -- 2. 클라이언트가 p_items에 함께 보낸 가격은 절대 신뢰하지 않는다(가격
  --    조작 방지). 1번에서 for update로 잠가 조회한 products.price를
  --    유일한 근거로 삼아, 각 라인의 subtotal = products.price * quantity를
  --    계산하고 이를 합산해 총 결제 금액(total_amount)을 서버에서 재계산한다.
  --
  -- 3. 1번에서 조회한 products 중 stock_quantity < quantity인 상품이 하나라도
  --    있으면 즉시 raise exception으로 재고 부족을 알리고 전체 트랜잭션을
  --    중단한다(errcode 세분화는 이번 스텁 단계에서는 과설계이므로 생략하고
  --    Task 010에서 필요 시 구체화한다).
  --
  -- 4. public.orders에 헤더 row를 insert한다:
  --    user_id = p_user_id, status = 'paid',
  --    total_amount = 2번에서 재계산한 합계, payment_key = p_payment_key,
  --    recipient = p_recipient, address = p_address, phone = p_phone.
  --    insert된 row의 id를 order_id로 확보한다.
  --
  -- 5. p_items의 각 라인에 대해 public.order_items를 insert한다:
  --    order_id = 4번에서 확보한 id, product_id, quantity,
  --    unit_price = 1번에서 조회한 해당 상품의 products.price(클라이언트
  --    입력이 아닌 서버 조회값).
  --
  -- 6. p_items의 각 상품에 대해 public.products.stock_quantity를
  --    quantity만큼 차감한다(update ... set stock_quantity = stock_quantity -
  --    quantity). 1번에서 이미 for update로 잠근 row이므로 안전하게 갱신할
  --    수 있다.
  --
  -- 7. 6번의 차감 결과 stock_quantity < threshold가 된 상품이 있으면, 해당
  --    product_id에 대해
  --      insert into public.purchase_orders (product_id, requested_quantity)
  --      values (...)
  --      on conflict (product_id) where status in ('pending', 'confirmed')
  --      do nothing;
  --    로 자동 발주한다. on conflict 타겟은
  --    20260825120300_create_purchase_orders_table.sql에서 생성한 부분
  --    유니크 인덱스 purchase_orders_product_open_key를 그대로 사용하며,
  --    이미 진행 중(pending/confirmed)인 발주가 있으면 조용히 무시해
  --    중복 발주를 만들지 않는다. requested_quantity 값의 산정 기준(예:
  --    threshold - stock_quantity만큼 vs 고정 재입고 수량)은 Task 010에서
  --    결정한다.
  --
  -- 8. order_id(4번), total_amount(2번)를 반환한다(return next 또는
  --    return query).
  raise exception '아직 구현되지 않음(Task 010)';
end;
$$;

comment on function public.process_order_payment(uuid, jsonb, text, text, text, text) is
  '결제 처리 트랜잭션. p_items(jsonb 배열, 각 원소 {product_id, quantity})의 '
  '각 상품을 for update로 잠금 조회해 서버 가격으로 금액을 재계산하고(클라이언트 '
  '가격 조작 방지), 재고 부족 시 예외를 발생시키며, orders/order_items를 '
  'insert하고 products.stock_quantity를 차감한 뒤, threshold 미만으로 떨어진 '
  '상품은 purchase_orders에 자동 발주한다. orders/order_items/purchase_orders에 '
  '쓸 수 있는 유일한 경로(SECURITY DEFINER)이며, 현재는 스텁으로 항상 예외를 '
  '발생시킨다 — 실제 구현은 Task 010에서 진행한다.';

-- 2. 실행 권한 설정
--    handle_new_user()(20260814121304)는 auth.users INSERT 트리거 전용이라
--    PostgREST RPC로 호출될 필요가 전혀 없어 public/anon/authenticated 모두에서
--    전체 revoke했다. 반면 이 함수는 클라이언트(로그인한 구매자)가 결제 시점에
--    supabase.rpc('process_order_payment', ...)로 직접 호출해야 하므로, anon만
--    차단하고 authenticated에는 실행 권한을 부여한다 — 이 grant to authenticated
--    한 줄이 handle_new_user()의 전체 revoke 패턴과의 핵심 차이다.
revoke execute on function public.process_order_payment(uuid, jsonb, text, text, text, text) from public, anon;

grant execute on function public.process_order_payment(uuid, jsonb, text, text, text, text) to authenticated;
