-- ============================================================================
-- Migration: revoke_handle_new_user_public_execute
-- Purpose: public.handle_new_user()은 auth.users INSERT 트리거 전용 함수로,
--          PostgREST를 통해 anon/authenticated 롤이 직접 호출(RPC)할 수
--          없어야 한다. Supabase 보안 어드바이저 경고
--          (anon/authenticated_security_definer_function_executable) 해소.
-- ============================================================================

revoke execute on function public.handle_new_user() from public, anon, authenticated;
