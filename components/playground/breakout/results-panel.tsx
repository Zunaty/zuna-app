"use client";

import { m } from "framer-motion";

import { Button } from "@/components/ui/button";
import { BREAKOUT_MODE_LABEL } from "@/lib/breakout/constants";
import { BREAKOUT_MODIFIERS } from "@/lib/breakout/modifiers";
import type { BreakoutSnapshot } from "@/lib/breakout/use-breakout";
import { fadeInUp, instantTransition, motionTransition } from "@/lib/motion/variants";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

type ResultsPanelProps = {
  snapshot: BreakoutSnapshot;
  isPersonalBest: boolean;
  onPlayAgain: () => void;
  onChangeMode: () => void;
};

export function ResultsPanel({ snapshot, isPersonalBest, onPlayAgain, onChangeMode }: ResultsPanelProps) {
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
          {BREAKOUT_MODE_LABEL[snapshot.mode]}
        </p>
        <h2 className="mt-1 text-2xl font-bold">{snapshot.won ? "You cleared it all!" : "Game over"}</h2>
        {isPersonalBest ? <p className="mt-1 text-sm font-medium text-primary">New personal best!</p> : null}
      </div>

      <dl className="grid w-full max-w-xs gap-2 text-sm">
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">Score</dt>
          <dd className="font-mono text-lg font-semibold tabular-nums">{snapshot.score.toLocaleString("en-US")}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">Levels cleared</dt>
          <dd className="font-mono font-medium tabular-nums">{snapshot.levelsCleared}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <dt className="text-muted-foreground">Best volley</dt>
          <dd className="font-mono font-medium tabular-nums">{snapshot.maxVolley} bricks</dd>
        </div>
        {snapshot.mode === "roguelite" && snapshot.modifiers.length > 0 ? (
          <div className="mt-1 border-t border-border pt-2">
            <dt className="text-muted-foreground">Modifiers</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {snapshot.modifiers.map((id, index) => (
                <span
                  key={`${id}-${index}`}
                  className={`rounded-full border px-2 py-0.5 text-xs ${
                    BREAKOUT_MODIFIERS[id].kind === "curse"
                      ? "border-purple-500/40 text-purple-500"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {BREAKOUT_MODIFIERS[id].name}
                </span>
              ))}
            </dd>
          </div>
        ) : null}
      </dl>

      <div className="flex gap-3">
        <Button onClick={onPlayAgain}>Play again</Button>
        <Button variant="outline" onClick={onChangeMode}>
          Change mode
        </Button>
      </div>
    </m.div>
  );
}
