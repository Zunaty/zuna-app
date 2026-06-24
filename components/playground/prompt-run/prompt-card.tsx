"use client";

import { m } from "framer-motion";

import type { PromptVariable, Rarity } from "@/lib/prompt-run/types";
import { cardFlipReveal, instantTransition, motionTransition } from "@/lib/motion/variants";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";
import { cn } from "@/lib/utils";

const RARITY_STYLES: Record<Rarity, string> = {
  common: "border-border bg-muted/40 text-foreground",
  uncommon: "border-green-500/40 bg-green-500/10 text-green-700 dark:text-green-300",
  rare: "border-blue-500/40 bg-blue-500/10 text-blue-700 dark:text-blue-300",
  epic: "border-purple-500/40 bg-purple-500/10 text-purple-700 dark:text-purple-300",
  legendary: "border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300",
};

const RARITY_SHIMMER: Partial<Record<Rarity, boolean>> = {
  epic: true,
  legendary: true,
};

type PromptCardProps = {
  variable: PromptVariable;
  onSelect: (variable: PromptVariable) => void;
  disabled?: boolean;
  animationIndex?: number;
};

export function PromptCard({ variable, onSelect, disabled, animationIndex = 0 }: PromptCardProps) {
  const reduceMotion = useReducedMotion();
  const shimmer = !reduceMotion && RARITY_SHIMMER[variable.rarity];

  return (
    <m.button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(variable)}
      variants={cardFlipReveal}
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      transition={reduceMotion ? instantTransition : { ...motionTransition, delay: animationIndex * 0.06 }}
      whileHover={reduceMotion || disabled ? undefined : { scale: 1.02, y: -2 }}
      whileTap={reduceMotion || disabled ? undefined : { scale: 0.98 }}
      className={cn(
        "flex min-h-28 flex-col justify-between rounded-xl border p-4 text-left",
        "hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        RARITY_STYLES[variable.rarity],
        shimmer && "prompt-run-rarity-shimmer",
      )}
      style={{ transformStyle: "preserve-3d" }}
    >
      <span className="text-xs font-medium uppercase tracking-wider opacity-80">{variable.rarity}</span>
      <span className="text-lg font-semibold capitalize">{variable.name}</span>
      <span className="font-mono text-sm">{variable.points} pts</span>
    </m.button>
  );
}
