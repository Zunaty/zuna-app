import type { Metadata } from "next";
import Link from "next/link";

import { ExploreZoneCard } from "@/components/explore/explore-zone-card";
import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { SWAPI_RESOURCES } from "@/lib/star-wars/api";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Star Wars",
  description: `Browse Star Wars franchise data from SWAPI on ${site.name}'s portfolio.`,
};

export default function StarWarsPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Explore · SWAPI"
        title="Star Wars archive"
        description="Pick a category to browse characters, worlds, ships, and more — all live from the Star Wars API."
      />

      <div className="mb-6">
        <Link href="/explore" className="text-sm text-muted-foreground hover:text-foreground">
          ← All explore zones
        </Link>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {SWAPI_RESOURCES.map((resource) => (
          <ExploreZoneCard
            key={resource.slug}
            eyebrow="SWAPI"
            title={resource.label}
            description={resource.description}
            href={`/explore/star-wars/${resource.slug}`}
          />
        ))}
      </div>
    </PageShell>
  );
}
