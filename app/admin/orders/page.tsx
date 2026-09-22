import { Suspense } from "react";
import { getAllOrders } from "@/lib/queries/admin";
import { AdminOrdersTable } from "@/components/admin/admin-orders-table";

export default function AdminOrdersPage() {
  return (
    <>
      <h1 className="text-2xl font-bold">주문 관리</h1>
      <Suspense fallback={<AdminOrdersSkeleton />}>
        <AdminOrdersContent />
      </Suspense>
    </>
  );
}

async function AdminOrdersContent() {
  const orders = await getAllOrders();
  return <AdminOrdersTable orders={orders} />;
}

function AdminOrdersSkeleton() {
  return (
    <div className="mt-6 flex flex-col gap-2">
      <div className="bg-muted h-10 w-full animate-pulse rounded" />
      <div className="bg-muted h-10 w-full animate-pulse rounded" />
      <div className="bg-muted h-10 w-full animate-pulse rounded" />
    </div>
  );
}
