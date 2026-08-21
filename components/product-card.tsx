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

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  inStock: boolean;
}

export function ProductCard({ id, name, price, inStock }: ProductCardProps) {
  return (
    <Link href={`/products/${id}`}>
      <Card className="h-full transition-shadow hover:shadow-md">
        <CardHeader>
          <CardTitle className="text-base">{name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-foreground text-lg font-semibold">
            {formatCurrencyKRW(price)}
          </p>
        </CardContent>
        <CardFooter>
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
