"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";

// mcp__supabase__query_logs의 postgres_logs로 실패를 사후 조사할 수 있으나,
// Next.js 서버 콘솔은 수집하지 않아 여기서도 남긴다.
export async function confirmPurchaseOrder(id: string) {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase
    .from("purchase_orders")
    .update({ status: "confirmed" })
    .eq("id", id)
    .eq("status", "pending");

  if (error) {
    console.error("[purchase-order] confirmPurchaseOrder 실패", {
      id,
      error: error.message,
    });
    throw error;
  }

  revalidatePath("/admin/purchase-orders");
}

// products.stock_quantity 가산 + purchase_orders.status 변경을 원자적으로
// 처리하는 supabase/migrations/20260921120100의 receive_purchase_order RPC를
// 호출한다. 재고가 바뀌므로 상품 관리 화면도 함께 재검증한다.
export async function receivePurchaseOrder(id: string) {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.rpc("receive_purchase_order", {
    p_purchase_order_id: id,
  });

  if (error) {
    console.error("[purchase-order] receivePurchaseOrder 실패", {
      id,
      error: error.message,
    });
    throw error;
  }

  revalidatePath("/admin/purchase-orders");
  revalidatePath("/admin/products");
}
