export type MockPurchaseOrderStatus = "pending" | "confirmed" | "received";

export interface MockPurchaseOrder {
  id: string;
  productId: string;
  productName: string;
  status: MockPurchaseOrderStatus;
  requestedQuantity: number;
  createdAt: string;
}

export const mockPurchaseOrders: MockPurchaseOrder[] = [
  {
    id: "po-1",
    productId: "4",
    productName: "스테인리스 텀블러 500ml",
    status: "pending",
    requestedQuantity: 30,
    createdAt: "2026-08-19T08:00:00+09:00",
  },
  {
    id: "po-2",
    productId: "7",
    productName: "미니 가습기",
    status: "pending",
    requestedQuantity: 20,
    createdAt: "2026-08-20T10:30:00+09:00",
  },
  {
    id: "po-3",
    productId: "3",
    productName: "무선 이어폰 프로",
    status: "confirmed",
    requestedQuantity: 15,
    createdAt: "2026-08-17T13:15:00+09:00",
  },
  {
    id: "po-4",
    productId: "5",
    productName: "천연 소이 캔들",
    status: "received",
    requestedQuantity: 25,
    createdAt: "2026-08-05T09:45:00+09:00",
  },
  {
    id: "po-5",
    productId: "8",
    productName: "면 100% 에코백",
    status: "received",
    requestedQuantity: 40,
    createdAt: "2026-08-01T16:20:00+09:00",
  },
];
