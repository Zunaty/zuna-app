import type { Metadata } from "next";
import Link from "next/link";

import { GeoSearchMapSection } from "@/components/explore/geo-search-map-section";
import { PageEnter } from "@/components/motion/page-enter";
import { PageShell } from "@/components/layout/page-shell";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Geocoding",
  description: `Mapbox geocoding fly-to demo on ${site.name}'s portfolio — search a place and animate the map.`,
};

export default function GeoExplorePage() {
  return (
    <PageShell>
      <PageEnter
        header={{
          eyebrow: "Explore · Mapbox",
          title: "Geocoding fly-to",
          description:
            "Forward geocoding through a server route — type a place name and watch the map animate to the result.",
        }}
      >
        <div className="mb-6">
          <Link href="/explore" className="text-sm text-muted-foreground hover:text-foreground">
            ← All explore zones
          </Link>
        </div>

        <GeoSearchMapSection />
      </PageEnter>
    </PageShell>
  );
}
