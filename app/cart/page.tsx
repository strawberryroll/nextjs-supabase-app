import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteHeaderSkeleton } from "@/components/site-header-skeleton";
import { CartView } from "@/components/cart-view";

export default function CartPage() {
  return (
    <>
      <Suspense fallback={<SiteHeaderSkeleton />}>
        <SiteHeader />
      </Suspense>
      <main className="mx-auto max-w-7xl p-5">
        <h1 className="text-2xl font-bold">장바구니</h1>
        <CartView />
      </main>
    </>
  );
}
