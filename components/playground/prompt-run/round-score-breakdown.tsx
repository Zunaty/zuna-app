import { computeRoundBonuses, sumPickScoresFromRound } from "@/lib/prompt-run/scoring";
import { formatRoundDuration } from "@/lib/prompt-run/format";
import type { Round } from "@/lib/prompt-run/types";

export function RoundScoreBreakdown({ round }: { round: Round }) {
  const pickScore = round.pickScore ?? sumPickScoresFromRound(round);
  const bonuses =
    round.roundBonuses ??
    (round.roundDuration
      ? computeRoundBonuses(round.roundVariables, round.roundCategories, round.roundDuration)
      : { speedBonus: 0, epicBonus: 0, perfectBonus: 0 });

  const bonusRows = [
    bonuses.speedBonus > 0 ? { label: "Speed", points: bonuses.speedBonus } : null,
    bonuses.epicBonus > 0 ? { label: "Epic round", points: bonuses.epicBonus } : null,
    bonuses.perfectBonus > 0 ? { label: "Perfect round", points: bonuses.perfectBonus } : null,
    round.scrappedBonusAmount ? { label: "Scrap", points: round.scrappedBonusAmount } : null,
    round.generationFailureBonusAmount
      ? { label: "Failed generation", points: round.generationFailureBonusAmount }
      : null,
  ].filter((row): row is { label: string; points: number } => row !== null);

  const bonusTotal = bonusRows.reduce((sum, row) => sum + row.points, 0);

  return (
    <dl className="space-y-2 rounded-lg border bg-muted/20 p-4 text-sm">
      <div className="flex items-center justify-between gap-4">
        <dt className="text-muted-foreground">Picks</dt>
        <dd className="font-mono font-medium tabular-nums">{pickScore} pts</dd>
      </div>
      {bonusTotal > 0 ? (
        <div className="space-y-1">
          <div className="flex items-center justify-between gap-4">
            <dt className="text-muted-foreground">Bonuses</dt>
            <dd className="font-mono font-medium tabular-nums text-amber-600 dark:text-amber-400">+{bonusTotal} pts</dd>
          </div>
          {bonusRows.length > 1 ? (
            <ul className="space-y-0.5 pl-1 text-xs text-muted-foreground">
              {bonusRows.map((row) => (
                <li key={row.label} className="flex justify-between gap-4">
                  <span>{row.label}</span>
                  <span className="font-mono tabular-nums">+{row.points}</span>
                </li>
              ))}
            </ul>
          ) : bonusRows[0] ? (
            <p className="text-xs text-muted-foreground">{bonusRows[0].label} bonus</p>
          ) : null}
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-4 border-t border-border/60 pt-2">
        <dt className="font-medium">Round total</dt>
        <dd className="font-mono text-base font-semibold tabular-nums">{round.roundScore} pts</dd>
      </div>
      {round.roundDuration ? (
        <p className="text-xs text-muted-foreground">Round time {formatRoundDuration(round.roundDuration)}</p>
      ) : null}
    </dl>
  );
}
