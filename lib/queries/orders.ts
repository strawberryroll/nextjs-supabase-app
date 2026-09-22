import { createClient } from "@/lib/supabase/server";
import type { Order, OrderItem } from "@/lib/types/commerce";

export type OrderWithItems = Order & {
  items: (OrderItem & {
    productName: string;
    productImageUrl: string | null;
  })[];
};

export type OrderRow = Omit<Order, "status"> & {
  status: Order["status"];
  order_items: (OrderItem & {
    products: { name: string; image_url: string | null } | null;
  })[];
};

// lib/queries/admin.ts의 getAllOrders()가 동일한 조인 구조를 재사용한다.
export function mapOrderRow(row: OrderRow): OrderWithItems {
  const { order_items, ...order } = row;
  return {
    ...order,
    items: order_items.map(({ products, ...item }) => ({
      ...item,
      productName: products?.name ?? "",
      productImageUrl: products?.image_url ?? null,
    })),
  };
}

// 본인 주문 조회 전용 — RLS(select: auth.uid() = user_id or is_admin())가
// 접근 제어를 담당하므로 별도 user_id 필터가 필요 없다. 캐시하지 않는다:
// 결제 직후 곧바로 조회되는 실시간성이 필요한 본인 데이터라 getProducts()의
// "use cache" 패턴과 달리 lib/queries/products.ts의 getProductsByIds()처럼
// 쿠키 의존 클라이언트를 그대로 사용한다.
export async function getMyOrders(): Promise<OrderWithItems[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*, products(name, image_url))")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map((row) => mapOrderRow(row as OrderRow));
}

export async function getOrderById(
  orderId: string,
): Promise<OrderWithItems | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*, products(name, image_url))")
    .eq("id", orderId)
    .maybeSingle();

  if (error) return null;
  return data ? mapOrderRow(data as OrderRow) : null;
}
