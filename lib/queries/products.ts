import { cacheLife } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createCachedClient } from "@/lib/supabase/cached-client";
import type { Product } from "@/lib/types/commerce";

// products.image_url은 nullable(스키마상 optional) — 값이 없을 때 표시할 폴백.
// next.config.ts의 images.remotePatterns에 picsum.photos가 이미 등록되어 있다.
export const FALLBACK_PRODUCT_IMAGE_URL =
  "https://picsum.photos/seed/product-placeholder/600/600";

export async function getProducts(): Promise<Product[]> {
  "use cache";
  cacheLife("minutes");

  // "use cache" 스코프 안에서는 cookies()를 호출할 수 없어(next-request-in-use-cache)
  // 세션 기반 서버 클라이언트(lib/supabase/server.ts) 대신 쿠키 비의존 클라이언트를
  // 쓴다. products.select는 RLS상 공개이므로 인증 컨텍스트가 필요 없다.
  const supabase = createCachedClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function getProductById(id: string): Promise<Product | null> {
  "use cache";
  cacheLife("minutes");

  const supabase = createCachedClient();
  // 잘못된 형식의 id(비 UUID 등)는 Postgres가 22P02(invalid_text_representation)로
  // 거부한다. 이 경우도 "상품 없음"과 동일하게 취급해 호출부(page.tsx)가 notFound()로
  // 처리할 수 있도록 null을 반환한다.
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) return null;
  return data;
}

type ProductStockInfo = Pick<
  Product,
  "id" | "name" | "price" | "stock_quantity"
>;

// 장바구니 가격/재고 재검증 전용 — 캐시하지 않아 항상 최신 값을 반환한다.
export async function getProductsByIds(
  ids: string[],
): Promise<ProductStockInfo[]> {
  if (ids.length === 0) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id, name, price, stock_quantity")
    .in("id", ids);

  if (error) throw error;
  return data ?? [];
}
