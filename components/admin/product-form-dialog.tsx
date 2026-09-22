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
import { uploadProductImage } from "@/lib/actions/products";
import type { Product } from "@/lib/types/commerce";

interface ProductFormProps {
  product?: Product;
  onSubmit: (values: ProductFormValues) => Promise<void>;
}

function ProductForm({ product, onSubmit }: ProductFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    product?.image_url ?? null,
  );

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: product?.name ?? "",
      price: product?.price ?? 0,
      stockQuantity: product?.stock_quantity ?? 0,
      threshold: product?.threshold ?? 0,
      description: product?.description ?? "",
      imageUrl: product?.image_url ?? "",
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setImageFile(file);
    setPreviewUrl(
      file ? URL.createObjectURL(file) : (product?.image_url ?? null),
    );
  };

  const handleSubmit = async (values: ProductFormValues) => {
    setError(null);
    setIsSubmitting(true);

    try {
      let imageUrl = values.imageUrl;

      // 새 파일을 선택했으면 업로드 후 그 URL을 사용하고, 선택하지 않았으면
      // (수정 모드에서 이미지를 바꾸지 않은 경우) 기존 imageUrl을 그대로 둔다.
      if (imageFile) {
        const formData = new FormData();
        formData.set("file", imageFile);
        imageUrl = await uploadProductImage(formData);
      }

      await onSubmit({ ...values, imageUrl });
    } catch {
      setError("저장 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
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
      <Field>
        <FieldLabel htmlFor="image">이미지</FieldLabel>
        {previewUrl && (
          // eslint-disable-next-line @next/next/no-img-element -- blob: 미리보기 URL은 next/image의 remotePatterns 대상이 아니라 일반 img로 렌더링한다.
          <img
            src={previewUrl}
            alt="상품 이미지 미리보기"
            className="bg-muted h-24 w-24 rounded-md object-cover"
          />
        )}
        <Input
          id="image"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
      </Field>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <DialogFooter>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "저장 중..." : product ? "수정" : "등록"}
        </Button>
      </DialogFooter>
    </form>
  );
}

interface ProductFormDialogProps {
  trigger: React.ReactNode;
  product?: Product;
  onSubmit: (values: ProductFormValues) => Promise<void>;
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
            onSubmit={async (values) => {
              await onSubmit(values);
              setOpen(false);
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
