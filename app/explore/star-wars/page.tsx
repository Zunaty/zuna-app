import type { Metadata } from "next";
import Link from "next/link";

import { ExploreZoneCard } from "@/components/explore/explore-zone-card";
import { PageEnter } from "@/components/motion/page-enter";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";
import { PageShell } from "@/components/layout/page-shell";
import { SWAPI_RESOURCES } from "@/lib/star-wars/api";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Star Wars",
  description: `Browse Star Wars franchise data from SWAPI on ${site.name}'s portfolio.`,
};

export default function StarWarsPage() {
  return (
    <PageShell>
      <PageEnter
        header={{
          eyebrow: "Explore · SWAPI",
          title: "Star Wars archive",
          description:
            "Pick a category to browse characters, worlds, ships, and more — all live from the Star Wars API.",
        }}
      >
        <div className="mb-6">
          <Link href="/explore" className="text-sm text-muted-foreground hover:text-foreground">
            ← All explore zones
          </Link>
        </div>

        <StaggerChildren className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" staggerKey="star-wars-resources">
          {SWAPI_RESOURCES.map((resource) => (
            <StaggerItem key={resource.slug}>
              <ExploreZoneCard
                eyebrow="SWAPI"
                title={resource.label}
                description={resource.description}
                href={`/explore/star-wars/${resource.slug}`}
              />
            </StaggerItem>
          ))}
        </StaggerChildren>
      </PageEnter>
    </PageShell>
  );
}
