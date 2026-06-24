"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

import { formatRoundDuration } from "@/lib/prompt-run/format";
import { computeRoundBonuses, getPickPointsEarned } from "@/lib/prompt-run/scoring";
import type { PromptVariable, Rarity, Round } from "@/lib/prompt-run/types";
import { cn } from "@/lib/utils";

const RARITY_LABEL: Record<Rarity, string> = {
  common: "Common",
  uncommon: "Uncommon",
  rare: "Rare",
  epic: "Epic",
  legendary: "Legendary",
};

const RARITY_CLASS: Record<Rarity, string> = {
  common: "text-muted-foreground",
  uncommon: "text-green-600 dark:text-green-400",
  rare: "text-blue-600 dark:text-blue-400",
  epic: "text-purple-600 dark:text-purple-400",
  legendary: "text-amber-600 dark:text-amber-400",
};

type RunHistoryProps = {
  rounds: Round[];
  title?: string;
  emptyMessage?: string;
  defaultExpandedRoundId?: string | null;
};

function PickRow({ variable }: { variable: PromptVariable }) {
  const earned = getPickPointsEarned(variable);
  const hasStreakBonus = earned > variable.points;

  return (
    <li className="grid items-center gap-x-3 rounded-md border bg-muted/20 px-3 py-2 text-sm [grid-template-columns:minmax(0,1fr)_6.5rem_5.75rem_3.25rem]">
      <span className="truncate font-medium capitalize">{variable.name}</span>
      <span className="truncate text-xs text-muted-foreground">
        {variable.categoryName ? `(${variable.categoryName})` : "\u00a0"}
      </span>
      <span className={cn("truncate text-xs font-medium uppercase tracking-wide", RARITY_CLASS[variable.rarity])}>
        {RARITY_LABEL[variable.rarity]}
      </span>
      <span className="text-right font-mono text-xs tabular-nums text-muted-foreground">
        +{earned}
        {hasStreakBonus ? <span className="text-amber-600 dark:text-amber-400">*</span> : null}
      </span>
    </li>
  );
}

function RoundBonusRows({ round }: { round: Round }) {
  const bonuses =
    round.roundBonuses ??
    (round.roundDuration
      ? computeRoundBonuses(round.roundVariables, round.roundCategories, round.roundDuration)
      : null);

  if (!bonuses) {
    return null;
  }

  const rows = [
    bonuses.speedBonus > 0 ? { label: "Speed bonus", points: bonuses.speedBonus } : null,
    bonuses.epicBonus > 0 ? { label: "Epic round bonus", points: bonuses.epicBonus } : null,
    bonuses.perfectBonus > 0 ? { label: "Perfect round bonus", points: bonuses.perfectBonus } : null,
    round.scrappedBonusAmount ? { label: "Scrap bonus", points: round.scrappedBonusAmount } : null,
    round.generationFailureBonusAmount
      ? { label: "Failed generation bonus", points: round.generationFailureBonusAmount }
      : null,
  ].filter((row): row is { label: string; points: number } => row !== null);

  if (rows.length === 0) {
    return null;
  }

  return (
    <>
      <li className="pt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Round bonuses</li>
      {rows.map((row) => (
        <li
          key={row.label}
          className="flex items-center justify-between gap-3 rounded-md border border-dashed bg-muted/10 px-3 py-2 text-sm"
        >
          <span className="text-muted-foreground">{row.label}</span>
          <span className="font-mono text-xs font-medium text-foreground">+{row.points}</span>
        </li>
      ))}
    </>
  );
}

function RoundHistoryItem({ round, defaultExpanded }: { round: Round; defaultExpanded: boolean }) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  return (
    <div className="rounded-lg border">
      <button
        type="button"
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left hover:bg-muted/30"
        onClick={() => setExpanded((value) => !value)}
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown className="size-4 shrink-0" /> : <ChevronRight className="size-4 shrink-0" />}
          <span className="font-medium">Round {round.roundNumber}</span>
          {round.scrapped ? <span className="text-xs text-orange-600 dark:text-orange-400">Scrapped</span> : null}
          {round.generationFailed ? <span className="text-xs text-destructive">Gen failed</span> : null}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="font-mono font-medium text-foreground">{round.roundScore} pts</span>
          <span>{formatRoundDuration(round.roundDuration)}</span>
        </div>
      </button>
      {expanded ? (
        <ul className="space-y-2 border-t px-4 py-3">
          {round.roundVariables.length > 0 ? (
            round.roundVariables.map((variable) => <PickRow key={variable.id} variable={variable} />)
          ) : (
            <li className="text-sm text-muted-foreground">No picks recorded.</li>
          )}
          {round.shopVariables.length > 0 ? (
            <>
              <li className="pt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Shop</li>
              {round.shopVariables.map((variable) => (
                <PickRow key={`shop-${variable.id}`} variable={variable} />
              ))}
            </>
          ) : null}
          <RoundBonusRows round={round} />
        </ul>
      ) : null}
    </div>
  );
}

export function RunHistory({
  rounds,
  title = "Run history",
  emptyMessage = "Complete a round to see your picks here.",
  defaultExpandedRoundId = null,
}: RunHistoryProps) {
  if (rounds.length === 0) {
    return <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">{emptyMessage}</div>;
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium">{title}</h3>
      <div className="space-y-2">
        {rounds.map((round) => (
          <RoundHistoryItem key={round.id} round={round} defaultExpanded={round.id === defaultExpandedRoundId} />
        ))}
      </div>
    </div>
  );
}

type CurrentRoundPicksProps = {
  picks: PromptVariable[];
};

export function CurrentRoundPicks({ picks }: CurrentRoundPicksProps) {
  if (picks.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-muted-foreground">Picks this round</h3>
      <ul className="space-y-2">
        {picks.map((variable) => (
          <PickRow key={variable.id} variable={variable} />
        ))}
      </ul>
    </div>
  );
}
