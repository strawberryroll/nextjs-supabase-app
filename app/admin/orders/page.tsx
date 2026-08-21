"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { OrderDetailDialog } from "@/components/admin/order-detail-dialog";
import {
  mockOrders,
  type MockOrder,
  type MockOrderStatus,
} from "@/lib/mock/orders";
import { formatCurrencyKRW } from "@/lib/format";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<MockOrder[]>(mockOrders);

  const handleStatusChange = (orderId: string, status: MockOrderStatus) => {
    // TODO(Phase 3 Task 011): Server Action으로 orders.status 갱신
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status } : order,
      ),
    );
  };

  return (
    <>
      <h1 className="text-2xl font-bold">주문 관리</h1>
      <div className="mt-6 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>주문번호</TableHead>
              <TableHead>수령인</TableHead>
              <TableHead>합계</TableHead>
              <TableHead>상태</TableHead>
              <TableHead className="text-right">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>{order.id}</TableCell>
                <TableCell>{order.recipient}</TableCell>
                <TableCell>{formatCurrencyKRW(order.totalAmount)}</TableCell>
                <TableCell>
                  <StatusBadge status={order.status} />
                </TableCell>
                <TableCell className="text-right">
                  <OrderDetailDialog
                    trigger={
                      <Button variant="outline" size="sm">
                        상세보기
                      </Button>
                    }
                    order={order}
                    onStatusChange={(status) =>
                      handleStatusChange(order.id, status)
                    }
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
