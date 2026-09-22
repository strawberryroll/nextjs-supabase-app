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
import type { OrderWithItems } from "@/lib/queries/orders";
import type { OrderStatus } from "@/lib/types/commerce";

interface OrderDetailDialogProps {
  trigger: React.ReactNode;
  order: OrderWithItems;
  onStatusChange: (status: OrderStatus) => Promise<void>;
}

export function OrderDetailDialog({
  trigger,
  order,
  onStatusChange,
}: OrderDetailDialogProps) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatusChange = async (value: string) => {
    setError(null);
    try {
      await onStatusChange(value as OrderStatus);
    } catch {
      setError("상태 변경 중 오류가 발생했습니다. 다시 시도해주세요.");
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) setError(null);
      }}
    >
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
              <div key={item.id} className="flex justify-between text-sm">
                <span>
                  {item.productName} x {item.quantity}
                </span>
                <span>
                  {formatCurrencyKRW(item.unit_price * item.quantity)}
                </span>
              </div>
            ))}
            <div className="flex justify-between border-t pt-2 font-semibold">
              <span>합계</span>
              <span>{formatCurrencyKRW(order.total_amount)}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">배송 상태</span>
            <Select value={order.status} onValueChange={handleStatusChange}>
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
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
