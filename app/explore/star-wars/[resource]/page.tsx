import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ExplorePagination } from "@/components/explore/pagination";
import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { fetchSwapiList, getSwapiListItemLabel, getSwapiResource, isSwapiResourceSlug } from "@/lib/star-wars/api";
import { site } from "@/lib/data/site";

const SWAPI_PAGE_SIZE = 10;

type StarWarsResourcePageProps = {
  params: Promise<{ resource: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: StarWarsResourcePageProps): Promise<Metadata> {
  const { resource: resourceSlug } = await params;
  const resource = getSwapiResource(resourceSlug);

  return {
    title: resource ? `Star Wars · ${resource.label}` : "Star Wars",
    description: resource
      ? `Browse ${resource.label.toLowerCase()} from SWAPI on ${site.name}'s portfolio.`
      : undefined,
  };
}

export default async function StarWarsResourcePage({ params, searchParams }: StarWarsResourcePageProps) {
  const { resource: resourceSlug } = await params;
  const { page: pageParam } = await searchParams;

  if (!isSwapiResourceSlug(resourceSlug)) {
    notFound();
  }

  const resource = getSwapiResource(resourceSlug);
  if (!resource) {
    notFound();
  }

  const currentPage = Math.max(1, Number.parseInt(pageParam ?? "1", 10) || 1);
  const data = await fetchSwapiList(resourceSlug, currentPage);
  const totalPages = Math.ceil(data.count / SWAPI_PAGE_SIZE);

  return (
    <PageShell>
      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
        <Link href="/explore/star-wars" className="hover:text-foreground">
          Star Wars
        </Link>
        <span aria-hidden>/</span>
        <span className="text-foreground">{resource.label}</span>
      </div>

      <PageHeader
        eyebrow="Explore · SWAPI"
        title={resource.label}
        description={`${data.count.toLocaleString()} entries from the Star Wars API.`}
      />

      <ul className="divide-y divide-border rounded-xl border border-border bg-card">
        {data.results.map((item) => {
          const id = item.url.match(/\/(\d+)\/?$/)?.[1];
          if (!id) {
            return null;
          }

          return (
            <li key={item.url}>
              <Link
                href={`/explore/star-wars/${resourceSlug}/${id}`}
                className="flex items-center justify-between gap-4 px-4 py-4 transition-colors hover:bg-muted/50 sm:px-6"
              >
                <span className="font-medium">{getSwapiListItemLabel(item)}</span>
                <span className="text-sm text-muted-foreground">View →</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <ExplorePagination
        currentPage={currentPage}
        totalPages={totalPages}
        buildHref={(page) =>
          page === 1 ? `/explore/star-wars/${resourceSlug}` : `/explore/star-wars/${resourceSlug}?page=${page}`
        }
      />
    </PageShell>
  );
}
