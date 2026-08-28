import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

// require-admin.ts와 site-header.tsx가 동일한 role 조회 로직을 공유하도록
// 분리한 순수 조회 함수. profiles select RLS가 공개(anon/authenticated 모두
// 허용)이므로 별도 권한 이슈 없이 어떤 컨텍스트에서든 호출 가능하다.
export async function getCurrentUserRole(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<string | null> {
  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  return data?.role ?? null;
}

export async function requireAdmin() {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  const role = await getCurrentUserRole(supabase, data.claims.sub);

  if (role !== "admin") {
    redirect("/");
  }

  return data.claims;
}
