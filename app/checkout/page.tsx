import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { SiteHeaderSkeleton } from "@/components/site-header-skeleton";
import { CheckoutForm } from "@/components/checkout-form";

export default function CheckoutPage() {
  return (
    <>
      <Suspense fallback={<SiteHeaderSkeleton />}>
        <SiteHeader />
      </Suspense>
      <main className="mx-auto max-w-7xl p-5">
        <h1 className="text-2xl font-bold">체크아웃</h1>
        <CheckoutForm />
      </main>
    </>
  );
}
