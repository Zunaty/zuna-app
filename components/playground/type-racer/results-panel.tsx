"use client";

import { m } from "framer-motion";

import { StaggerChildren, StaggerItem } from "@/components/motion/stagger-children";
import { Button } from "@/components/ui/button";
import { TYPE_RACER_MODE_LABEL, type TypeRacerMode } from "@/lib/type-racer/constants";
import { formatElapsedSeconds, roundAccuracy, roundWpm, type TypeRacerStats } from "@/lib/type-racer/scoring";
import type { TypeRacerBestScore } from "@/lib/type-racer/storage";
import { instantTransition, springTransition } from "@/lib/motion/variants";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

type ResultsPanelProps = {
  mode: TypeRacerMode;
  stats: TypeRacerStats;
  isPersonalBest: boolean;
  bestScore: TypeRacerBestScore | null;
  onRetry: () => void;
};

export function ResultsPanel({ mode, stats, isPersonalBest, bestScore, onRetry }: ResultsPanelProps) {
  const reduceMotion = useReducedMotion();

  const rows = [
    { label: "WPM", value: String(roundWpm(stats.wpm)) },
    { label: "Raw WPM", value: String(roundWpm(stats.rawWpm)) },
    { label: "Accuracy", value: `${roundAccuracy(stats.accuracy)}%` },
    { label: "Time", value: `${formatElapsedSeconds(stats.elapsedMs)}s` },
  ];

  return (
    <div className="space-y-6 rounded-xl border border-border bg-card p-6">
      <div>
        <h2 className="text-xl font-semibold">Results</h2>
        <p className="mt-1 text-sm text-muted-foreground">{TYPE_RACER_MODE_LABEL[mode]} · words mode</p>
      </div>

      {isPersonalBest ? (
        <m.p
          className="inline-flex rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary"
          initial={reduceMotion ? false : { scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={reduceMotion ? instantTransition : springTransition}
        >
          New personal best
        </m.p>
      ) : bestScore ? (
        <p className="text-sm text-muted-foreground">
          Personal best: {bestScore.wpm} WPM · {bestScore.accuracy}% accuracy
        </p>
      ) : null}

      <StaggerChildren className="grid gap-3 sm:grid-cols-2" staggerKey="type-racer-results">
        {rows.map((row) => (
          <StaggerItem key={row.label}>
            <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{row.label}</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums">{row.value}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerChildren>

      <Button onClick={onRetry}>Try again</Button>
    </div>
  );
}
