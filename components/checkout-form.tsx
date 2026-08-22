"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/empty-state";
import { useCart } from "@/hooks/use-cart";
import { formatCurrencyKRW } from "@/lib/format";
import {
  shippingSchema,
  type ShippingFormValues,
} from "@/lib/schemas/shipping";

export function CheckoutForm() {
  const { items, totalPrice, clearCart } = useCart();
  const router = useRouter();

  const form = useForm<ShippingFormValues>({
    resolver: zodResolver(shippingSchema),
    defaultValues: { recipient: "", address: "", phone: "" },
  });

  const onSubmit = () => {
    // TODO(Phase 3 Task 010): 토스페이먼츠 결제창 호출 및 결제 승인 연동
    clearCart();
    router.push("/orders/complete");
  };

  if (items.length === 0) {
    return (
      <div className="mt-6">
        <EmptyState
          title="장바구니가 비어 있습니다"
          description="결제를 진행하려면 먼저 상품을 담아주세요."
        />
      </div>
    );
  }

  return (
    <div className="mt-6 grid grid-cols-1 gap-8 md:grid-cols-2">
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <Controller
          name="recipient"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="recipient">수령인</FieldLabel>
              <Input
                {...field}
                id="recipient"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name="address"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="address">주소</FieldLabel>
              <Input
                {...field}
                id="address"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Controller
          name="phone"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="phone">연락처</FieldLabel>
              <Input
                {...field}
                id="phone"
                placeholder="010-0000-0000"
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />
        <Button type="submit">결제하기</Button>
      </form>
      <div className="flex flex-col gap-4 rounded-lg border p-4">
        <p className="font-semibold">주문 요약</p>
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center justify-between text-sm"
          >
            <span className="flex items-center gap-3">
              <span className="bg-muted relative aspect-square w-10 shrink-0 overflow-hidden rounded-md">
                {item.imageUrl && (
                  <Image
                    src={item.imageUrl}
                    alt={item.name}
                    fill
                    sizes="40px"
                    className="object-cover"
                  />
                )}
              </span>
              <span>
                {item.name} x {item.quantity}
              </span>
            </span>
            <span>{formatCurrencyKRW(item.price * item.quantity)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t pt-4 font-semibold">
          <span>합계</span>
          <span>{formatCurrencyKRW(totalPrice)}</span>
        </div>
      </div>
    </div>
  );
}
