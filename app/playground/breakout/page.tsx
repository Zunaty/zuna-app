import type { Metadata } from "next";

import { BreakoutGame } from "@/components/playground/breakout/breakout-game";
import { PlaygroundGameShell } from "@/components/playground/playground-game-shell";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Breakout",
  description: `Retro brick breaker on ${site.name}'s playground — classic levels or a roguelite draft mode with boons and curses.`,
};

export default function BreakoutPage() {
  return (
    <PlaygroundGameShell
      title="Breakout"
      description="Break bricks, chase volleys, and draft modifiers in Roguelite mode. Best scores sync to your account."
      guestDescription="Break bricks, chase volleys, and draft modifiers in Roguelite mode. Best scores save in your browser."
    >
      <BreakoutGame />
    </PlaygroundGameShell>
  );
}
