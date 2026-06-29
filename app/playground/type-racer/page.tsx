import type { Metadata } from "next";
import Link from "next/link";

import { TypeRacerGame } from "@/components/playground/type-racer/type-racer-game";
import { PlaygroundScoreProvider } from "@/components/playground/playground-score-provider";
import { PageEnter } from "@/components/motion/page-enter";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/data/site";
import { getUserPlaygroundScores } from "@/lib/playground/server-scores";

export const metadata: Metadata = {
  title: "Type Racer",
  description: `Timed typing test on ${site.name}'s playground — random words, WPM and accuracy scoring.`,
};

export default async function TypeRacerPage() {
  const { userId, scores } = await getUserPlaygroundScores();

  return (
    <PageShell narrow>
      <PageEnter
        header={{
          eyebrow: "Playground",
          title: "Type Racer",
          description: userId
            ? "Type random words, a sentence, or a short paragraph. Best scores sync to your account."
            : "Type random words, a sentence, or a short paragraph. Best scores save in your browser.",
        }}
      >
        <PlaygroundScoreProvider isAuthenticated={userId !== null} serverScores={scores}>
          <TypeRacerGame />
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
