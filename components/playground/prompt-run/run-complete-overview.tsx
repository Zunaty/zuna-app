"use client";

import { useEffect, useRef } from "react";
import { m } from "framer-motion";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { assemblePrompt } from "@/lib/prompt-run/assemble-prompt";
import { getGeneratedImageFilename } from "@/lib/prompt-run/download-image";
import { MAX_ROUNDS } from "@/lib/prompt-run/constants";
import type { Game, Round } from "@/lib/prompt-run/types";
import { fadeInUp, instantTransition, motionTransition, staggerContainer } from "@/lib/motion/variants";
import { useReducedMotion } from "@/lib/motion/use-reduced-motion";

import { DownloadImageButton } from "./download-image-button";
import { GeneratedImagePreview } from "./generated-image-preview";
import { RoundScoreBreakdown } from "./round-score-breakdown";
import { RunHistory } from "./run-history";

type RunCompleteOverviewProps = {
  game: Game;
  onNewRun: () => void;
};

function sumShopSpent(rounds: Round[]): number {
  return rounds.reduce((sum, round) => sum + (round.shopSpent ?? 0), 0);
}

function RoundOutcome({ round }: { round: Round }) {
  if (round.generatedImage) {
    return (
      <GeneratedImagePreview
        url={round.generatedImage.url}
        alt={`Round ${round.roundNumber} generated image`}
        width={round.generatedImage.width}
        height={round.generatedImage.height}
        imageClassName="max-h-72 w-full object-contain sm:max-h-80 md:max-h-96"
      />
    );
  }

  if (round.generationFailed) {
    return (
      <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
        Generation failed
        {round.generationFailureMessage ? `: ${round.generationFailureMessage}` : "."}
      </p>
    );
  }

  if (round.scrapped) {
    return (
      <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">
        Prompt scrapped — no image generated.
      </p>
    );
  }

  return (
    <p className="rounded-lg border border-dashed px-4 py-3 text-sm text-muted-foreground">No image for this round.</p>
  );
}

function RoundSummaryRow({ round }: { round: Round }) {
  const prompt = assemblePrompt(round.roundVariables, round.shopVariables);

  return (
    <Card>
      <CardContent className="space-y-5 p-4 sm:p-6">
        <RoundOutcome round={round} />

        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-lg font-semibold">Round {round.roundNumber}</h3>
              <p className="font-mono text-sm tabular-nums text-muted-foreground">{round.roundScore} pts</p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              {round.scrapped ? <span className="text-orange-600 dark:text-orange-400">Scrapped</span> : null}
              {round.generationFailed ? <span className="text-destructive">Gen failed</span> : null}
            </div>
          </div>

          <RoundScoreBreakdown round={round} />

          {prompt ? <p className="rounded-lg border bg-muted/30 p-3 text-sm leading-relaxed">{prompt}</p> : null}

          {round.generatedImage ? (
            <DownloadImageButton
              url={round.generatedImage.url}
              filename={getGeneratedImageFilename(round.roundNumber, round.generatedImage.seed)}
            />
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

export function RunCompleteOverview({ game, onNewRun }: RunCompleteOverviewProps) {
  const headerRef = useRef<HTMLDivElement>(null);
  const reduceMotion = useReducedMotion();
  const shopSpent = sumShopSpent(game.rounds);

  useEffect(() => {
    headerRef.current?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });
  }, [reduceMotion]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader ref={headerRef} className="scroll-mt-24">
          <CardTitle>Run summary</CardTitle>
          <CardDescription>
            {MAX_ROUNDS} rounds finished · Personal best updates if you beat your record
          </CardDescription>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border bg-muted/20 p-4">
              <dt className="text-sm text-muted-foreground">Total score</dt>
              <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums">{game.totalScore}</dd>
            </div>
            <div className="rounded-lg border bg-muted/20 p-4">
              <dt className="text-sm text-muted-foreground">Streak record</dt>
              <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums">{game.streakRecord}</dd>
            </div>
            <div className="rounded-lg border bg-muted/20 p-4">
              <dt className="text-sm text-muted-foreground">Speed bonuses</dt>
              <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums">{game.speedBonusCount}</dd>
            </div>
            <div className="rounded-lg border bg-muted/20 p-4">
              <dt className="text-sm text-muted-foreground">Shop spent</dt>
              <dd className="mt-1 font-mono text-2xl font-semibold tabular-nums">{shopSpent}</dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <m.div
        className="space-y-4"
        variants={staggerContainer}
        initial={reduceMotion ? false : "hidden"}
        animate="visible"
      >
        {game.rounds.map((round) => (
          <m.div key={round.id} variants={fadeInUp} transition={reduceMotion ? instantTransition : motionTransition}>
            <RoundSummaryRow round={round} />
          </m.div>
        ))}
      </m.div>

      <RunHistory rounds={game.rounds} title="Pick history" />

      <Button type="button" onClick={onNewRun}>
        Start new run
      </Button>
    </div>
  );
}
