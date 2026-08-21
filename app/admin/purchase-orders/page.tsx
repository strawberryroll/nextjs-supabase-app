"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  mockPurchaseOrders,
  type MockPurchaseOrder,
  type MockPurchaseOrderStatus,
} from "@/lib/mock/purchase-orders";

const TABS: { value: MockPurchaseOrderStatus; label: string }[] = [
  { value: "pending", label: "발주 대기" },
  { value: "confirmed", label: "발주 확인" },
  { value: "received", label: "입고 완료" },
];

export default function AdminPurchaseOrdersPage() {
  const [purchaseOrders, setPurchaseOrders] =
    useState<MockPurchaseOrder[]>(mockPurchaseOrders);

  const transition = (id: string, nextStatus: MockPurchaseOrderStatus) => {
    // TODO(Phase 3 Task 011): Server Action/Postgres 함수로 purchase_orders.status 갱신(입고 시 재고 반영)
    setPurchaseOrders((prev) =>
      prev.map((po) => (po.id === id ? { ...po, status: nextStatus } : po)),
    );
  };

  return (
    <>
      <h1 className="text-2xl font-bold">발주 관리</h1>
      <Tabs defaultValue="pending" className="mt-6">
        <TabsList>
          {TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {TABS.map((tab) => {
          const filtered = purchaseOrders.filter(
            (po) => po.status === tab.value,
          );
          return (
            <TabsContent
              key={tab.value}
              value={tab.value}
              className="flex flex-col gap-3"
            >
              {filtered.length === 0 ? (
                <EmptyState title="해당 상태의 발주 요청이 없습니다" />
              ) : (
                filtered.map((po) => (
                  <div
                    key={po.id}
                    className="flex items-center justify-between rounded-lg border p-4"
                  >
                    <div>
                      <p className="font-medium">{po.productName}</p>
                      <p className="text-muted-foreground text-sm">
                        요청 수량: {po.requestedQuantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge status={po.status} />
                      {po.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => transition(po.id, "confirmed")}
                        >
                          확인 처리
                        </Button>
                      )}
                      {po.status === "confirmed" && (
                        <Button
                          size="sm"
                          onClick={() => transition(po.id, "received")}
                        >
                          입고 처리
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </>
  );
}
