"use client";

import { m } from "framer-motion";
import { Flame } from "lucide-react";

import { popIn, instantTransition, springTransition } from "@/lib/motion/variants";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { getStreakTier, getStreakTierLabel, getStreakTierMultiplierLabel } from "@/lib/prompt-run/streak";
import { cn } from "@/lib/utils";

import { RoundStat } from "./round-stat";

type StreakBadgeProps = {
  streak: number;
  className?: string;
};

export function StreakBadge({ streak, className }: StreakBadgeProps) {
  const reduceMotion = useReducedMotion();
  const tier = getStreakTier(streak);
  const label = getStreakTierLabel(tier);
  const multiplier = getStreakTierMultiplierLabel(tier);

  const hint =
    streak === 0 ? "Rare+ picks chain" : label && multiplier ? `${label} · ${multiplier}` : `${3 - streak} to On Fire`;

  const hintClassName =
    streak > 0 && label && multiplier ? "font-medium text-amber-600 dark:text-amber-400" : "text-muted-foreground";

  return (
    <RoundStat
      className={className}
      label="Streak"
      hint={hint}
      hintClassName={hintClassName}
      value={
        <m.span
          key={streak}
          className={cn("inline-flex items-center gap-1.5 font-mono")}
          variants={popIn}
          initial={reduceMotion ? false : "hidden"}
          animate="visible"
          transition={reduceMotion ? instantTransition : springTransition}
        >
          {streak > 0 && tier !== "none" ? (
            <m.span
              animate={reduceMotion ? undefined : { scale: [1, 1.2, 1] }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            >
              <Flame className="size-4 text-amber-500" aria-hidden />
            </m.span>
          ) : null}
          {streak}
        </m.span>
      }
    />
  );
}
