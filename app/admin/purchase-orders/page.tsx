import { Suspense } from "react";
import { getAllPurchaseOrders } from "@/lib/queries/admin";
import { AdminPurchaseOrdersTabs } from "@/components/admin/admin-purchase-orders-tabs";

export default function AdminPurchaseOrdersPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">발주 관리</h1>
      <Suspense fallback={<AdminPurchaseOrdersSkeleton />}>
        <AdminPurchaseOrdersContent />
      </Suspense>
    </>
  );
}

async function AdminPurchaseOrdersContent() {
  const purchaseOrders = await getAllPurchaseOrders();
  return <AdminPurchaseOrdersTabs purchaseOrders={purchaseOrders} />;
}

function AdminPurchaseOrdersSkeleton() {
  return (
    <div className="mt-6 flex flex-col gap-3">
      <div className="bg-muted h-16 w-full animate-pulse rounded-lg" />
      <div className="bg-muted h-16 w-full animate-pulse rounded-lg" />
    </div>
  );
}
