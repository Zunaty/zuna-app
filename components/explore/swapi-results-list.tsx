"use client";

import Link from "next/link";

import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";
import { getSwapiListItemLabel } from "@/lib/star-wars/api";
import type { SwapiListItem } from "@/lib/star-wars/types";

type SwapiResultsListProps = {
  resourceSlug: string;
  results: SwapiListItem[];
  staggerKey: string;
};

export function SwapiResultsList({ resourceSlug, results, staggerKey }: SwapiResultsListProps) {
  return (
    <StaggerChildren
      as="ul"
      className="divide-y divide-border rounded-xl border border-border bg-card"
      staggerKey={staggerKey}
    >
      {results.map((item) => {
        const id = item.url.match(/\/(\d+)\/?$/)?.[1];
        if (!id) {
          return null;
        }

        return (
          <StaggerItem key={item.url} as="li">
            <Link
              href={`/explore/star-wars/${resourceSlug}/${id}`}
              className="flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-muted/50 sm:px-6"
            >
              <span className="font-medium">{getSwapiListItemLabel(item)}</span>
              <span className="text-sm text-muted-foreground">View →</span>
            </Link>
          </StaggerItem>
        );
      })}
    </StaggerChildren>
  );
}
