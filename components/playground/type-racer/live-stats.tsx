import { roundAccuracy, roundWpm, type TypeRacerStats } from "@/lib/type-racer/scoring";

type LiveStatsProps = {
  stats: TypeRacerStats;
  timerStarted: boolean;
};

export function LiveStats({ stats, timerStarted }: LiveStatsProps) {
  const wpm = timerStarted ? roundWpm(stats.wpm) : 0;
  const accuracy = roundAccuracy(stats.accuracy);

  return (
    <p className="font-mono text-sm tabular-nums text-muted-foreground" aria-live="polite">
      <span className="text-foreground">{wpm}</span> WPM · <span className="text-foreground">{accuracy}%</span> accuracy
    </p>
  );
}
