import { cacheLife } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createCachedClient } from "@/lib/supabase/cached-client";
import type { Product } from "@/lib/types/commerce";

// products.image_url은 nullable(스키마상 optional) — 값이 없을 때 표시할 폴백.
// next.config.ts의 images.remotePatterns에 picsum.photos가 이미 등록되어 있다.
export const FALLBACK_PRODUCT_IMAGE_URL =
  "https://picsum.photos/seed/product-placeholder/600/600";

export type ProductSort = "newest" | "price_asc" | "price_desc";

export const PAGE_SIZE = 12;

// sort 쿼리 파라미터를 직접 .order()에 넘기지 않고 화이트리스트로만 매핑한다
// (임의 컬럼명 주입 방지). 매핑에 없는 값은 newest로 폴백한다.
const SORT_MAP: Record<
  ProductSort,
  { column: "created_at" | "price"; ascending: boolean }
> = {
  newest: { column: "created_at", ascending: false },
  price_asc: { column: "price", ascending: true },
  price_desc: { column: "price", ascending: false },
};

export type GetProductsOptions = {
  search?: string;
  sort?: ProductSort;
  page?: number;
};

export type GetProductsResult = {
  products: Product[];
  totalCount: number;
};

// "use cache" 함수의 반환값은 인자별로 캐시 키가 분리되므로, search/sort/page
// 조합마다 별도로 캐시된다.
export async function getProducts(
  options: GetProductsOptions = {},
): Promise<GetProductsResult> {
  "use cache";
  cacheLife("minutes");

  const { search, page = 1 } = options;
  const { column, ascending } = SORT_MAP[options.sort ?? "newest"];

  // "use cache" 스코프 안에서는 cookies()를 호출할 수 없어(next-request-in-use-cache)
  // 세션 기반 서버 클라이언트(lib/supabase/server.ts) 대신 쿠키 비의존 클라이언트를
  // 쓴다. products.select는 RLS상 공개이므로 인증 컨텍스트가 필요 없다.
  const supabase = createCachedClient();
  let query = supabase
    .from("products")
    .select("*", { count: "exact" })
    .order(column, { ascending });

  if (search) {
    query = query.ilike("name", `%${search}%`);
  }

  const from = (page - 1) * PAGE_SIZE;
  const { data, error, count } = await query.range(from, from + PAGE_SIZE - 1);

  // PGRST103: 요청한 range(offset)가 실제 행 수를 초과할 때 PostgREST가 반환하는
  // 에러 — 존재하지 않는 페이지 번호로 접근한 경우이므로 빈 결과로 취급한다.
  if (error) {
    if (error.code === "PGRST103") {
      const { count: totalCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });
      return { products: [], totalCount: totalCount ?? 0 };
    }
    throw error;
  }

  return { products: data ?? [], totalCount: count ?? 0 };
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
