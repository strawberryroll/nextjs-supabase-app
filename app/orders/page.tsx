import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteHeaderSkeleton } from "@/components/site-header-skeleton";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getMyOrders } from "@/lib/queries/orders";
import { formatCurrencyKRW } from "@/lib/format";

export default function OrdersPage() {
  return (
    <>
      <Suspense fallback={<SiteHeaderSkeleton />}>
        <SiteHeader />
      </Suspense>
      <main className="mx-auto max-w-7xl p-5">
        <h1 className="text-2xl font-bold">주문내역</h1>
        <Suspense fallback={<OrdersTableSkeleton />}>
          <OrdersTable />
        </Suspense>
      </main>
    </>
  );
}

async function OrdersTable() {
  const orders = await getMyOrders();

  if (orders.length === 0) {
    return (
      <div className="mt-6">
        <EmptyState title="주문 내역이 없습니다" />
      </div>
    );
  }

  return (
    <div className="mt-6 overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>주문번호</TableHead>
            <TableHead>주문일시</TableHead>
            <TableHead>합계</TableHead>
            <TableHead>상태</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell>{order.id}</TableCell>
              <TableCell>
                {new Date(order.created_at).toLocaleDateString("ko-KR")}
              </TableCell>
              <TableCell>{formatCurrencyKRW(order.total_amount)}</TableCell>
              <TableCell>
                <StatusBadge status={order.status} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function OrdersTableSkeleton() {
  return (
    <div className="mt-6 flex flex-col gap-2">
      <div className="bg-muted h-10 w-full animate-pulse rounded" />
      <div className="bg-muted h-10 w-full animate-pulse rounded" />
      <div className="bg-muted h-10 w-full animate-pulse rounded" />
    </div>
  );
}
