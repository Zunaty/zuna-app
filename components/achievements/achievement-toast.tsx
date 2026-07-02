"use client";

import { AnimatePresence, m } from "framer-motion";
import { useEffect } from "react";

import { ACHIEVEMENTS, type AchievementId } from "@/lib/achievements/definitions";
import { instantTransition, springTransition } from "@/lib/motion/variants";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

const TOAST_DURATION_MS = 4500;

type AchievementToasterProps = {
  toastIds: AchievementId[];
  onDismiss: (id: AchievementId) => void;
};

export function AchievementToaster({ toastIds, onDismiss }: AchievementToasterProps) {
  const reduceMotion = useReducedMotion();

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-50 flex w-full max-w-sm flex-col gap-2"
      aria-live="polite"
    >
      <AnimatePresence>
        {toastIds.map((id) => (
          <AchievementToast key={id} id={id} reduceMotion={reduceMotion ?? false} onDismiss={onDismiss} />
        ))}
      </AnimatePresence>
    </div>
  );
}

type AchievementToastProps = {
  id: AchievementId;
  reduceMotion: boolean;
  onDismiss: (id: AchievementId) => void;
};

function AchievementToast({ id, reduceMotion, onDismiss }: AchievementToastProps) {
  const definition = ACHIEVEMENTS[id];
  const Icon = definition.icon;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => onDismiss(id), TOAST_DURATION_MS);
    return () => window.clearTimeout(timeoutId);
  }, [id, onDismiss]);

  return (
    <m.button
      type="button"
      layout={!reduceMotion}
      initial={reduceMotion ? false : { opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.97 }}
      transition={reduceMotion ? instantTransition : springTransition}
      onClick={() => onDismiss(id)}
      className="pointer-events-auto flex w-full items-center gap-3 rounded-xl border border-border bg-card p-4 text-left shadow-lg"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="size-5" aria-hidden />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-medium uppercase tracking-wide text-primary">Achievement unlocked</span>
        <span className="block truncate font-semibold">{definition.title}</span>
        <span className="block text-sm text-muted-foreground">+{definition.points} points</span>
      </span>
    </m.button>
  );
}
