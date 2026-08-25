-- ============================================================================
-- Migration: create_products_table
-- Purpose: 커머스 스키마(원두산책)의 상품 카탈로그 테이블 public.products 생성.
--          가격/재고/재입고 임계값을 관리하며, 재고 관리는 이번 마이그레이션의
--          범위 밖(주문/입고 처리는 Task 3~5의 orders/order_items/
--          purchase_orders 및 process_order_payment에서 다룬다).
--          상품 조회는 비로그인 사용자에게도 공개하고, 등록/수정/삭제는
--          20260825120000_add_profiles_role.sql에서 생성한 public.is_admin()을
--          재사용해 admin 전용으로 제한한다.
-- ============================================================================

-- 1. products 테이블
create table public.products (
  id uuid not null primary key default gen_random_uuid(),
  name text not null,
  price integer not null check (price >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  threshold integer not null default 0 check (threshold >= 0),
  description text,
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.products is
  '판매 상품 카탈로그(원두/원두용품). price 단위는 원(KRW), 소수점 없는 정수. '
  'threshold는 재입고 알림 기준 재고 수량으로, stock_quantity가 이 값 이하로 '
  '떨어지면 관리자 화면에서 재입고 필요 상품으로 표시하는 데 사용한다.';

-- 2. RLS 활성화 및 정책
alter table public.products enable row level security;

create policy "Public products are viewable by everyone"
  on public.products
  for select
  to anon, authenticated
  using (true);

create policy "Admins can insert products"
  on public.products
  for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update products"
  on public.products
  for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete products"
  on public.products
  for delete
  to authenticated
  using (public.is_admin());

-- 3. updated_at 자동 갱신 트리거
create extension if not exists moddatetime schema extensions;

create trigger set_updated_at
  before update on public.products
  for each row
  execute function extensions.moddatetime (updated_at);
