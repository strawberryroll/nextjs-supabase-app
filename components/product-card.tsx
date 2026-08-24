import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyKRW } from "@/lib/format";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
  imageUrl: string;
}

export function ProductCard({
  id,
  name,
  price,
  inStock,
  imageUrl,
}: ProductCardProps) {
  return (
    <Link href={`/products/${id}`} className="group block">
      <div className="bg-muted relative aspect-square overflow-hidden rounded-2xl transition-all duration-300 ease-out group-hover:-translate-y-0.5 group-hover:shadow-lg">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className={cn(
            "object-cover transition-transform duration-300 ease-out group-hover:scale-105",
            !inStock && "grayscale",
          )}
        />
      </div>

      <div className="flex flex-col gap-1 pt-3">
        {inStock ? (
          <Badge variant="outline" className="w-fit">
            재고 있음
          </Badge>
        ) : (
          <Badge variant="destructive" className="w-fit">
            품절
          </Badge>
        )}
        <h3 className="text-foreground line-clamp-2 text-sm leading-tight font-medium">
          {name}
        </h3>
        <p className="text-foreground text-lg font-bold">
          {formatCurrencyKRW(price)}
        </p>
      </div>
    </Link>
  );
}
