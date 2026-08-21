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

// TODO(Phase 3 Task 006): orders.status enum 확정 후 값 재검토
export const ORDER_STATUS_LABEL: Record<string, string> = {
  paid: "결제 완료",
  preparing: "배송 준비중",
  shipping: "배송중",
  delivered: "배송 완료",
};
