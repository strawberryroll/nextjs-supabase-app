"use client";

import { useEffect, useState, useTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EmptyState } from "@/components/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { revalidateCartItems } from "@/lib/actions/cart";
import { formatCurrencyKRW } from "@/lib/format";

interface ServerProductInfo {
  price: number;
  stock_quantity: number;
}

export function CartView() {
  const { items, updateQuantity, removeItem, totalPrice } = useCart();
  const router = useRouter();

  const [serverInfo, setServerInfo] = useState<Map<string, ServerProductInfo>>(
    new Map(),
  );
  const [, startTransition] = useTransition();

  // 장바구니 상품 구성이 바뀔 때마다 서버 최신 가격/재고로 재검증한다.
  // startTransition은 렌더 중이 아니라 이펙트 안에서 호출해야 하므로(렌더
  // 중 호출 시 "Cannot call startTransition while rendering" 에러) useEffect를
  // 쓰되, setState는 트랜지션 콜백(비동기) 안에서만 호출해 set-state-in-effect
  // 규칙(이펙트 본문에서의 동기 setState 호출)에는 해당하지 않는다.
  const currentIds = items
    .map((item) => item.productId)
    .sort()
    .join(",");

  useEffect(() => {
    const productIds = currentIds ? currentIds.split(",") : [];
    startTransition(async () => {
      const result =
        productIds.length > 0 ? await revalidateCartItems(productIds) : [];
      setServerInfo(
        new Map(
          result.map((product) => [
            product.id,
            { price: product.price, stock_quantity: product.stock_quantity },
          ]),
        ),
      );
    });
  }, [currentIds]);

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
      {items.map((item) => {
        const server = serverInfo.get(item.productId);
        // 서버 조회 결과에서 상품이 아예 빠져 있으면 삭제된 상품으로 간주한다.
        const isRemoved = serverInfo.size > 0 && !server;
        const isOutOfStock = isRemoved || server?.stock_quantity === 0;
        const priceChanged =
          server !== undefined && server.price !== item.price;

        return (
          <div
            key={item.productId}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div className="flex items-center gap-4">
              <div className="bg-muted relative aspect-square w-16 shrink-0 overflow-hidden rounded-md">
                {item.imageUrl && (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                )}
              </div>
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-muted-foreground text-sm">
                  {formatCurrencyKRW(item.price)}
                </p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {isRemoved && <Badge variant="destructive">판매 종료</Badge>}
                  {!isRemoved && isOutOfStock && (
                    <Badge variant="destructive">품절</Badge>
                  )}
                  {priceChanged && (
                    <Badge variant="outline">
                      가격이 {formatCurrencyKRW(server.price)}(으)로
                      변경되었습니다
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  disabled={isOutOfStock}
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
                  disabled={isOutOfStock}
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
        );
      })}
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
