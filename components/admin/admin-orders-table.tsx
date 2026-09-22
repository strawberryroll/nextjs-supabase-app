"use client";

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
import { updateOrderStatus } from "@/lib/actions/orders";
import { formatCurrencyKRW } from "@/lib/format";
import type { OrderWithItems } from "@/lib/queries/orders";

export function AdminOrdersTable({ orders }: { orders: OrderWithItems[] }) {
  return (
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
              <TableCell>{formatCurrencyKRW(order.total_amount)}</TableCell>
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
                    updateOrderStatus(order.id, status)
                  }
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
