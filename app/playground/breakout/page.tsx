import type { Metadata } from "next";
import Link from "next/link";

import { BreakoutGame } from "@/components/playground/breakout/breakout-game";
import { PlaygroundScoreProvider } from "@/components/playground/playground-score-provider";
import { PageEnter } from "@/components/motion/page-enter";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/data/site";
import { getUserPlaygroundScores } from "@/lib/playground/server-scores";

export const metadata: Metadata = {
  title: "Breakout",
  description: `Retro brick breaker on ${site.name}'s playground — classic levels or a roguelite draft mode with boons and curses.`,
};

export default async function BreakoutPage() {
  const { userId, scores } = await getUserPlaygroundScores();

  return (
    <PageShell narrow>
      <PageEnter
        header={{
          eyebrow: "Playground",
          title: "Breakout",
          description: userId
            ? "Break bricks, chase volleys, and draft modifiers in Roguelite mode. Best scores sync to your account."
            : "Break bricks, chase volleys, and draft modifiers in Roguelite mode. Best scores save in your browser.",
        }}
      >
        <PlaygroundScoreProvider isAuthenticated={userId !== null} serverScores={scores}>
          <BreakoutGame />
        </PlaygroundScoreProvider>

        <div className="mt-10">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/playground">Back to Playground</Link>
          </Button>
        </div>
      </PageEnter>
    </PageShell>
  );
}
