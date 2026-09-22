import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import type { Product } from "@/lib/types/commerce";
import { AdminProductsTable } from "@/components/admin/admin-products-table";

export default function AdminProductsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">상품 관리</h1>
      <Suspense fallback={<AdminProductsSkeleton />}>
        <AdminProductsContent />
      </Suspense>
    </>
  );
}

// 관리자는 등록/수정/삭제 직후 최신 상태를 바로 봐야 하므로 캐시하지 않는
// 쿠키 의존 클라이언트로 조회한다(lib/queries/products.ts의 getProducts()는
// "use cache"라 여기서는 쓰지 않는다).
async function AdminProductsContent() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;

  return <AdminProductsTable products={(data ?? []) as Product[]} />;
}

function AdminProductsSkeleton() {
  return (
    <div className="mt-6 flex flex-col gap-2">
      <div className="bg-muted h-10 w-full animate-pulse rounded" />
      <div className="bg-muted h-10 w-full animate-pulse rounded" />
      <div className="bg-muted h-10 w-full animate-pulse rounded" />
    </div>
  );
}
