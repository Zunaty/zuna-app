"use client";

import { m } from "framer-motion";

import { Button } from "@/components/ui/button";
import { ASTEROIDS_MODE_LABEL, CLASSIC_WAVE_COUNT } from "@/lib/asteroids/constants";
import type { AsteroidsSnapshot } from "@/lib/asteroids/use-asteroids";
import { fadeInUp, instantTransition, motionTransition } from "@/lib/motion/variants";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

type ResultsPanelProps = {
  snapshot: AsteroidsSnapshot;
  onPlayAgain: () => void;
  onChangeMode: () => void;
};

export function ResultsPanel({ snapshot, onPlayAgain, onChangeMode }: ResultsPanelProps) {
  const reduceMotion = useReducedMotion();

  return (
    <m.div
      variants={fadeInUp}
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      transition={reduceMotion ? instantTransition : motionTransition}
      className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-background/90 p-6 backdrop-blur-sm"
    >
      <div className="text-center">
        <p className="text-xs font-medium uppercase tracking-wider text-primary">
          {ASTEROIDS_MODE_LABEL[snapshot.mode]}
        </p>
        <h2 className="mt-1 text-2xl font-bold">{snapshot.won ? "You cleared it all!" : "Game over"}</h2>
      </div>

      <dl className="grid w-full max-w-xs gap-2 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">Score</dt>
          <dd className="font-mono text-lg font-semibold tabular-nums">{snapshot.score.toLocaleString("en-US")}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">Waves cleared</dt>
          <dd className="font-mono font-medium tabular-nums">
            {snapshot.wavesCleared}
            {snapshot.mode === "classic" ? ` / ${CLASSIC_WAVE_COUNT}` : ""}
          </dd>
        </div>
      </dl>

      <div className="flex gap-3">
        <Button autoFocus onClick={onPlayAgain}>
          Play again
        </Button>
        <Button variant="outline" onClick={onChangeMode}>
          Back to menu
        </Button>
      </div>
    </m.div>
  );
}
