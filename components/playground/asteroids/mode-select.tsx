"use client";

import { m } from "framer-motion";

import { ASTEROIDS_MODE_LABEL, type AsteroidsMode } from "@/lib/asteroids/constants";
import { fadeInUp, instantTransition, motionTransition } from "@/lib/motion/variants";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

type ModeSelectProps = {
  onStart: (mode: AsteroidsMode) => void;
};

export function ModeSelect({ onStart }: ModeSelectProps) {
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
        <h2 className="text-2xl font-bold">Asteroids</h2>
        <p className="mt-1 text-sm text-muted-foreground">Wrap, thrust, and split the rocks.</p>
      </div>

      <div className="grid w-full max-w-sm gap-3">
        <button
          type="button"
          autoFocus
          onClick={() => onStart("classic")}
          className="rounded-xl border border-border bg-card p-4 text-left transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <p className="font-semibold">{ASTEROIDS_MODE_LABEL.classic}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Eight waves, three lives, standard bullets. Clear them all.
          </p>
        </button>

        <div className="rounded-xl border border-dashed border-border bg-muted/20 p-4 text-left">
          <p className="font-semibold text-muted-foreground">{ASTEROIDS_MODE_LABEL.roguelite}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Draft a loadout after every wave — coming after Classic is solid.
          </p>
        </div>
      </div>

      <p className="max-w-sm text-center text-xs text-muted-foreground">
        Rotate with ← → or A D. Thrust with ↑ or W. Hold Space or click to fire. Esc pauses.
      </p>
    </m.div>
  );
}
