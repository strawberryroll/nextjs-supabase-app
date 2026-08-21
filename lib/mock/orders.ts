export type MockOrderStatus = "paid" | "preparing" | "shipping" | "delivered";

export interface MockOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface MockOrder {
  id: string;
  status: MockOrderStatus;
  totalAmount: number;
  createdAt: string;
  items: MockOrderItem[];
  recipient: string;
  address: string;
  phone: string;
}

export const mockOrders: MockOrder[] = [
  {
    id: "order-1001",
    status: "delivered",
    totalAmount: 42500,
    createdAt: "2026-08-10T09:20:00+09:00",
    items: [
      {
        productId: "1",
        productName: "유기농 원두 커피 1kg",
        quantity: 1,
        unitPrice: 24000,
      },
      {
        productId: "2",
        productName: "핸드드립 드리퍼 세트",
        quantity: 1,
        unitPrice: 18500,
      },
    ],
    recipient: "김민준",
    address: "서울특별시 강남구 테헤란로 123",
    phone: "010-1234-5678",
  },
  {
    id: "order-1002",
    status: "shipping",
    totalAmount: 89000,
    createdAt: "2026-08-15T14:05:00+09:00",
    items: [
      {
        productId: "3",
        productName: "무선 이어폰 프로",
        quantity: 1,
        unitPrice: 89000,
      },
    ],
    recipient: "이서연",
    address: "경기도 성남시 분당구 판교역로 235",
    phone: "010-2345-6789",
  },
  {
    id: "order-1003",
    status: "preparing",
    totalAmount: 24000,
    createdAt: "2026-08-18T11:40:00+09:00",
    items: [
      {
        productId: "6",
        productName: "가죽 노트 커버 A5",
        quantity: 1,
        unitPrice: 32000,
      },
    ],
    recipient: "박지훈",
    address: "부산광역시 해운대구 마린시티2로 33",
    phone: "010-3456-7890",
  },
  {
    id: "order-1004",
    status: "paid",
    totalAmount: 27500,
    createdAt: "2026-08-20T18:12:00+09:00",
    items: [
      {
        productId: "7",
        productName: "미니 가습기",
        quantity: 1,
        unitPrice: 27500,
      },
    ],
    recipient: "최유나",
    address: "인천광역시 연수구 컨벤시아대로 165",
    phone: "010-4567-8901",
  },
];
