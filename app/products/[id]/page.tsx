import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { AddToCartForm } from "@/components/add-to-cart-form";
import { Badge } from "@/components/ui/badge";
import { mockProducts } from "@/lib/mock/products";
import { formatCurrencyKRW } from "@/lib/format";

// SiteHeader의 getClaims() 호출(cookies 접근)이 Suspense 없이 발생해 prerender가 막힌다.
// TODO(Phase 3): 실데이터 연동 시 "use cache"/<Suspense> 도입과 함께 재검토.
export const instant = false;

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = mockProducts.find((p) => p.id === id);

  if (!product) {
    notFound();
  }

  const inStock = product.stockQuantity > 0;

  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl p-5">
        <h1 className="text-2xl font-bold">{product.name}</h1>
        <p className="text-foreground mt-2 text-xl font-semibold">
          {formatCurrencyKRW(product.price)}
        </p>
        <div className="mt-2">
          {inStock ? (
            <Badge variant="outline">재고 있음</Badge>
          ) : (
            <Badge variant="destructive">품절</Badge>
          )}
        </div>
        <p className="text-muted-foreground mt-4">{product.description}</p>
        <AddToCartForm
          productId={product.id}
          name={product.name}
          price={product.price}
          inStock={inStock}
        />
        {/* TODO(Phase 3): 실데이터 연동 시 Suspense 경계 고려 */}
      </main>
    </>
  );
}
