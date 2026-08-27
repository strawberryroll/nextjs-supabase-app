"use server";

import { getProductsByIds } from "@/lib/queries/products";

// 장바구니(localStorage)에 담긴 상품의 가격/재고를 서버 기준으로 재검증한다.
// 순수 조회이며 products.select는 RLS상 공개이므로 비로그인 상태에서도 호출 가능.
export async function revalidateCartItems(productIds: string[]) {
  return getProductsByIds(productIds);
}
