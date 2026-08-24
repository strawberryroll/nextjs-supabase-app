import { SiteHeader } from "@/components/site-header";
import { CartView } from "@/components/cart-view";

// SiteHeader의 getClaims() 호출(cookies 접근)이 Suspense 없이 발생해 prerender가 막힌다.
// TODO(Phase 3): 실데이터 연동 시 "use cache"/<Suspense> 도입과 함께 재검토.
export const instant = false;

export default function CartPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl p-5">
        <h1 className="text-2xl font-bold">장바구니</h1>
        <CartView />
      </main>
    </>
  );
}
