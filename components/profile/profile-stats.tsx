"use client";

import { Lock } from "lucide-react";
import { useMemo } from "react";

import { useAchievements } from "@/components/achievements/achievement-provider";
import {
  ACHIEVEMENT_CATEGORY_LABEL,
  ACHIEVEMENT_LIST,
  type AchievementDefinition,
} from "@/lib/achievements/definitions";
import { getLevelProgress, getTotalPoints } from "@/lib/achievements/points";
import { getUnlockedIds, mergeUnlocks, type UnlockedAchievements } from "@/lib/achievements/unlocks";
import type { PromptRunBestRun } from "@/lib/prompt-run/storage";
import { TYPE_RACER_MODES, TYPE_RACER_MODE_LABEL } from "@/lib/type-racer/constants";
import type { TypeRacerBestScores } from "@/lib/type-racer/storage";

type ProfileStatsProps = {
  serverUnlocks: UnlockedAchievements;
  typeRacer: TypeRacerBestScores;
  promptRun: PromptRunBestRun | null;
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function ProfileStats({ serverUnlocks, typeRacer, promptRun }: ProfileStatsProps) {
  const { unlocked } = useAchievements();

  const unlocks = useMemo(() => mergeUnlocks(serverUnlocks, unlocked), [serverUnlocks, unlocked]);
  const unlockedCount = getUnlockedIds(unlocks).length;
  const points = getTotalPoints(getUnlockedIds(unlocks));
  const progress = getLevelProgress(points);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-medium text-muted-foreground">Level</h2>
          <p className="mt-2 text-3xl font-bold text-primary">{progress.level}</p>
          <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${Math.round((progress.current / progress.required) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            {progress.current}/{progress.required} to level {progress.level + 1}
          </p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-medium text-muted-foreground">Points</h2>
          <p className="mt-2 text-3xl font-bold">{points}</p>
          <p className="mt-2 text-xs text-muted-foreground">Earned from achievements</p>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-medium text-muted-foreground">Achievements</h2>
          <p className="mt-2 text-3xl font-bold">
            {unlockedCount}
            <span className="text-base font-normal text-muted-foreground">/{ACHIEVEMENT_LIST.length}</span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">Unlocked so far</p>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold">Type Racer</h2>
          <p className="mt-1 text-sm text-muted-foreground">Personal bests per mode.</p>
          <dl className="mt-4 space-y-3 text-sm">
            {TYPE_RACER_MODES.map((mode) => {
              const score = typeRacer[mode];

              return (
                <div key={mode} className="flex items-baseline justify-between gap-3">
                  <dt className="text-muted-foreground">{TYPE_RACER_MODE_LABEL[mode]}</dt>
                  <dd className="text-right font-mono font-medium tabular-nums">
                    {score ? `${score.wpm} WPM · ${score.accuracy}%` : "—"}
                  </dd>
                </div>
              );
            })}
          </dl>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="font-semibold">Prompt Run</h2>
          <p className="mt-1 text-sm text-muted-foreground">Best completed run.</p>
          {promptRun ? (
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">Score</dt>
                <dd className="font-mono font-medium tabular-nums">{promptRun.totalScore.toLocaleString("en-US")}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">Rounds</dt>
                <dd className="font-mono font-medium tabular-nums">{promptRun.completedRounds}</dd>
              </div>
              <div className="flex items-baseline justify-between gap-3">
                <dt className="text-muted-foreground">Achieved</dt>
                <dd className="font-medium">{formatDate(promptRun.savedAt)}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-muted-foreground">No completed runs yet — finish a run to set a best.</p>
          )}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="font-semibold">Achievements</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Earned across the playground and the rest of the site. Guest progress merges in when you sign in.
        </p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2">
          {ACHIEVEMENT_LIST.map((definition) => (
            <AchievementCard key={definition.id} definition={definition} unlockedAt={unlocks[definition.id] ?? null} />
          ))}
        </ul>
      </section>
    </div>
  );
}

type AchievementCardProps = {
  definition: AchievementDefinition;
  unlockedAt: string | null;
};

function AchievementCard({ definition, unlockedAt }: AchievementCardProps) {
  const Icon = definition.icon;
  const isUnlocked = unlockedAt !== null;

  return (
    <li
      className={`flex items-start gap-3 rounded-lg border p-4 ${
        isUnlocked ? "border-primary/30 bg-primary/5" : "border-border bg-muted/20 opacity-70"
      }`}
    >
      <span
        className={`mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full ${
          isUnlocked ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
        }`}
      >
        {isUnlocked ? <Icon className="size-5" aria-hidden /> : <Lock className="size-4" aria-hidden />}
      </span>
      <div className="min-w-0 text-sm">
        <p className="font-medium">
          {definition.title}
          <span className="ml-2 text-xs font-normal text-muted-foreground">
            {ACHIEVEMENT_CATEGORY_LABEL[definition.category]} · {definition.points} pts
          </span>
        </p>
        <p className="mt-0.5 text-muted-foreground">{definition.description}</p>
        {isUnlocked ? <p className="mt-1 text-xs text-primary">Unlocked {formatDate(unlockedAt)}</p> : null}
      </div>
    </li>
  );
}
