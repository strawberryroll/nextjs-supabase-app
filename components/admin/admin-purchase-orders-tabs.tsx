"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { EmptyState } from "@/components/empty-state";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  confirmPurchaseOrder,
  receivePurchaseOrder,
} from "@/lib/actions/purchase-orders";
import { createClient } from "@/lib/supabase/client";
import type { PurchaseOrderWithProduct } from "@/lib/queries/admin";
import type { PurchaseOrderStatus } from "@/lib/types/commerce";

const TABS: { value: PurchaseOrderStatus; label: string }[] = [
  { value: "pending", label: "발주 대기" },
  { value: "confirmed", label: "발주 확인" },
  { value: "received", label: "입고 완료" },
];

export function AdminPurchaseOrdersTabs({
  purchaseOrders,
}: {
  purchaseOrders: PurchaseOrderWithProduct[];
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  // 다른 관리자가 발주 상태를 바꾸거나 결제로 새 발주가 자동 생성되면
  // 이 화면도 실시간으로 갱신한다(supabase/migrations/20260922110000에서
  // purchase_orders를 supabase_realtime publication에 추가해둠).
  useEffect(() => {
    const supabase = createClient();
    let channel: ReturnType<typeof supabase.channel> | null = null;
    let cancelled = false;

    // postgres_changes는 RLS를 준수하므로, 구독 시점에 realtime 클라이언트가
    // 로그인 세션의 access token을 먼저 갖고 있어야 한다(익명 키로 구독하면
    // is_admin() RLS에 막혀 이벤트가 전혀 오지 않는다).
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (cancelled) return;
      if (session) {
        supabase.realtime.setAuth(session.access_token);
      }
      channel = supabase
        .channel("purchase-orders-changes")
        .on(
          "postgres_changes",
          { event: "*", schema: "public", table: "purchase_orders" },
          (payload) => {
            router.refresh();
            if (payload.eventType === "INSERT") {
              toast.info("새 발주 요청이 있습니다");
            }
          },
        )
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (channel) {
        supabase.removeChannel(channel);
      }
    };
  }, [router]);

  const handleConfirm = async (id: string) => {
    setError(null);
    setPendingId(id);
    try {
      await confirmPurchaseOrder(id);
      toast.success("발주를 확인했습니다");
    } catch {
      setError("확인 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setPendingId(null);
    }
  };

  const handleReceive = async (id: string) => {
    setError(null);
    setPendingId(id);
    try {
      await receivePurchaseOrder(id);
      toast.success("입고 처리되었습니다");
    } catch {
      setError("입고 처리 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <Tabs defaultValue="pending" className="mt-6">
      <TabsList>
        {TABS.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>
      {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
      {TABS.map((tab) => {
        const filtered = purchaseOrders.filter((po) => po.status === tab.value);
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
                      요청 수량: {po.requested_quantity}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <StatusBadge status={po.status} />
                    {po.status === "pending" && (
                      <Button
                        size="sm"
                        disabled={pendingId === po.id}
                        onClick={() => handleConfirm(po.id)}
                      >
                        {pendingId === po.id ? "처리 중..." : "확인 처리"}
                      </Button>
                    )}
                    {po.status === "confirmed" && (
                      <Button
                        size="sm"
                        disabled={pendingId === po.id}
                        onClick={() => handleReceive(po.id)}
                      >
                        {pendingId === po.id ? "처리 중..." : "입고 처리"}
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
  );
}
