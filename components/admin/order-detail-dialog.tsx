"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrencyKRW, ORDER_STATUS_LABEL } from "@/lib/format";
import type { MockOrder, MockOrderStatus } from "@/lib/mock/orders";

interface OrderDetailDialogProps {
  trigger: React.ReactNode;
  order: MockOrder;
  onStatusChange: (status: MockOrderStatus) => void;
}

export function OrderDetailDialog({
  trigger,
  order,
  onStatusChange,
}: OrderDetailDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{order.id}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="text-sm">
            <p>
              <span className="text-muted-foreground">수령인:</span>{" "}
              {order.recipient}
            </p>
            <p>
              <span className="text-muted-foreground">주소:</span>{" "}
              {order.address}
            </p>
            <p>
              <span className="text-muted-foreground">연락처:</span>{" "}
              {order.phone}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            {order.items.map((item) => (
              <div
                key={item.productId}
                className="flex justify-between text-sm"
              >
                <span>
                  {item.productName} x {item.quantity}
                </span>
                <span>{formatCurrencyKRW(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>합계</span>
              <span>{formatCurrencyKRW(order.totalAmount)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">배송 상태</span>
            <Select
              value={order.status}
              onValueChange={(value) =>
                onStatusChange(value as MockOrderStatus)
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ORDER_STATUS_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
