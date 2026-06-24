"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MAX_ROUNDS } from "@/lib/prompt-run/constants";
import { getGeneratedImageFilename } from "@/lib/prompt-run/download-image";
import type { Game, Round } from "@/lib/prompt-run/types";
import { m } from "framer-motion";

import { fadeIn, instantTransition, motionTransition } from "@/lib/motion/variants";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

import { DownloadImageButton } from "./download-image-button";
import { GeneratedImagePreview } from "./generated-image-preview";
import { CurrentRoundPicks, RunHistory } from "./run-history";
import { PromptCard } from "./prompt-card";
import { GameSettingsBar } from "./onboarding-dialog";
import { LiveTimer } from "./live-timer";
import { RoundScoreBreakdown } from "./round-score-breakdown";
import { ShopPanel } from "./shop-panel";
import { StreakBadge } from "./streak-badge";
import type { ShopItem } from "@/lib/prompt-run/types";

type RoundStageProps = {
  game: Game;
  round: Round;
  volume: number;
  isMuted: boolean;
  onSelect: (variable: Parameters<typeof PromptCard>[0]["variable"]) => void;
  onSkip: () => void;
  onReroll: () => void;
  onPurchaseShopItem: (item: ShopItem) => void;
  onRefreshShop: () => void;
  canAffordShopItem: (item: ShopItem) => boolean;
  canRefreshShop: () => boolean;
  onToggleMute: () => void;
  onVolumeDown: () => void;
  onVolumeUp: () => void;
  onShowRules: () => void;
};

export function RoundStage({
  game,
  round,
  volume,
  isMuted,
  onSelect,
  onSkip,
  onReroll,
  onPurchaseShopItem,
  onRefreshShop,
  canAffordShopItem,
  canRefreshShop,
  onToggleMute,
  onVolumeDown,
  onVolumeUp,
  onShowRules,
}: RoundStageProps) {
  const roundHeaderRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const category = round.currentCategory;
  const currentCategoryIndex = category ? round.roundCategories.findIndex((entry) => entry.id === category.id) : -1;
  const categoryPosition = currentCategoryIndex >= 0 ? currentCategoryIndex + 1 : null;

  useEffect(() => {
    roundHeaderRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [round.id, reduceMotion]);

  return (
    <div className="space-y-6">
      <div ref={roundHeaderRef} className="flex scroll-mt-24 flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            Round {round.roundNumber} of {MAX_ROUNDS}
          </p>
          <h2 className="text-2xl font-semibold capitalize">{category?.name ?? "Complete"}</h2>
          <p className="text-sm text-muted-foreground">
            {categoryPosition
              ? `Category ${categoryPosition} of ${round.roundCategories.length} — pick one option.`
              : "Pick one option to build your prompt."}
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-6">
          <div className="flex gap-6 text-sm">
            <div>
              <p className="text-muted-foreground">Run score</p>
              <p className="font-mono text-lg font-semibold">{game.totalScore}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Round score</p>
              <p className="font-mono text-lg font-semibold">{round.roundScore}</p>
            </div>
            <div>
              <p className="text-muted-foreground">Rerolls</p>
              <p className="font-mono text-lg font-semibold">{game.rerollCharges}</p>
            </div>
          </div>
          <StreakBadge streak={game.streak} />
          <LiveTimer startTime={round.roundStartTime} />
          <GameSettingsBar
            volume={volume}
            isMuted={isMuted}
            onVolumeDown={onVolumeDown}
            onVolumeUp={onVolumeUp}
            onToggleMute={onToggleMute}
            onShowRules={onShowRules}
          />
        </div>
      </div>

      {category ? (
        <div className="space-y-3" key={category.id}>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-muted-foreground">Choose one option, or reroll / skip this category.</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={onReroll} disabled={game.rerollCharges <= 0}>
                Reroll
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={onSkip}>
                Skip
              </Button>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {category.availableOptions.map((variable, index) => (
              <PromptCard key={variable.id} variable={variable} onSelect={onSelect} animationIndex={index} />
            ))}
          </div>
        </div>
      ) : null}

      <CurrentRoundPicks picks={[...round.roundVariables, ...round.shopVariables]} />

      <ShopPanel
        game={game}
        round={round}
        onPurchase={onPurchaseShopItem}
        onRefresh={onRefreshShop}
        canAffordItem={canAffordShopItem}
        canRefreshShop={canRefreshShop}
      />
    </div>
  );
}

type OverviewPanelProps = {
  game: Game;
  prompt: string;
  onNextRound: () => void;
  onNewRun: () => void;
  onViewRunSummary: () => void;
};

export function OverviewPanel({ game, prompt, onNextRound, onNewRun, onViewRunSummary }: OverviewPanelProps) {
  const reduceMotion = useReducedMotion();
  const lastRound = game.rounds[game.rounds.length - 1];
  const canContinue = game.completedRounds < MAX_ROUNDS;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Round complete</CardTitle>
          <CardDescription>
            Total score {game.totalScore} · Streak record {game.streakRecord}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {lastRound ? <RoundScoreBreakdown round={lastRound} /> : null}
          {lastRound?.generationFailed ? (
            <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              Image generation failed
              {lastRound.generationFailureMessage ? `: ${lastRound.generationFailureMessage}` : "."} Double scrap points
              (+{lastRound.generationFailureBonusAmount ?? 0}) were added instead.
            </p>
          ) : null}
          {lastRound?.generatedImage ? (
            <m.div
              className="space-y-3"
              variants={fadeIn}
              initial={reduceMotion ? false : "hidden"}
              animate="visible"
              transition={reduceMotion ? instantTransition : motionTransition}
            >
              <GeneratedImagePreview
                url={lastRound.generatedImage.url}
                alt="Generated from your prompt"
                width={lastRound.generatedImage.width}
                height={lastRound.generatedImage.height}
              />
              <DownloadImageButton
                url={lastRound.generatedImage.url}
                filename={getGeneratedImageFilename(lastRound.roundNumber, lastRound.generatedImage.seed)}
              />
            </m.div>
          ) : null}
          <p className="rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed">{prompt}</p>
          <div className="flex flex-wrap gap-3">
            {canContinue ? (
              <Button type="button" onClick={onNextRound}>
                Next round
              </Button>
            ) : (
              <Button type="button" onClick={onViewRunSummary}>
                View run summary
              </Button>
            )}
            {canContinue ? (
              <Button type="button" variant="outline" onClick={onNewRun}>
                New run
              </Button>
            ) : null}
          </div>
        </CardContent>
      </Card>
      <RunHistory rounds={game.rounds} defaultExpandedRoundId={lastRound?.id ?? null} title="This run" />
    </div>
  );
}
