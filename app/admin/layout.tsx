import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { SiteHeader } from "@/components/site-header";

// requireAdmin()의 cookies() 접근이 Suspense 없이 발생해 prerender가 막힌다.
// TODO(Phase 3): 실데이터 연동 시 "use cache"/<Suspense> 도입과 함께 재검토.
export const instant = false;

const ADMIN_NAV_ITEMS = [
  { href: "/admin", label: "대시보드" },
  { href: "/admin/products", label: "상품 관리" },
  { href: "/admin/orders", label: "주문 관리" },
  { href: "/admin/purchase-orders", label: "발주 관리" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <>
      <SiteHeader />
      <div className="bg-yellow-100 p-2 text-center text-sm text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100">
        ⚠️ 임시: 관리자 role 체크 미구현 (Phase 3 Task 009에서 교체 예정).
        현재는 로그인한 모든 사용자가 접근 가능합니다.
      </div>
      <nav className="border-b">
        <div className="mx-auto flex max-w-5xl gap-4 overflow-x-auto p-5 pb-0">
          {ADMIN_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-muted-foreground hover:text-foreground pb-3 text-sm font-medium whitespace-nowrap"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </nav>
      <main className="mx-auto max-w-5xl p-5">{children}</main>
    </>
  );
}
