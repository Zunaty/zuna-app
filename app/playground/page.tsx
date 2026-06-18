import type { Metadata } from "next";

import { PlaygroundGameCard } from "@/components/playground/playground-game-card";
import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Playground",
  description: `Mini-games and interactive experiments on ${site.name}'s portfolio — Type Racer, Art Roulette, and more.`,
};

export default function PlaygroundPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Playground"
        title="Mini-games"
        description="Quick interactive experiments — scores save locally for now; sign in later when cloud sync ships."
      />

      <div className="grid gap-6 md:grid-cols-2">
        <PlaygroundGameCard
          title="Type Racer"
          description="Timed typing test with random words. Track WPM and accuracy — 30 or 60 second runs."
          href="/playground/type-racer"
          status="live"
        />
        <PlaygroundGameCard
          title="Art Roulette"
          description="Spin for art prompts, build a collection, and unlock shop items — the flagship playground game."
          href="/playground/art-roulette"
          status="coming-soon"
        />
      </div>
    </PageShell>
  );
}
