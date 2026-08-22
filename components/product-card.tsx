import Image from "next/image";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
    <Link href={`/products/${id}`}>
      <Card className="h-full overflow-hidden py-0 transition-shadow hover:shadow-md">
        <div className="bg-muted relative aspect-square overflow-hidden">
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={cn("object-cover", !inStock && "grayscale")}
          />
        </div>
        <CardHeader>
          <CardTitle className="text-base">{name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground text-lg font-semibold">
            {formatCurrencyKRW(price)}
          </p>
        </CardContent>
        <CardFooter className="pb-6">
          {inStock ? (
            <Badge variant="outline">재고 있음</Badge>
          ) : (
            <Badge variant="destructive">품절</Badge>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
