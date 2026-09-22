import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteHeaderSkeleton } from "@/components/site-header-skeleton";
import { ProductCard } from "@/components/product-card";
import { ProductSearchControls } from "@/components/product-search-controls";
import { Pagination } from "@/components/pagination";
import { EmptyState } from "@/components/empty-state";
import {
  getProducts,
  FALLBACK_PRODUCT_IMAGE_URL,
  PAGE_SIZE,
  type ProductSort,
} from "@/lib/queries/products";

// searchParams는 요청 시점에만 알려지는 런타임 값이라 페이지 최상단에서
// await하면 prerender가 막힌다(blocking-prerender-dynamic). Suspense로
// 감싼 자식 컴포넌트에서 await하도록 분리한다.
export default function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
}) {
  return (
    <>
      <Suspense fallback={<SiteHeaderSkeleton />}>
        <SiteHeader />
      </Suspense>
      <main className="mx-auto max-w-7xl p-5">
        <h1 className="text-2xl font-bold">홈 / 상품 목록</h1>
        <Suspense fallback={<ProductSearchControlsSkeleton />}>
          <ProductSearchControls />
        </Suspense>
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductGrid searchParams={searchParams} />
        </Suspense>
      </main>
    </>
  );
}

const VALID_SORTS: ProductSort[] = ["newest", "price_asc", "price_desc"];

async function ProductGrid({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
}) {
  const { q, sort, page } = await searchParams;
  const currentPage = Math.max(1, Number(page) || 1);
  const validSort = VALID_SORTS.includes(sort as ProductSort)
    ? (sort as ProductSort)
    : "newest";

  const { products, totalCount } = await getProducts({
    search: q,
    sort: validSort,
    page: currentPage,
  });

  if (products.length === 0) {
    return (
      <div className="mt-6">
        <EmptyState
          title="검색 결과가 없습니다"
          description="다른 검색어나 조건으로 다시 시도해주세요."
        />
      </div>
    );
  }

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);
  const buildHref = (targetPage: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (validSort !== "newest") params.set("sort", validSort);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `/?${qs}` : "/";
  };

  return (
    <>
      <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <ProductCard
            key={product.id}
            id={product.id}
            name={product.name}
            price={product.price}
            inStock={product.stock_quantity > 0}
            imageUrl={product.image_url ?? FALLBACK_PRODUCT_IMAGE_URL}
          />
        ))}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        buildHref={buildHref}
      />
    </>
  );
}

function ProductSearchControlsSkeleton() {
  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="bg-muted h-9 w-full max-w-sm animate-pulse rounded-md" />
      <div className="bg-muted h-9 w-40 animate-pulse rounded-md" />
    </div>
  );
}

function ProductGridSkeleton() {
  return (
    <div className="mt-6 grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: PAGE_SIZE }).map((_, i) => (
        <div key={i} className="flex flex-col gap-3">
          <div className="bg-muted aspect-square animate-pulse rounded-2xl" />
          <div className="bg-muted h-4 w-2/3 animate-pulse rounded" />
          <div className="bg-muted h-5 w-1/3 animate-pulse rounded" />
        </div>
      ))}
    </div>
  );
}
