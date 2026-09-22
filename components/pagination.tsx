import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

export function Pagination({
  currentPage,
  totalPages,
  buildHref,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-8 flex items-center justify-center gap-4">
      <Button
        asChild
        variant="outline"
        size="sm"
        disabled={currentPage <= 1}
        className={currentPage <= 1 ? "pointer-events-none" : undefined}
      >
        <Link
          href={buildHref(currentPage - 1)}
          aria-disabled={currentPage <= 1}
          tabIndex={currentPage <= 1 ? -1 : undefined}
        >
          이전
        </Link>
      </Button>
      <span className="text-muted-foreground text-sm">
        {currentPage} / {totalPages}
      </span>
      <Button
        asChild
        variant="outline"
        size="sm"
        disabled={currentPage >= totalPages}
        className={
          currentPage >= totalPages ? "pointer-events-none" : undefined
        }
      >
        <Link
          href={buildHref(currentPage + 1)}
          aria-disabled={currentPage >= totalPages}
          tabIndex={currentPage >= totalPages ? -1 : undefined}
        >
          다음
        </Link>
      </Button>
    </div>
  );
}
