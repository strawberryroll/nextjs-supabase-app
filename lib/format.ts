export function formatCurrencyKRW(amount: number): string {
  return new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
  }).format(amount);
}

export const PURCHASE_ORDER_STATUS_LABEL: Record<string, string> = {
  pending: "발주 대기",
  confirmed: "발주 확인",
  received: "입고 완료",
};

export const ORDER_STATUS_LABEL: Record<string, string> = {
  // TODO(Phase 3 Task 006): orders.status enum 확정 후 채움
};
