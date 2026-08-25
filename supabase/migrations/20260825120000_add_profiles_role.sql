-- ============================================================================
-- Migration: add_profiles_role
-- Purpose: 커머스 스키마(원두산책) 도입을 위해 profiles에 role 컬럼을 추가하고,
--          이후 products/orders/order_items/purchase_orders의 admin 전용 RLS
--          정책에서 공통으로 재사용할 public.is_admin() 헬퍼 함수를 신설한다.
--          아울러 기존 "Users can update their own profile" 정책을 재생성하여
--          사용자가 본인 프로필 UPDATE로 role을 셀프 승격하지 못하도록 막는다.
-- ============================================================================

-- 1. profiles.role 컬럼 추가
alter table public.profiles
  add column role text not null default 'customer'
  check (role in ('admin', 'customer'));

comment on column public.profiles.role is
  '사용자 권한 구분(admin/customer). 기본값 customer. '
  '최초 admin 지정은 시드 데이터로, 이후 변경은 대시보드/서버 스크립트로만 수행한다 '
  '(클라이언트 UPDATE로는 셀프 승격이 불가능하도록 아래 정책에서 차단).';

-- 2. is_admin() 헬퍼 함수
--    단순 단일 SELECT이므로 plpgsql이 아닌 sql language를 사용한다.
--    security invoker + stable + set search_path = '' 조합으로
--    호출자의 RLS 권한 범위 내에서만 동작하며, 검색 경로 조작에 안전하다.
--    products/orders/order_items/purchase_orders의 admin 전용 RLS 정책에서
--    반복 재사용되어 중복 서브쿼리를 제거하는 공통 헬퍼다.
create function public.is_admin()
returns boolean
language sql
security invoker
stable
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

comment on function public.is_admin() is
  '현재 인증된 사용자(auth.uid())의 profiles.role이 admin인지 여부를 반환. '
  'products/orders/order_items/purchase_orders 등 admin 전용 RLS 정책에서 재사용하는 공통 헬퍼.';

-- 3. "Users can update their own profile" 정책 재생성
--    role 컬럼 추가 이전에는 본인 소유(auth.uid() = id) 여부만 확인하면 충분했으나,
--    role이 추가된 지금은 그 조건만으로는 사용자가 UPDATE 문으로 자신의 role을
--    'admin'으로 셀프 승격할 수 있다. 기존 정책은 DROP 후 재생성 외에는 이
--    with check 조건을 안전하게 덧붙일 방법이 없어(ALTER POLICY는 using/with check
--    전체를 새로 지정해야 함) 이번이 이 저장소 최초의 DROP POLICY 선례가 된다.
--
--    with check에 추가한 `role = (select p.role from public.profiles p
--    where p.id = (select auth.uid()))` 조건은 PostgreSQL의 MVCC 특성을 이용한다:
--    UPDATE 문 실행 중 with check 내부의 서브쿼리는 해당 트랜잭션이 시작된 시점의
--    스냅샷(= UPDATE 이전의 OLD row)을 참조하므로, 여기서 조회되는 role은 항상
--    "갱신 전 값"이다. 따라서 이 조건은 실질적으로 "새 role 값이 갱신 전 role 값과
--    같아야 한다"는 의미가 되어, role을 변경하는 UPDATE는 with check에서 거부된다.
--
--    최초 admin 지정은 Task 007의 시드 데이터로 수행하고, 이후 role 변경은
--    Supabase 대시보드 또는 service_role 키를 사용하는 서버 스크립트로만
--    수행한다(둘 다 RLS를 우회하므로 이 정책의 영향을 받지 않는다).
drop policy "Users can update their own profile" on public.profiles;

create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check (
    (select auth.uid()) = id
    and role = (
      select p.role
      from public.profiles p
      where p.id = (select auth.uid())
    )
  );
