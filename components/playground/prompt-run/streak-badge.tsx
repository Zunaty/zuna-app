import { Flame } from "lucide-react";

import { getStreakTier, getStreakTierLabel, getStreakTierMultiplierLabel } from "@/lib/prompt-run/streak";
import { cn } from "@/lib/utils";

type StreakBadgeProps = {
  streak: number;
  className?: string;
};

export function StreakBadge({ streak, className }: StreakBadgeProps) {
  const tier = getStreakTier(streak);
  const label = getStreakTierLabel(tier);
  const multiplier = getStreakTierMultiplierLabel(tier);

  if (streak === 0) {
    return (
      <div className={cn("text-right", className)}>
        <p className="text-muted-foreground">Streak</p>
        <p className="font-mono text-lg font-semibold">0</p>
        <p className="text-xs text-muted-foreground">Rare+ picks chain</p>
      </div>
    );
  }

  return (
    <div className={cn("text-right", className)}>
      <p className="text-muted-foreground">Streak</p>
      <p className="flex items-center justify-end gap-1.5 font-mono text-lg font-semibold">
        {tier !== "none" ? <Flame className="size-4 text-amber-500" aria-hidden /> : null}
        {streak}
      </p>
      {label && multiplier ? (
        <p className="text-xs font-medium text-amber-600 dark:text-amber-400">
          {label} · {multiplier}
        </p>
      ) : (
        <p className="text-xs text-muted-foreground">{3 - streak} to On Fire</p>
      )}
    </div>
  );
}
