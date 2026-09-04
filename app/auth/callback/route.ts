import { getAuthErrorMessage } from "@/lib/auth/error-messages";
import { createClient } from "@/lib/supabase/server";
import { getSafeRedirectPath } from "@/lib/utils";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const next = getSafeRedirectPath(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();

    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      redirect(next);
    } else {
      redirect(
        `/auth/error?error=${encodeURIComponent(getAuthErrorMessage(error))}`,
      );
    }
  }

  redirect(
    `/auth/error?error=${encodeURIComponent("인증 코드가 제공되지 않았습니다")}`,
  );
}
