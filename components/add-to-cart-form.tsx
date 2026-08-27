"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";

interface AddToCartFormProps {
  productId: string;
  name: string;
  price: number;
  inStock: boolean;
  imageUrl: string;
}

export function AddToCartForm({
  productId,
  name,
  price,
  inStock,
  imageUrl,
}: AddToCartFormProps) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

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
          addItem({ productId, name, price, imageUrl }, quantity);
          toast.success("장바구니에 담았습니다");
        }}
      >
        장바구니 담기
      </Button>
    </div>
  );
}
