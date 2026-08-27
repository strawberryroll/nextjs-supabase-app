import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

/**
 * "use cache" 함수 전용 클라이언트. Next.js 16 Cache Components는 캐시 스코프
 * 안에서 cookies()/headers() 접근을 완전히 금지하므로(next-request-in-use-cache
 * 에러), 세션 쿠키를 읽는 lib/supabase/server.ts의 createClient()는 여기서 쓸 수
 * 없다. RLS로 공개 select가 허용된 테이블(products 등)을 캐시 대상으로 조회할
 * 때만 이 클라이언트를 사용한다 — 인증이 필요한 조회에는 사용하지 않는다.
 */
export function createCachedClient() {
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
