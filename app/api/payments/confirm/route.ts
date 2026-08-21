import { NextResponse, type NextRequest } from "next/server";

// TODO(Phase 3 Task 010): 토스페이먼츠 승인 API 호출 + process_order_payment RPC 실행 로직 구현 예정
export async function POST(_request: NextRequest) {
  return NextResponse.json(
    { message: "결제 승인 로직 미구현 (Phase 3 Task 010 예정)" },
    { status: 501 },
  );
}
