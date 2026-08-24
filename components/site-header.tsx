import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "@/components/logout-button";

export async function SiteHeader() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims;

  return (
    <header className="border-b-foreground/10 flex h-16 w-full justify-center border-b">
      <div className="flex w-full max-w-7xl items-center justify-between p-3 px-5 text-sm">
        <Link href="/" className="text-lg font-semibold">
          원두산책
        </Link>
        <nav className="flex items-center gap-5">
          {!user ? (
            <>
              <Link href="/auth/login">로그인</Link>
              <Link href="/auth/sign-up">회원가입</Link>
            </>
          ) : (
            <>
              <Link href="/cart">장바구니</Link>
              <Link href="/orders">주문내역</Link>
              {/* TODO(Phase 3 Task 009): profiles.role === 'admin' 이면 관리자 대시보드/상품 관리/주문 관리/발주 관리 메뉴 노출 */}
              <LogoutButton />
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
