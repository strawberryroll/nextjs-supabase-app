import { z } from "zod";

export const shippingSchema = z.object({
  recipient: z.string().min(1, "수령인을 입력해주세요"),
  address: z.string().min(1, "주소를 입력해주세요"),
  phone: z
    .string()
    .min(1, "연락처를 입력해주세요")
    .regex(/^[0-9-]+$/, "올바른 연락처 형식이 아닙니다"),
});

export type ShippingFormValues = z.infer<typeof shippingSchema>;
