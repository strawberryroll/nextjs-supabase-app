import Link from "next/link";
import { requireAdmin } from "@/lib/auth/require-admin";
import { SiteHeader } from "@/components/site-header";

// requireAdmin()이 인증 실패 시 redirect()를 호출하며, redirect()는 Suspense나
// "use cache: private" 스코프에서 사용할 수 없어 이 layout 자체가 블로킹될
// 수밖에 없다(cart/checkout/orders 등 다른 곳은 SiteHeader만 Suspense로
// 감싸는 것으로 충분해 instant=false 없이도 통과함 — admin/layout은 구조가 다름).
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
      <nav className="border-b">
        <div className="mx-auto flex max-w-7xl gap-4 overflow-x-auto p-5 pb-0">
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
      <main className="mx-auto max-w-7xl p-5">{children}</main>
    </>
  );
}
