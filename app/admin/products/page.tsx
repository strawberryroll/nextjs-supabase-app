"use client";

import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ProductFormDialog } from "@/components/admin/product-form-dialog";
import { DeleteConfirmDialog } from "@/components/admin/delete-confirm-dialog";
import { mockProducts, type MockProduct } from "@/lib/mock/products";
import { formatCurrencyKRW } from "@/lib/format";
import type { ProductFormValues } from "@/lib/schemas/product";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<MockProduct[]>(mockProducts);

  const handleCreate = (values: ProductFormValues) => {
    const id = `new-${Date.now()}`;
    setProducts((prev) => [
      ...prev,
      {
        ...values,
        id,
        imageUrl: values.imageUrl || `https://picsum.photos/seed/${id}/600/600`,
      },
    ]);
  };

  const handleUpdate = (id: string, values: ProductFormValues) => {
    setProducts((prev) =>
      prev.map((product) =>
        product.id === id
          ? {
              ...product,
              ...values,
              imageUrl: values.imageUrl || product.imageUrl,
            }
          : product,
      ),
    );
  };

  const handleDelete = (id: string) => {
    // TODO(Phase 3 Task 011): Server Action으로 products 테이블에서 삭제
    setProducts((prev) => prev.filter((product) => product.id !== id));
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">상품 관리</h1>
        <ProductFormDialog
          trigger={<Button>상품 등록</Button>}
          onSubmit={handleCreate}
        />
      </div>
      <div className="mt-6 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>이미지</TableHead>
              <TableHead>상품명</TableHead>
              <TableHead>가격</TableHead>
              <TableHead>재고 수량</TableHead>
              <TableHead>임계치</TableHead>
              <TableHead className="text-right">관리</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="bg-muted relative aspect-square w-10 overflow-hidden rounded-md">
                    {product.imageUrl && (
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    )}
                  </div>
                </TableCell>
                <TableCell>{product.name}</TableCell>
                <TableCell>{formatCurrencyKRW(product.price)}</TableCell>
                <TableCell>{product.stockQuantity}</TableCell>
                <TableCell>{product.threshold}</TableCell>
                <TableCell className="flex justify-end gap-2">
                  <ProductFormDialog
                    trigger={
                      <Button variant="outline" size="sm">
                        수정
                      </Button>
                    }
                    product={product}
                    onSubmit={(values) => handleUpdate(product.id, values)}
                  />
                  <DeleteConfirmDialog
                    trigger={
                      <Button variant="ghost" size="sm">
                        삭제
                      </Button>
                    }
                    title={`${product.name} 삭제`}
                    onConfirm={() => handleDelete(product.id)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </>
  );
}
