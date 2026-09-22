"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ProductSort } from "@/lib/queries/products";

const SORT_OPTIONS: { value: ProductSort; label: string }[] = [
  { value: "newest", label: "최신순" },
  { value: "price_asc", label: "가격 낮은순" },
  { value: "price_desc", label: "가격 높은순" },
];

export function ProductSearchControls() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const q = (formData.get("q") as string).trim();

    const params = new URLSearchParams(searchParams);
    if (q) {
      params.set("q", q);
    } else {
      params.delete("q");
    }
    params.delete("page");
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams);
    if (value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", value);
    }
    params.delete("page");
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <form
        onSubmit={handleSearchSubmit}
        className="flex max-w-sm flex-1 gap-2"
      >
        <Input
          name="q"
          placeholder="상품 검색"
          defaultValue={searchParams.get("q") ?? ""}
        />
      </form>
      <Select
        defaultValue={searchParams.get("sort") ?? "newest"}
        onValueChange={handleSortChange}
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
