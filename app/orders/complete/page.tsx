import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteHeaderSkeleton } from "@/components/site-header-skeleton";
import { StatusBadge } from "@/components/status-badge";
import { Button } from "@/components/ui/button";
import { getOrderById } from "@/lib/queries/orders";
import { formatCurrencyKRW } from "@/lib/format";

export default function OrderCompletePage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  return (
    <>
      <Suspense fallback={<SiteHeaderSkeleton />}>
        <SiteHeader />
      </Suspense>
      <main className="mx-auto max-w-7xl p-5">
        <h1 className="text-2xl font-bold">주문완료</h1>
        <p className="text-muted-foreground mt-2">
          주문이 정상적으로 접수되었습니다.
        </p>
        <Suspense fallback={<OrderSummarySkeleton />}>
          <OrderSummary searchParams={searchParams} />
        </Suspense>
        <Button asChild className="mt-6">
          <Link href="/orders">주문내역 보기</Link>
        </Button>
      </main>
    </>
  );
}

async function OrderSummary({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;

  if (!orderId) {
    notFound();
  }

  // RLS(select: auth.uid() = user_id or is_admin())가 본인 주문이 아니면
  // 결과를 반환하지 않으므로, 타인 orderId로 접근해도 null이 되어 404 처리된다.
  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  return (
    <div className="mt-6 flex flex-col gap-4 rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <p className="font-semibold">{order.id}</p>
        <StatusBadge status={order.status} />
      </div>
      {order.items.map((item) => (
        <div key={item.id} className="flex justify-between text-sm">
          <span>
            {item.productName} x {item.quantity}
          </span>
          <span>{formatCurrencyKRW(item.unit_price * item.quantity)}</span>
        </div>
      ))}
      <div className="flex justify-between border-t pt-4 font-semibold">
        <span>합계</span>
        <span>{formatCurrencyKRW(order.total_amount)}</span>
      </div>
    </div>
  );
}

function OrderSummarySkeleton() {
  return (
    <div className="mt-6 flex flex-col gap-4 rounded-lg border p-4">
      <div className="bg-muted h-6 w-1/3 animate-pulse rounded" />
      <div className="bg-muted h-4 w-full animate-pulse rounded" />
      <div className="bg-muted h-4 w-full animate-pulse rounded" />
    </div>
  );
}
