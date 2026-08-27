import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteHeaderSkeleton } from "@/components/site-header-skeleton";
import { ProductCard } from "@/components/product-card";
import {
  getProducts,
  FALLBACK_PRODUCT_IMAGE_URL,
} from "@/lib/queries/products";

export default async function Home() {
  const products = await getProducts();

  return (
    <>
      <Suspense fallback={<SiteHeaderSkeleton />}>
        <SiteHeader />
      </Suspense>
      <main className="mx-auto max-w-7xl p-5">
        <h1 className="text-2xl font-bold">홈 / 상품 목록</h1>
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
      </main>
    </>
  );
}
