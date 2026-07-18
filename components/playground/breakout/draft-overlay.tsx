"use client";

import { m } from "framer-motion";

import { Button } from "@/components/ui/button";
import { DRAFT_SKIP_BONUS } from "@/lib/breakout/constants";
import { BREAKOUT_MODIFIERS, type BreakoutModifierId, type BreakoutRarity } from "@/lib/breakout/modifiers";
import { fadeInUp, instantTransition, motionTransition, staggerContainer } from "@/lib/motion/variants";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

type DraftOverlayProps = {
  options: BreakoutModifierId[];
  onPick: (pick: BreakoutModifierId | "skip") => void;
};

const RARITY_STYLES: Record<BreakoutRarity, string> = {
  common: "border-border",
  uncommon: "border-green-500/50",
  rare: "border-blue-500/50",
  epic: "border-purple-500/50",
};

const RARITY_TEXT: Record<BreakoutRarity, string> = {
  common: "text-muted-foreground",
  uncommon: "text-green-500",
  rare: "text-blue-500",
  epic: "text-purple-500",
};

export function DraftOverlay({ options, onPick }: DraftOverlayProps) {
  const reduceMotion = useReducedMotion();

  return (
    <m.div
      variants={staggerContainer}
      initial={reduceMotion ? false : "hidden"}
      animate="visible"
      className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-background/90 p-6 backdrop-blur-sm"
    >
      <m.div
        variants={fadeInUp}
        transition={reduceMotion ? instantTransition : motionTransition}
        className="text-center"
      >
        <h2 className="text-xl font-bold">Level clear — draft one</h2>
        <p className="mt-1 text-sm text-muted-foreground">Boons make it easier. Curses pay more points.</p>
      </m.div>

      <div className="grid w-full max-w-sm gap-3">
        {options.map((id, index) => {
          const modifier = BREAKOUT_MODIFIERS[id];

          return (
            <m.button
              key={id}
              type="button"
              autoFocus={index === 0}
              variants={fadeInUp}
              transition={reduceMotion ? instantTransition : motionTransition}
              onClick={() => onPick(id)}
              className={`rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${RARITY_STYLES[modifier.rarity]}`}
            >
              <div className="flex items-baseline justify-between gap-2">
                <p className="font-semibold">{modifier.name}</p>
                <p className={`text-xs font-medium uppercase tracking-wider ${RARITY_TEXT[modifier.rarity]}`}>
                  {modifier.kind === "curse" ? `${modifier.rarity} curse` : modifier.rarity}
                </p>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{modifier.description}</p>
            </m.button>
          );
        })}
      </div>

      <m.div variants={fadeInUp} transition={reduceMotion ? instantTransition : motionTransition}>
        <Button variant="ghost" size="sm" onClick={() => onPick("skip")}>
          Skip (+{DRAFT_SKIP_BONUS} pts)
        </Button>
      </m.div>
    </m.div>
  );
}
