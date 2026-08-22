"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { productSchema, type ProductFormValues } from "@/lib/schemas/product";
import type { MockProduct } from "@/lib/mock/products";

interface ProductFormProps {
  product?: MockProduct;
  onSubmit: (values: ProductFormValues) => void;
}

function ProductForm({ product, onSubmit }: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      price: product?.price ?? 0,
      stockQuantity: product?.stockQuantity ?? 0,
      threshold: product?.threshold ?? 0,
      description: product?.description ?? "",
      imageUrl: product?.imageUrl ?? "",
    },
  });

  const handleSubmit = (values: ProductFormValues) => {
    // TODO(Phase 3 Task 011): Server Action으로 products 테이블에 반영
    onSubmit(values);
  };

  return (
    <form
      onSubmit={form.handleSubmit(handleSubmit)}
      className="flex flex-col gap-4"
    >
      <Controller
        name="name"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="name">상품명</FieldLabel>
            <Input {...field} id="name" aria-invalid={fieldState.invalid} />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
      <Controller
        name="price"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="price">가격</FieldLabel>
            <Input
              {...field}
              id="price"
              type="number"
              onChange={(e) => field.onChange(e.target.valueAsNumber)}
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
      <Controller
        name="stockQuantity"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="stockQuantity">재고 수량</FieldLabel>
            <Input
              {...field}
              id="stockQuantity"
              type="number"
              onChange={(e) => field.onChange(e.target.valueAsNumber)}
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
      <Controller
        name="threshold"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="threshold">재고 임계치</FieldLabel>
            <Input
              {...field}
              id="threshold"
              type="number"
              onChange={(e) => field.onChange(e.target.valueAsNumber)}
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
      <Controller
        name="description"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="description">설명</FieldLabel>
            <Textarea
              {...field}
              id="description"
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
      <Controller
        name="imageUrl"
        control={form.control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="imageUrl">이미지 URL</FieldLabel>
            <Input
              {...field}
              id="imageUrl"
              placeholder="https://picsum.photos/seed/example/600/600"
              aria-invalid={fieldState.invalid}
            />
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
      <DialogFooter>
        <Button type="submit">{product ? "수정" : "등록"}</Button>
      </DialogFooter>
    </form>
  );
}

interface ProductFormDialogProps {
  trigger: React.ReactNode;
  product?: MockProduct;
  onSubmit: (values: ProductFormValues) => void;
}

export function ProductFormDialog({
  trigger,
  product,
  onSubmit,
}: ProductFormDialogProps) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{product ? "상품 수정" : "상품 등록"}</DialogTitle>
        </DialogHeader>
        {open && (
          <ProductForm
            key={product?.id ?? "new"}
            product={product}
            onSubmit={(values) => {
              onSubmit(values);
              setOpen(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
