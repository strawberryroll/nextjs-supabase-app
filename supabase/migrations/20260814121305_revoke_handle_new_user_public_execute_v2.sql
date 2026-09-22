-- ============================================================================
-- Migration: revoke_handle_new_user_public_execute_v2
-- Purpose: 원격 프로젝트에 20260814031332(revoke_handle_new_user_public_execute_v2)
--          로 이미 적용된 변경을 로컬 마이그레이션 히스토리에 동기화한다.
--          이전 마이그레이션(20260814121304)의 revoke가 정상 반영되었는지
--          재확인하는 목적의 재실행이며, anon/authenticated의 실행 권한을
--          다시 한 번 명시적으로 제거해 최종 상태를 동일하게 유지한다.
-- ============================================================================

revoke execute on function public.handle_new_user() from public, anon, authenticated;
