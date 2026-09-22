import { createClient } from "@/lib/supabase/server";
import {
  mapOrderRow,
  type OrderRow,
  type OrderWithItems,
} from "@/lib/queries/orders";
import type { PurchaseOrder, PurchaseOrderStatus } from "@/lib/types/commerce";

export type DashboardSummary = {
  totalRevenue: number;
  orderCount: number;
  lowStockCount: number;
};

// admin 전용 집계 — 캐시하지 않는다: 관리자는 등록/결제 직후 최신 상태를
// 곧바로 봐야 하므로 lib/queries/orders.ts와 동일하게 쿠키 의존 클라이언트를
// 그대로 사용한다. process_order_payment가 orders를 항상 status='paid'로
// 생성해 pending_payment 주문이 실질적으로 존재하지 않으므로, 매출 합계는
// 상태 필터 없이 전체 주문을 합산한다(기존 mock 대시보드와 동일한 집계 방식).
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = await createClient();

  const [ordersResult, lowStockResult] = await Promise.all([
    supabase.from("orders").select("total_amount"),
    supabase.from("products").select("id, stock_quantity, threshold"),
  ]);

  if (ordersResult.error) throw ordersResult.error;
  if (lowStockResult.error) throw lowStockResult.error;

  const orders = ordersResult.data ?? [];
  const totalRevenue = orders.reduce(
    (sum, order) => sum + order.total_amount,
    0,
  );
  const orderCount = orders.length;
  const lowStockCount = (lowStockResult.data ?? []).filter(
    (product) => product.stock_quantity < product.threshold,
  ).length;

  return { totalRevenue, orderCount, lowStockCount };
}

// 관리자 전용 — RLS(select: auth.uid() = user_id or is_admin())가 admin
// 호출자에게 전체 주문을 반환하므로 user_id 필터가 필요 없다.
export async function getAllOrders(): Promise<OrderWithItems[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*, products(name, image_url))")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapOrderRow(row as OrderRow));
}

export type PurchaseOrderWithProduct = PurchaseOrder & {
  productName: string;
};

export async function getAllPurchaseOrders(
  status?: PurchaseOrderStatus,
): Promise<PurchaseOrderWithProduct[]> {
  const supabase = await createClient();
  let query = supabase
    .from("purchase_orders")
    .select("*, products(name)")
    .order("created_at", { ascending: false });

  if (status) {
    query = query.eq("status", status);
  }

  const { data, error } = await query;
  if (error) throw error;

  return (data ?? []).map(({ products, ...purchaseOrder }) => ({
    ...purchaseOrder,
    productName: products?.name ?? "",
  })) as PurchaseOrderWithProduct[];
}
