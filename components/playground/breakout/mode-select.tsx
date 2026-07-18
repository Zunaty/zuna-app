"use client";

import { m } from "framer-motion";

import { BREAKOUT_MODE_LABEL, type BreakoutMode } from "@/lib/breakout/constants";
import type { BreakoutBestScores } from "@/lib/breakout/storage";
import { fadeInUp, instantTransition, motionTransition } from "@/lib/motion/variants";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

type ModeSelectProps = {
  bests: BreakoutBestScores;
  onStart: (mode: BreakoutMode) => void;
};

const MODE_DESCRIPTIONS: Record<BreakoutMode, string> = {
  classic: "Five handcrafted levels, three lives, pure retro. Clear them all.",
  roguelite: "Endless levels. Draft a modifier after each clear — boons help, curses pay.",
};

export function ModeSelect({ bests, onStart }: ModeSelectProps) {
  const reduceMotion = useReducedMotion();

  return (
    <m.div
      variants={fadeInUp}
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      transition={reduceMotion ? instantTransition : motionTransition}
      className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-background/90 p-6 backdrop-blur-sm"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold">Breakout</h2>
        <p className="mt-1 text-sm text-muted-foreground">Pick a mode to start.</p>
      </div>

      <div className="grid w-full max-w-sm gap-3">
        {(Object.keys(MODE_DESCRIPTIONS) as BreakoutMode[]).map((mode) => {
          const best = bests[mode];

          return (
            <button
              key={mode}
              type="button"
              autoFocus={mode === "classic"}
              onClick={() => onStart(mode)}
              className="rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <p className="font-semibold">{BREAKOUT_MODE_LABEL[mode]}</p>
              <p className="mt-1 text-sm text-muted-foreground">{MODE_DESCRIPTIONS[mode]}</p>
              {best ? (
                <p className="mt-2 text-xs font-medium text-primary/90">
                  Best: {best.score.toLocaleString("en-US")} pts · {best.level} {best.level === 1 ? "level" : "levels"}
                </p>
              ) : null}
            </button>
          );
        })}
      </div>

      <p className="max-w-sm text-center text-xs text-muted-foreground">
        Move with the mouse, touch, or arrow keys. Space or click serves the ball. Esc pauses.
      </p>
    </m.div>
  );
}
