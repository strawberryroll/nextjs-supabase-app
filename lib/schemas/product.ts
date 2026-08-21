import { z } from "zod";

export const productSchema = z.object({
  name: z.string().min(1, "상품명을 입력해주세요"),
  price: z.number().int().min(0, "가격은 0 이상이어야 합니다"),
  stockQuantity: z.number().int().min(0, "재고 수량은 0 이상이어야 합니다"),
  threshold: z.number().int().min(0, "임계치는 0 이상이어야 합니다"),
  description: z.string().min(1, "상품 설명을 입력해주세요"),
});

export type ProductFormValues = z.infer<typeof productSchema>;
