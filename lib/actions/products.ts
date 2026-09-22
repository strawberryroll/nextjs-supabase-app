"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/auth/require-admin";
import { productSchema, type ProductFormValues } from "@/lib/schemas/product";

export async function uploadProductImage(formData: FormData): Promise<string> {
  await requireAdmin();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    throw new Error("업로드할 파일이 없습니다");
  }

  const supabase = await createClient();
  const extension = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file);

  if (error) throw error;

  const {
    data: { publicUrl },
  } = supabase.storage.from("product-images").getPublicUrl(path);

  return publicUrl;
}

export async function createProduct(values: ProductFormValues) {
  await requireAdmin();
  const parsed = productSchema.parse(values);

  const supabase = await createClient();
  const { error } = await supabase.from("products").insert({
    name: parsed.name,
    price: parsed.price,
    stock_quantity: parsed.stockQuantity,
    threshold: parsed.threshold,
    description: parsed.description,
    image_url: parsed.imageUrl || null,
  });

  if (error) throw error;

  revalidatePath("/admin/products");
  revalidatePath("/");
}

export async function updateProduct(id: string, values: ProductFormValues) {
  await requireAdmin();
  const parsed = productSchema.parse(values);

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      name: parsed.name,
      price: parsed.price,
      stock_quantity: parsed.stockQuantity,
      threshold: parsed.threshold,
      description: parsed.description,
      image_url: parsed.imageUrl || null,
    })
    .eq("id", id);

  if (error) throw error;

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath(`/products/${id}`);
}

export async function deleteProduct(id: string) {
  await requireAdmin();

  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);

  if (error) throw error;

  revalidatePath("/admin/products");
  revalidatePath("/");
}
