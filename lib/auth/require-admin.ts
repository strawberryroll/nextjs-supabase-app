import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// profiles.role 컬럼이 아직 DB에 없어 role 검증을 할 수 없다.
// TODO(Phase 3 Task 009): profiles.role = 'admin' 검증 추가 예정. 현재는 로그인 여부만 확인.
export async function requireAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return data.claims;
}
