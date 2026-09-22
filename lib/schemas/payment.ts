import { z } from "zod";
import { shippingSchema } from "@/lib/schemas/shipping";

export const confirmPaymentSchema = shippingSchema.extend({
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().positive(),
      }),
    )
    .min(1, "장바구니가 비어있습니다"),
});

export type ConfirmPaymentValues = z.infer<typeof confirmPaymentSchema>;
