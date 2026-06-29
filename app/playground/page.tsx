import type { Metadata } from "next";

import { PlaygroundHubGames } from "@/components/playground/playground-hub-games";
import { PageEnter } from "@/components/motion/page-enter";
import { StaggerChildren } from "@/components/motion/stagger-children";
import { PageShell } from "@/components/layout/page-shell";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Playground",
  description: `Mini-games and interactive experiments on ${site.name}'s portfolio — Type Racer, Prompt Run, and more.`,
};

export default function PlaygroundPage() {
  return (
    <PageShell>
      <PageEnter
        header={{
          eyebrow: "Playground",
          title: "Mini-games",
          description:
            "Quick interactive experiments — scores save locally for now; sign in later when cloud sync ships.",
        }}
      >
        <StaggerChildren className="grid gap-6 md:grid-cols-2" staggerKey="playground-games">
          <PlaygroundHubGames />
        </StaggerChildren>
      </PageEnter>
    </PageShell>
  );
}
