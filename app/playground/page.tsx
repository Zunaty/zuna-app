import type { Metadata } from "next";

import { PlaygroundGameCard } from "@/components/playground/playground-game-card";
import { PageEnter } from "@/components/motion/page-enter";
import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";
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
          <StaggerItem>
            <PlaygroundGameCard
              title="Type Racer"
              description="Timed typing tests — random words, sentences, or paragraphs with WPM and accuracy scoring."
              href="/playground/type-racer"
              status="live"
            />
          </StaggerItem>
          <StaggerItem>
            <PlaygroundGameCard
              title="Prompt Run"
              description="Roguelike prompt builder — draft categories, shop for buffs, then generate art from your run."
              href="/playground/prompt-run"
              status="live"
            />
          </StaggerItem>
        </StaggerChildren>
      </PageEnter>
    </PageShell>
  );
}
