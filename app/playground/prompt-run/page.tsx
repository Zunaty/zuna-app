import type { Metadata } from "next";
import Link from "next/link";

import { PromptRunGame } from "@/components/playground/prompt-run/prompt-run-game";
import { PlaygroundScoreProvider } from "@/components/playground/playground-score-provider";
import { PageEnter } from "@/components/motion/page-enter";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/data/site";
import { getUserPlaygroundScores } from "@/lib/playground/server-scores";

export const metadata: Metadata = {
  title: "Prompt Run",
  description: `Roguelike prompt builder on ${site.name}'s playground — draft categories, score your run, and assemble prompts for AI art.`,
};

export default async function PromptRunPage() {
  const { userId, scores } = await getUserPlaygroundScores();

  return (
    <PageShell narrow>
      <PageEnter
        header={{
          eyebrow: "Playground",
          title: "Prompt Run",
          description:
            "Draft through prompt categories, chase rarity streaks, spend in the shop, then generate AI art from your assembled prompt.",
        }}
      >
        <PlaygroundScoreProvider isAuthenticated={userId !== null} serverScores={scores}>
          <PromptRunGame />
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
