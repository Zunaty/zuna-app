import type { Metadata } from "next";

import { ComingSoonZones, FeaturedProjects, HomeHero, HomeSkills } from "@/components/portfolio/home-sections";
import { PageShell } from "@/components/layout/page-shell";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: site.name,
  description: site.tagline,
  openGraph: {
    title: `${site.name} — ${site.title}`,
    description: site.tagline,
  },
};

export default function HomePage() {
  return (
    <PageShell className="flex flex-col gap-16 sm:gap-20">
      <HomeHero />
      <FeaturedProjects />
      <HomeSkills />
      <ComingSoonZones />
    </PageShell>
  );
}
