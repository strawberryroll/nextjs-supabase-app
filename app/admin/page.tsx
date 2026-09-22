import { Suspense } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardSummary } from "@/lib/queries/admin";
import { formatCurrencyKRW } from "@/lib/format";

export default function AdminDashboardPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">관리자 대시보드</h1>
      <Suspense fallback={<DashboardSummarySkeleton />}>
        <DashboardSummary />
      </Suspense>
    </>
  );
}

async function DashboardSummary() {
  const { totalRevenue, orderCount, lowStockCount } =
    await getDashboardSummary();

  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">매출 합계</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">
            {formatCurrencyKRW(totalRevenue)}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">주문 건수</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{orderCount}건</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">재고부족 상품</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{lowStockCount}건</p>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSummarySkeleton() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
      {[0, 1, 2].map((i) => (
        <Card key={i}>
          <CardHeader>
            <div className="bg-muted h-4 w-20 animate-pulse rounded" />
          </CardHeader>
          <CardContent>
            <div className="bg-muted h-8 w-24 animate-pulse rounded" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
