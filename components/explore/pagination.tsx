import Link from "next/link";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
};

export function ExplorePagination({ currentPage, totalPages, buildHref }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const prevPage = currentPage > 1 ? currentPage - 1 : null;
  const nextPage = currentPage < totalPages ? currentPage + 1 : null;

  return (
    <nav className="flex items-center justify-between gap-4 border-t border-border pt-6" aria-label="Pagination">
      <div>
        {prevPage ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={buildHref(prevPage)}>Previous</Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Previous
          </Button>
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </p>
      <div>
        {nextPage ? (
          <Button variant="outline" size="sm" asChild>
            <Link href={buildHref(nextPage)}>Next</Link>
          </Button>
        ) : (
          <Button variant="outline" size="sm" disabled>
            Next
          </Button>
        )}
      </div>
    </nav>
  );
}

type PageNumberPaginationProps = {
  currentPage: number;
  totalPages: number;
  buildHref: (page: number) => string;
  className?: string;
};

export function PageNumberPagination({ currentPage, totalPages, buildHref, className }: PageNumberPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const windowSize = 5;
  const start = Math.max(1, currentPage - Math.floor(windowSize / 2));
  const end = Math.min(totalPages, start + windowSize - 1);
  const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index);

  return (
    <nav className={cn("flex flex-wrap items-center justify-center gap-2", className)} aria-label="Pagination">
      {pages.map((page) => (
        <Button key={page} variant={page === currentPage ? "default" : "outline"} size="sm" asChild>
          <Link href={buildHref(page)} aria-current={page === currentPage ? "page" : undefined}>
            {page}
          </Link>
        </Button>
      ))}
    </nav>
  );
}
