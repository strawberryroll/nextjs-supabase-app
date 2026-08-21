import { Badge, type BadgeProps } from "@/components/ui/badge";
import { ORDER_STATUS_LABEL, PURCHASE_ORDER_STATUS_LABEL } from "@/lib/format";

const STATUS_VARIANT: Record<string, BadgeProps["variant"]> = {
  pending: "secondary",
  paid: "secondary",
  confirmed: "default",
  preparing: "default",
  shipping: "default",
  received: "outline",
  delivered: "outline",
};

export function StatusBadge({ status }: { status: string }) {
  const label =
    PURCHASE_ORDER_STATUS_LABEL[status] ?? ORDER_STATUS_LABEL[status] ?? status;

  return <Badge variant={STATUS_VARIANT[status] ?? "outline"}>{label}</Badge>;
}
