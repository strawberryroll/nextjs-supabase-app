"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import type { OrderStatus } from "@/lib/types/commerce";

export async function updateOrderStatus(orderId: string, status: OrderStatus) {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status })
    .eq("id", orderId);

  if (error) throw error;

  revalidatePath("/admin/orders");
}
