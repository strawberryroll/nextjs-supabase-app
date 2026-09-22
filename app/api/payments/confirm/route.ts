import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { confirmPaymentSchema } from "@/lib/schemas/payment";

// 모의 결제: 실제 PG 연동 시 이 지점에서 토스페이먼츠 승인 API를 먼저
// 호출해 승인된 결제인지 확인한 뒤 아래 RPC를 실행해야 한다. 현재는
// 토스페이먼츠 키가 없어 crypto.randomUUID()로 만든 값을 payment_key로
// 대신 사용한다.
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.getClaims();

  if (authError || !authData?.claims) {
    return NextResponse.json({ error: "로그인이 필요합니다" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = confirmPaymentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "요청이 올바르지 않습니다" },
      { status: 400 },
    );
  }

  const { items, recipient, address, phone } = parsed.data;

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "process_order_payment",
    {
      p_user_id: authData.claims.sub,
      p_items: items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      })),
      p_payment_key: crypto.randomUUID(),
      p_recipient: recipient,
      p_address: address,
      p_phone: phone,
    },
  );

  if (rpcError) {
    // mcp__supabase__query_logs의 postgres_logs로 이 RPC 실행 실패를 사후
    // 조사할 수 있으나, Next.js 서버 콘솔은 수집하지 않아 여기서도 남긴다.
    console.error("[payment] process_order_payment 실패", {
      userId: authData.claims.sub,
      error: rpcError.message,
    });
    return NextResponse.json({ error: rpcError.message }, { status: 409 });
  }

  const [result] = rpcData;

  return NextResponse.json(
    { orderId: result.order_id, totalAmount: result.total_amount },
    { status: 200 },
  );
}
