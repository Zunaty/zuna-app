import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ExplorePagination } from "@/components/explore/pagination";
import { SwapiResultsList } from "@/components/explore/swapi-results-list";
import { SwapiUnavailableNotice } from "@/components/explore/swapi-unavailable-notice";
import { PageEnter } from "@/components/motion/page-enter";
import { PageContentMotion } from "@/components/motion/page-content-motion";
import { PageShell } from "@/components/layout/page-shell";
import { fetchSwapiList, getSwapiResource, isSwapiResourceSlug } from "@/lib/star-wars/api";
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
  const result = await fetchSwapiList(resourceSlug, currentPage);

  if (result.status === "unavailable") {
    return (
      <PageShell>
        <PageEnter
          header={{
            eyebrow: "Explore · SWAPI",
            title: resource.label,
            description: "Browse entries from the Star Wars API.",
          }}
        >
          <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <Link href="/explore/star-wars" className="hover:text-foreground">
              Star Wars
            </Link>
            <span aria-hidden>/</span>
            <span className="text-foreground">{resource.label}</span>
          </div>

          <SwapiUnavailableNotice />
        </PageEnter>
      </PageShell>
    );
  }

  const { data } = result;
  const totalPages = Math.ceil(data.count / SWAPI_PAGE_SIZE);

  return (
    <PageShell>
      <PageEnter
        header={{
          eyebrow: "Explore · SWAPI",
          title: resource.label,
          description: `${data.count.toLocaleString()} entries from the Star Wars API.`,
        }}
      >
        <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
          <Link href="/explore/star-wars" className="hover:text-foreground">
            Star Wars
          </Link>
          <span aria-hidden>/</span>
          <span className="text-foreground">{resource.label}</span>
        </div>

        <SwapiResultsList
          resourceSlug={resourceSlug}
          results={data.results}
          staggerKey={`swapi-${resourceSlug}-${currentPage}`}
        />

        <PageContentMotion delay={0.16} className="mt-8">
          <ExplorePagination
            currentPage={currentPage}
            totalPages={totalPages}
            buildHref={(page) =>
              page === 1 ? `/explore/star-wars/${resourceSlug}` : `/explore/star-wars/${resourceSlug}?page=${page}`
            }
          />
        </PageContentMotion>
      </PageEnter>
    </PageShell>
  );
}
