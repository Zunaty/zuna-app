"use client";

import { useEffect, useState } from "react";

import { SPEED_BONUS_THRESHOLD } from "@/lib/prompt-run/constants";
import { formatElapsedSeconds } from "@/lib/prompt-run/format";
import { cn } from "@/lib/utils";

type LiveTimerProps = {
  startTime: number;
  className?: string;
};

export function LiveTimer({ startTime, className }: LiveTimerProps) {
  const [elapsedMs, setElapsedMs] = useState(() => Date.now() - startTime);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setElapsedMs(Date.now() - startTime);
    }, 250);

    return () => {
      window.clearInterval(interval);
    };
  }, [startTime]);

  const elapsedSeconds = elapsedMs / 1000;
  const speedBonusActive = elapsedSeconds < SPEED_BONUS_THRESHOLD;

  return (
    <div className={cn("text-right", className)}>
      <p className="text-muted-foreground">Time</p>
      <p className="font-mono text-lg font-semibold tabular-nums" aria-live="polite">
        {formatElapsedSeconds(elapsedMs)}
      </p>
      {speedBonusActive ? (
        <p className="text-xs text-amber-600 dark:text-amber-400">Speed bonus window</p>
      ) : (
        <p className="text-xs text-muted-foreground">Under {SPEED_BONUS_THRESHOLD}s for bonus</p>
      )}
    </div>
  );
}
