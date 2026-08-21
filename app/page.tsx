import { SiteHeader } from "@/components/site-header";
import { ProductCard } from "@/components/product-card";
import { mockProducts } from "@/lib/mock/products";

// SiteHeader의 getClaims() 호출(cookies 접근)이 Suspense 없이 발생해 prerender가 막힌다.
// TODO(Phase 3): 실데이터 연동 시 "use cache"/<Suspense> 도입과 함께 재검토.
export const instant = false;

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl p-5">
        <h1 className="text-2xl font-bold">홈 / 상품 목록</h1>
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {mockProducts.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              inStock={product.stockQuantity > 0}
            />
          ))}
        </div>
        {/* TODO(Phase 3): 실데이터 연동 시 Suspense 경계 고려 */}
      </main>
    </>
  );
}
