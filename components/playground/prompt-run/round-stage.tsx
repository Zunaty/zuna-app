"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MAX_ROUNDS } from "@/lib/prompt-run/constants";
import { getGeneratedImageFilename } from "@/lib/prompt-run/download-image";
import type { Game, Round, ShopItem } from "@/lib/prompt-run/types";

import { DownloadImageButton } from "./download-image-button";

import { CurrentRoundPicks, RunHistory } from "./run-history";
import { PromptCard } from "./prompt-card";
import { ShopPanel } from "./shop-panel";

type RoundStageProps = {
  game: Game;
  round: Round;
  onSelect: (variable: Parameters<typeof PromptCard>[0]["variable"]) => void;
  onSkip: () => void;
  onReroll: () => void;
  onPurchaseShopItem: (item: ShopItem) => void;
  onRefreshShop: () => void;
  canAffordShopItem: (item: ShopItem) => boolean;
  canRefreshShop: () => boolean;
};

export function RoundStage({
  game,
  round,
  onSelect,
  onSkip,
  onReroll,
  onPurchaseShopItem,
  onRefreshShop,
  canAffordShopItem,
  canRefreshShop,
}: RoundStageProps) {
  const category = round.currentCategory;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-primary">
            Round {round.roundNumber} of {MAX_ROUNDS}
          </p>
          <h2 className="text-2xl font-semibold capitalize">{category?.name ?? "Complete"}</h2>
          <p className="text-sm text-muted-foreground">Pick one option to build your prompt.</p>
        </div>
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
      </div>

      {category ? (
        <div className="space-y-3">
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
            {category.availableOptions.map((variable) => (
              <PromptCard key={variable.id} variable={variable} onSelect={onSelect} />
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
};

export function OverviewPanel({ game, prompt, onNextRound, onNewRun }: OverviewPanelProps) {
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
          {lastRound ? (
            <p className="text-sm text-muted-foreground">
              Last round scored <span className="font-mono font-medium text-foreground">{lastRound.roundScore}</span>{" "}
              points.
            </p>
          ) : null}
          {lastRound?.generatedImage ? (
            <div className="space-y-3">
              <div className="overflow-hidden rounded-lg border bg-muted/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lastRound.generatedImage.url}
                  alt="Generated from your prompt"
                  className="mx-auto max-h-[min(50vh,480px)] w-full object-contain"
                  width={lastRound.generatedImage.width}
                  height={lastRound.generatedImage.height}
                />
              </div>
              <DownloadImageButton
                url={lastRound.generatedImage.url}
                filename={getGeneratedImageFilename(lastRound.roundNumber, lastRound.generatedImage.seed)}
              />
            </div>
          ) : null}
          <p className="rounded-lg border bg-muted/30 p-4 text-sm leading-relaxed">{prompt}</p>
          <div className="flex flex-wrap gap-3">
            {canContinue ? (
              <Button type="button" onClick={onNextRound}>
                Next round
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">Run complete — start a new run to play again.</p>
            )}
            <Button type="button" variant="outline" onClick={onNewRun}>
              New run
            </Button>
          </div>
        </CardContent>
      </Card>
      <RunHistory rounds={game.rounds} defaultExpandedRoundId={lastRound?.id ?? null} title="This run" />
    </div>
  );
}
