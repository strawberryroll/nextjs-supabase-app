"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";

interface AddToCartFormProps {
  productId: string;
  name: string;
  price: number;
  inStock: boolean;
}

export function AddToCartForm({
  productId,
  name,
  price,
  inStock,
}: AddToCartFormProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const router = useRouter();

  return (
    <div className="mt-6 flex items-center gap-4">
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={!inStock || quantity <= 1}
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
        >
          -
        </Button>
        <span className="w-8 text-center">{quantity}</span>
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={!inStock}
          onClick={() => setQuantity((q) => q + 1)}
        >
          +
        </Button>
      </div>
      <Button
        type="button"
        disabled={!inStock}
        onClick={() => {
          addItem({ productId, name, price }, quantity);
          router.push("/cart");
        }}
      >
        장바구니 담기
      </Button>
    </div>
  );
}
