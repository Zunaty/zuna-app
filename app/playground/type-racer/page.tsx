import type { Metadata } from "next";

import { TypeRacerGame } from "@/components/playground/type-racer/type-racer-game";
import { PlaygroundGameShell } from "@/components/playground/playground-game-shell";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Type Racer",
  description: `Timed typing test on ${site.name}'s playground — random words, WPM and accuracy scoring.`,
};

export default function TypeRacerPage() {
  return (
    <PlaygroundGameShell
      title="Type Racer"
      description="Type random words, a sentence, or a short paragraph. Best scores sync to your account."
      guestDescription="Type random words, a sentence, or a short paragraph. Best scores save in your browser."
    >
      <TypeRacerGame />
    </PlaygroundGameShell>
  );
}
