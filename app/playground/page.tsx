import type { Metadata } from "next";
import Link from "next/link";

import { PageHeader, PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Playground",
  description: `Mini-games, Art Roulette, and saved progress — coming soon on ${site.name}'s portfolio.`,
};

export default function PlaygroundPage() {
  return (
    <PageShell narrow>
      <PageHeader
        eyebrow="Playground"
        title="Coming soon"
        description="Art Roulette, mini-games, and a light achievement system — with optional sign-in to save scores and progress."
      />

      <div className="space-y-6 text-muted-foreground">
        <p>
          The playground is the fun half of this site: interactive experiments that reward curiosity. It&apos;s on the
          roadmap after the portfolio and Explore demos are solid.
        </p>
        <p>
          In the meantime, poke around{" "}
          <Link href="/explore" className="font-medium text-foreground underline-offset-4 hover:underline">
            Explore
          </Link>{" "}
          for live API demos, or{" "}
          <Link href="/auth/sign-up" className="font-medium text-foreground underline-offset-4 hover:underline">
            create an account
          </Link>{" "}
          so you&apos;re ready when scores and achievements roll out.
        </p>
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Button variant="outline" size="sm" asChild>
          <Link href="/explore">Browse Explore</Link>
        </Button>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </PageShell>
  );
}
