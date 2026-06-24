"use client";

import { useEffect, useState } from "react";

import { SPEED_BONUS_THRESHOLD } from "@/lib/prompt-run/constants";
import { formatElapsedSeconds } from "@/lib/prompt-run/format";

import { RoundStat } from "./round-stat";

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
    <RoundStat
      className={className}
      label="Time"
      value={
        <span className="font-mono tabular-nums" aria-live="polite">
          {formatElapsedSeconds(elapsedMs)}
        </span>
      }
      hint={speedBonusActive ? "Speed bonus window" : `Under ${SPEED_BONUS_THRESHOLD}s for bonus`}
      hintClassName={speedBonusActive ? "text-amber-600 dark:text-amber-400" : "text-muted-foreground"}
    />
  );
}
