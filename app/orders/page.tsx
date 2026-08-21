import { SiteHeader } from "@/components/site-header";
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
import { mockOrders } from "@/lib/mock/orders";
import { formatCurrencyKRW } from "@/lib/format";

// SiteHeader의 getClaims() 호출(cookies 접근)이 Suspense 없이 발생해 prerender가 막힌다.
// TODO(Phase 3): 실데이터 연동 시 "use cache"/<Suspense> 도입과 함께 재검토.
export const instant = false;

export default function OrdersPage() {
  // TODO(Phase 3 Task 010): 본인 주문 목록으로 교체(orders 테이블 조회)
  const orders = mockOrders;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl p-5">
        <h1 className="text-2xl font-bold">주문내역</h1>
        {orders.length === 0 ? (
          <div className="mt-6">
            <EmptyState title="주문 내역이 없습니다" />
          </div>
        ) : (
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
                      {new Date(order.createdAt).toLocaleDateString("ko-KR")}
                    </TableCell>
                    <TableCell>
                      {formatCurrencyKRW(order.totalAmount)}
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </main>
    </>
  );
}
