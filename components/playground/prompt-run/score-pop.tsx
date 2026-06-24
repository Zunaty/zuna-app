"use client";

import { AnimatePresence, m } from "framer-motion";

import { instantTransition, motionTransition, scorePop } from "@/lib/motion/variants";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import type { PickFeedback, Rarity } from "@/lib/prompt-run/types";
import { cn } from "@/lib/utils";

const RARITY_POP_CLASS: Record<Rarity, string> = {
  common: "border-border bg-muted text-foreground",
  uncommon: "border-green-500/35 bg-green-500/15 text-green-700 dark:text-green-300",
  rare: "border-blue-500/35 bg-blue-500/15 text-blue-700 dark:text-blue-300",
  epic: "border-purple-500/35 bg-purple-500/15 text-purple-700 dark:text-purple-300",
  legendary: "border-amber-500/35 bg-amber-500/15 text-amber-700 dark:text-amber-300",
};

type ScorePopProps = {
  feedback: PickFeedback | null;
  className?: string;
};

export function ScorePop({ feedback, className }: ScorePopProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-visible", className)} aria-hidden>
      <AnimatePresence>
        {feedback ? (
          <m.div
            key={feedback.id}
            className={cn(
              "absolute right-0 top-5 z-10 rounded-md border px-2 py-0.5 font-mono text-sm font-bold tabular-nums shadow-sm backdrop-blur-sm sm:text-base",
              RARITY_POP_CLASS[feedback.rarity],
            )}
            variants={scorePop}
            initial={reduceMotion ? false : "hidden"}
            animate="visible"
            exit={reduceMotion ? undefined : "exit"}
            transition={reduceMotion ? instantTransition : motionTransition}
          >
            +{feedback.points}
          </m.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
