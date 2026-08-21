"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { formatCurrencyKRW } from "@/lib/format";

export function CartView() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="mt-6">
        <EmptyState
          title="장바구니가 비어 있습니다"
          description="상품을 담고 다시 확인해주세요."
        />
        <div className="mt-4">
          <Button asChild variant="outline">
            <Link href="/">상품 보러가기</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {items.map((item) => (
        <div
          key={item.productId}
          className="flex items-center justify-between rounded-lg border p-4"
        >
          <div>
            <p className="font-medium">{item.name}</p>
            <p className="text-muted-foreground text-sm">
              {formatCurrencyKRW(item.price)}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() =>
                  updateQuantity(item.productId, item.quantity - 1)
                }
              >
                -
              </Button>
              <span className="w-8 text-center">{item.quantity}</span>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() =>
                  updateQuantity(item.productId, item.quantity + 1)
                }
              >
                +
              </Button>
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={() => removeItem(item.productId)}
            >
              삭제
            </Button>
          </div>
        </div>
      ))}
      <div className="flex items-center justify-between border-t pt-4">
        <p className="text-lg font-semibold">합계</p>
        <p className="text-lg font-semibold">{formatCurrencyKRW(totalPrice)}</p>
      </div>
      <Button
        type="button"
        className="w-full"
        onClick={() => router.push("/checkout")}
      >
        결제하기
      </Button>
    </div>
  );
}
