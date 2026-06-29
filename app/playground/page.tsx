import type { Metadata } from "next";

import { PlaygroundHubGames } from "@/components/playground/playground-hub-games";
import { PlaygroundScoreProvider } from "@/components/playground/playground-score-provider";
import { PageEnter } from "@/components/motion/page-enter";
import { StaggerChildren } from "@/components/motion/stagger-children";
import { PageShell } from "@/components/layout/page-shell";
import { site } from "@/lib/data/site";
import { getUserPlaygroundScores } from "@/lib/playground/server-scores";

export const metadata: Metadata = {
  title: "Playground",
  description: `Mini-games and interactive experiments on ${site.name}'s portfolio — Type Racer, Prompt Run, and more.`,
};

export default async function PlaygroundPage() {
  const { userId, scores } = await getUserPlaygroundScores();

  return (
    <PageShell>
      <PageEnter
        header={{
          eyebrow: "Playground",
          title: "Mini-games",
          description: userId
            ? "Quick interactive experiments — scores sync to your account when you sign in."
            : "Quick interactive experiments — scores save locally; sign in to sync across devices.",
        }}
      >
        <PlaygroundScoreProvider isAuthenticated={userId !== null} serverScores={scores}>
          <StaggerChildren className="grid gap-6 md:grid-cols-2" staggerKey="playground-games">
            <PlaygroundHubGames />
          </StaggerChildren>
        </PlaygroundScoreProvider>
      </PageEnter>
    </PageShell>
  );
}
