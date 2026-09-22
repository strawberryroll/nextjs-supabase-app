"use client";

import Image from "next/image";
import { toast } from "sonner";
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
import {
  createProduct,
  deleteProduct,
  updateProduct,
} from "@/lib/actions/products";
import { formatCurrencyKRW } from "@/lib/format";
import type { Product } from "@/lib/types/commerce";
import type { ProductFormValues } from "@/lib/schemas/product";

export function AdminProductsTable({ products }: { products: Product[] }) {
  const handleCreate = async (values: ProductFormValues) => {
    await createProduct(values);
    toast.success("상품이 등록되었습니다");
  };

  const handleUpdate = async (id: string, values: ProductFormValues) => {
    await updateProduct(id, values);
    toast.success("상품이 수정되었습니다");
  };

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
    toast.success("상품이 삭제되었습니다");
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div />
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
                    {product.image_url && (
                      <Image
                        src={product.image_url}
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
                <TableCell>{product.stock_quantity}</TableCell>
                <TableCell>{product.threshold}</TableCell>
                <TableCell className="flex justify-end gap-2">
                  <ProductFormDialog
                    trigger={
                      <Button variant="outline" size="sm">
                        수정
                      </Button>
                    }
                    product={product}
                    onSubmit={(values: ProductFormValues) =>
                      handleUpdate(product.id, values)
                    }
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
