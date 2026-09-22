-- ============================================================================
-- Migration: create_product_images_storage_bucket
-- Purpose: 상품 이미지 업로드용 Storage 버킷(product-images)을 생성한다.
--          public 버킷으로 만든다 — products 테이블처럼(select 공개) 상품
--          이미지는 고객도 볼 수 있어야 하므로 읽기는 누구나 가능하고,
--          쓰기(insert/update/delete)만 관리자로 제한한다. products 테이블의
--          기존 RLS 패턴(select anon+authenticated 공개, 쓰기는 is_admin())과
--          대칭되는 설계다.
-- ============================================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create policy "Public read product images"
  on storage.objects
  for select
  using (bucket_id = 'product-images');

create policy "Admins can upload product images"
  on storage.objects
  for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admins can update product images"
  on storage.objects
  for update
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin())
  with check (bucket_id = 'product-images' and public.is_admin());

create policy "Admins can delete product images"
  on storage.objects
  for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_admin());
