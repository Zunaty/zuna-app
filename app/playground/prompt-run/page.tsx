import type { Metadata } from "next";
import Link from "next/link";

import { PromptRunGame } from "@/components/playground/prompt-run/prompt-run-game";
import { PageEnter } from "@/components/motion/page-enter";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Prompt Run",
  description: `Roguelike prompt builder on ${site.name}'s playground — draft categories, score your run, and assemble prompts for AI art.`,
};

export default function PromptRunPage() {
  return (
    <PageShell narrow>
      <PageEnter
        header={{
          eyebrow: "Playground",
          title: "Prompt Run",
          description:
            "Draft through prompt categories, chase rarity streaks, and build a run-long prompt. AI image generation ships in a later phase.",
        }}
      >
        <PromptRunGame />

        <div className="mt-10">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/playground">Back to Playground</Link>
          </Button>
        </div>
      </PageEnter>
    </PageShell>
  );
}
