-- ============================================================================
-- Migration: create_profiles_table
-- Purpose: 회원가입 사용자의 프로필 정보(username, full_name, avatar_url)를
--          저장하는 public.profiles 테이블 생성.
--          auth.users에 새 유저가 INSERT될 때 트리거로 자동 프로필 row 생성.
-- ============================================================================

-- 1. profiles 테이블
create table public.profiles (
  id uuid not null primary key references auth.users (id) on delete cascade,
  username text,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint username_length check (
    username is null or char_length(username) between 3 and 30
  ),
  constraint username_format check (
    username is null or username ~ '^[a-zA-Z0-9_]+$'
  )
);

comment on table public.profiles is
  '회원가입 사용자의 공개 프로필 정보. auth.users와 1:1 관계.';

-- username 대소문자 무관 유니크 제약 (미설정 유저는 여러 명 허용)
create unique index profiles_username_key
  on public.profiles (lower(username))
  where username is not null;

-- 2. RLS 활성화 및 정책
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles
  for select
  to anon, authenticated
  using (true);

create policy "Users can insert their own profile"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- 3. updated_at 자동 갱신 트리거
create extension if not exists moddatetime schema extensions;

create trigger set_updated_at
  before update on public.profiles
  for each row
  execute function extensions.moddatetime (updated_at);

-- 4. auth.users INSERT 시 profiles row 자동 생성
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

comment on function public.handle_new_user() is
  'auth.users 신규 유저 삽입 시 public.profiles row 자동 생성. '
  'username은 회원가입 시점에 미수집이므로 채우지 않음(추후 프로필 편집에서 설정).';

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
