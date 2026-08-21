import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { mockOrders } from "@/lib/mock/orders";
import { mockProducts } from "@/lib/mock/products";
import { formatCurrencyKRW } from "@/lib/format";

// TODO(Phase 3): 실데이터 연동 시 Suspense 경계 고려
export default function AdminDashboardPage() {
  const totalRevenue = mockOrders.reduce(
    (sum, order) => sum + order.totalAmount,
    0,
  );
  const orderCount = mockOrders.length;
  const lowStockCount = mockProducts.filter(
    (product) => product.stockQuantity < product.threshold,
  ).length;

  return (
    <>
      <h1 className="text-2xl font-bold">관리자 대시보드</h1>
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
    </>
  );
}
