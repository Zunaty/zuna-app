import type { Metadata } from "next";
import Link from "next/link";

import { TypeRacerGame } from "@/components/playground/type-racer/type-racer-game";
import { PageEnter } from "@/components/motion/page-enter";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Type Racer",
  description: `Timed typing test on ${site.name}'s playground — random words, WPM and accuracy scoring.`,
};

export default function TypeRacerPage() {
  return (
    <PageShell narrow>
      <PageEnter
        header={{
          eyebrow: "Playground",
          title: "Type Racer",
          description: "Type as many words as you can before the timer runs out. Best scores save in your browser.",
        }}
      >
        <TypeRacerGame />

        <div className="mt-10">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/playground">Back to Playground</Link>
          </Button>
        </div>
      </PageEnter>
    </PageShell>
  );
}
