import type { Database } from "@/lib/supabase/database.types";

// 커머스 스키마(원두산책)의 도메인 타입.
// database.types.ts는 mcp__supabase__generate_typescript_types로 재생성된 파일이며,
// orders.status/purchase_orders.status는 Postgres의 text + check 제약이라 생성기가
// string으로만 추론한다(Postgres native enum이 아니므로 Enums 섹션도 비어있음).
// 따라서 Tables<> Row 타입을 그대로 alias하되, status 필드만 아래 유니온 타입으로
// 오버라이드해 컴파일 타임에 상태값 오타를 잡을 수 있게 한다.

// orders.status의 check 제약과 동일한 5단계(pending_payment -> paid -> preparing -> shipping -> delivered).
export type OrderStatus =
  "pending_payment" | "paid" | "preparing" | "shipping" | "delivered";

// purchase_orders.status의 check 제약과 동일한 3단계(pending -> confirmed -> received).
export type PurchaseOrderStatus = "pending" | "confirmed" | "received";

export type Product = Database["public"]["Tables"]["products"]["Row"];

export type Order = Omit<
  Database["public"]["Tables"]["orders"]["Row"],
  "status"
> & {
  status: OrderStatus;
};

// order_items는 product_name을 저장하지 않음: product_id로 products 테이블을 조인해
// 이름을 조회하는 정규화 방식 채택(비정규화 스냅샷은 이번 범위 밖).
export type OrderItem = Database["public"]["Tables"]["order_items"]["Row"];

export type PurchaseOrder = Omit<
  Database["public"]["Tables"]["purchase_orders"]["Row"],
  "status"
> & {
  status: PurchaseOrderStatus;
};

// CartItem은 hooks/use-cart.ts의 기존 정의를 재사용한다(여기서 재정의하지 않음).
// 발주 상태 전이(F026/F027)는 입력 폼 없는 버튼 액션이라 신규 zod 스키마가 필요 없다 —
// 기존 lib/schemas의 productSchema/shippingSchema로 충분하다.
