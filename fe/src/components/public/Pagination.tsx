import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
  page: number;
  totalPages: number;
  buildHref: (page: number) => string;
}

export function Pagination({ page, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = buildPageNumbers(page, totalPages);

  return (
    <nav className="flex items-center justify-center gap-1 mt-12">
      {/* Prev */}
      {page > 1 ? (
        <Link
          href={buildHref(page - 1)}
          className="flex items-center justify-center h-9 w-9 rounded-lg border border-border hover:bg-muted transition-colors"
          aria-label="Trang trước"
        >
          <ChevronLeft size={16} />
        </Link>
      ) : (
        <span className="flex items-center justify-center h-9 w-9 rounded-lg border border-border opacity-40 cursor-not-allowed">
          <ChevronLeft size={16} />
        </span>
      )}

      {/* Page numbers */}
      {pages.map((p, i) =>
        p === "..." ? (
          <span
            key={`ellipsis-${i}`}
            className="flex items-center justify-center h-9 w-9 text-sm text-muted-foreground"
          >
            …
          </span>
        ) : (
          <Link
            key={p}
            href={buildHref(p as number)}
            className={`flex items-center justify-center h-9 w-9 rounded-lg text-sm font-medium transition-colors ${
              p === page
                ? "bg-primary text-primary-foreground"
                : "border border-border hover:bg-muted"
            }`}
            aria-current={p === page ? "page" : undefined}
          >
            {p}
          </Link>
        ),
      )}

      {/* Next */}
      {page < totalPages ? (
        <Link
          href={buildHref(page + 1)}
          className="flex items-center justify-center h-9 w-9 rounded-lg border border-border hover:bg-muted transition-colors"
          aria-label="Trang sau"
        >
          <ChevronRight size={16} />
        </Link>
      ) : (
        <span className="flex items-center justify-center h-9 w-9 rounded-lg border border-border opacity-40 cursor-not-allowed">
          <ChevronRight size={16} />
        </span>
      )}
    </nav>
  );
}

function buildPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "...")[] = [1];
  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("...");
  pages.push(total);

  return pages;
}
