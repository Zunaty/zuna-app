import type { Metadata } from "next";

import { ExploreZoneCard } from "@/components/explore/explore-zone-card";
import { PageEnter } from "@/components/motion/page-enter";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";
import { PageShell } from "@/components/layout/page-shell";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Explore",
  description: `API-driven demos on ${site.name}'s portfolio — browse Pokémon, Star Wars, and Mapbox geocoding.`,
};

export default function ExplorePage() {
  return (
    <PageShell>
      <PageEnter
        header={{
          eyebrow: "Explore",
          title: "API playgrounds",
          description: "Live data from public APIs — a small taste of how I wire external services into polished UI.",
        }}
      >
        <StaggerChildren className="grid gap-6 md:grid-cols-2" staggerKey="explore-zones">
          <StaggerItem>
            <ExploreZoneCard
              eyebrow="PokéAPI"
              title="Pokédex"
              description="Paginated creature list, detail pages with stats and types, and browser-saved favorites."
              href="/explore/pokemon"
            />
          </StaggerItem>
          <StaggerItem>
            <ExploreZoneCard
              eyebrow="SWAPI"
              title="Star Wars"
              description="Browse films, characters, planets, species, starships, and vehicles from the franchise."
              href="/explore/star-wars"
            />
          </StaggerItem>
          <StaggerItem>
            <ExploreZoneCard
              eyebrow="Mapbox"
              title="Geocoding"
              description="Search for a place and fly the map to Mapbox Geocoding results — server token, client map."
              href="/explore/geo"
            />
          </StaggerItem>
        </StaggerChildren>
      </PageEnter>
    </PageShell>
  );
}
