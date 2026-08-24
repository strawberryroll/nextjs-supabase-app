import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { mockOrders } from "@/lib/mock/orders";
import { formatCurrencyKRW } from "@/lib/format";

// SiteHeader의 getClaims() 호출(cookies 접근)이 Suspense 없이 발생해 prerender가 막힌다.
// TODO(Phase 3): 실데이터 연동 시 "use cache"/<Suspense> 도입과 함께 재검토.
export const instant = false;

export default function OrderCompletePage() {
  // TODO(Phase 3 Task 010): 결제 승인 직후 생성된 실제 주문으로 교체
  const order = mockOrders[0];

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-7xl p-5">
        <h1 className="text-2xl font-bold">주문완료</h1>
        <p className="text-muted-foreground mt-2">
          주문이 정상적으로 접수되었습니다.
        </p>
        <div className="mt-6 flex flex-col gap-4 rounded-lg border p-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold">{order.id}</p>
            <StatusBadge status={order.status} />
          </div>
          {order.items.map((item) => (
            <div key={item.productId} className="flex justify-between text-sm">
              <span>
                {item.productName} x {item.quantity}
              </span>
              <span>{formatCurrencyKRW(item.unitPrice * item.quantity)}</span>
            </div>
          ))}
          <div className="flex justify-between border-t pt-4 font-semibold">
            <span>합계</span>
            <span>{formatCurrencyKRW(order.totalAmount)}</span>
          </div>
        </div>
        <Button asChild className="mt-6">
          <Link href="/orders">주문내역 보기</Link>
        </Button>
      </main>
    </>
  );
}
