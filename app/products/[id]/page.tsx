import { Suspense } from "react";
import Image from "next/image";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteHeaderSkeleton } from "@/components/site-header-skeleton";
import { AddToCartForm } from "@/components/add-to-cart-form";
import { Badge } from "@/components/ui/badge";
import {
  getProductById,
  FALLBACK_PRODUCT_IMAGE_URL,
} from "@/lib/queries/products";
import { formatCurrencyKRW } from "@/lib/format";
import { cn } from "@/lib/utils";

// params는 요청 시점에만 알려지는 런타임 값이라 페이지 최상단에서 await하면
// prerender가 막힌다(blocking-prerender-dynamic). Suspense로 감싼 자식
// 컴포넌트에서 await하도록 분리한다.
export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <>
      <Suspense fallback={<SiteHeaderSkeleton />}>
        <SiteHeader />
      </Suspense>
      <main className="mx-auto max-w-7xl p-5">
        <Suspense fallback={<ProductDetailSkeleton />}>
          <ProductDetail params={params} />
        </Suspense>
      </main>
    </>
  );
}

async function ProductDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const inStock = product.stock_quantity > 0;
  const imageUrl = product.image_url ?? FALLBACK_PRODUCT_IMAGE_URL;

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div className="bg-muted relative aspect-square overflow-hidden rounded-xl">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className={cn("object-cover", !inStock && "grayscale")}
          priority
        />
      </div>
      <div>
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
        <p className="text-muted-foreground mt-4">
          {product.description ?? ""}
        </p>
        <AddToCartForm
          productId={product.id}
          name={product.name}
          price={product.price}
          inStock={inStock}
          imageUrl={imageUrl}
        />
      </div>
    </div>
  );
}

function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
      <div className="bg-muted aspect-square animate-pulse rounded-xl" />
      <div className="flex flex-col gap-4">
        <div className="bg-muted h-8 w-2/3 animate-pulse rounded" />
        <div className="bg-muted h-6 w-1/3 animate-pulse rounded" />
        <div className="bg-muted h-20 w-full animate-pulse rounded" />
      </div>
    </div>
  );
}
