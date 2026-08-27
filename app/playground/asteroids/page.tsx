import type { Metadata } from "next";

import { AsteroidsGame } from "@/components/playground/asteroids/asteroids-game";
import { PlaygroundGameShell } from "@/components/playground/playground-game-shell";
import { site } from "@/lib/data/site";

export const metadata: Metadata = {
  title: "Asteroids",
  description: `Wrap-around arena shooter on ${site.name}'s playground — rotate, thrust, and split the rocks.`,
};

export default function AsteroidsPage() {
  return (
    <PlaygroundGameShell
      title="Asteroids"
      description="Rotate, thrust, and fire. Rocks wrap and split. Classic is live; Roguelite drafts come next."
      guestDescription="Rotate, thrust, and fire. Rocks wrap and split. Scores stay in this browser for now."
    >
      <AsteroidsGame />
    </PlaygroundGameShell>
  );
}
