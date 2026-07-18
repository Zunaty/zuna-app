import type { Metadata } from "next";

import { PromptRunGame } from "@/components/playground/prompt-run/prompt-run-game";
import { PlaygroundGameShell } from "@/components/playground/playground-game-shell";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Prompt Run",
  description: `Roguelike prompt builder on ${site.name}'s playground — draft categories, score your run, and assemble prompts for AI art.`,
};

export default function PromptRunPage() {
  return (
    <PlaygroundGameShell
      title="Prompt Run"
      description="Draft through prompt categories, chase rarity streaks, spend in the shop, then generate AI art from your assembled prompt."
    >
      <PromptRunGame />
    </PlaygroundGameShell>
  );
}
