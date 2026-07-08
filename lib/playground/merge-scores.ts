import { BREAKOUT_MODES } from "@/lib/breakout/constants";
import { isBreakoutScoreBetter } from "@/lib/breakout/scoring";
import type { BreakoutBestScores } from "@/lib/breakout/storage";
import type { PromptRunBestRun } from "@/lib/prompt-run/storage";
import { TYPE_RACER_MODES } from "@/lib/type-racer/constants";
import type { TypeRacerBestScore, TypeRacerBestScores } from "@/lib/type-racer/storage";

export type PlaygroundCloudScores = {
  typeRacer: TypeRacerBestScores;
  promptRun: PromptRunBestRun | null;
  breakout: BreakoutBestScores;
};

export function isTypeRacerScoreBetter(candidate: TypeRacerBestScore, current: TypeRacerBestScore): boolean {
  if (candidate.wpm !== current.wpm) {
    return candidate.wpm > current.wpm;
  }

  return candidate.accuracy > current.accuracy;
}

export function mergeTypeRacerScores(local: TypeRacerBestScores, remote: TypeRacerBestScores): TypeRacerBestScores {
  const merged: TypeRacerBestScores = { ...local };

  for (const mode of TYPE_RACER_MODES) {
    const remoteScore = remote[mode];
    const localScore = local[mode];

    if (!remoteScore) {
      continue;
    }

    if (!localScore || isTypeRacerScoreBetter(remoteScore, localScore)) {
      merged[mode] = remoteScore;
    }
  }

  return merged;
}

export function isPromptRunBestBetter(candidate: PromptRunBestRun, current: PromptRunBestRun): boolean {
  if (candidate.totalScore !== current.totalScore) {
    return candidate.totalScore > current.totalScore;
  }

  return candidate.completedRounds > current.completedRounds;
}

export function mergePromptRunBest(
  local: PromptRunBestRun | null,
  remote: PromptRunBestRun | null,
): PromptRunBestRun | null {
  if (!local) {
    return remote;
  }

  if (!remote) {
    return local;
  }

  return isPromptRunBestBetter(remote, local) ? remote : local;
}

export function mergeBreakoutScores(local: BreakoutBestScores, remote: BreakoutBestScores): BreakoutBestScores {
  const merged: BreakoutBestScores = { ...local };

  for (const mode of BREAKOUT_MODES) {
    const remoteScore = remote[mode];
    const localScore = local[mode];

    if (!remoteScore) {
      continue;
    }

    if (!localScore || isBreakoutScoreBetter(remoteScore, localScore)) {
      merged[mode] = remoteScore;
    }
  }

  return merged;
}

export function mergePlaygroundCloudScores(
  local: PlaygroundCloudScores,
  remote: PlaygroundCloudScores,
): PlaygroundCloudScores {
  return {
    typeRacer: mergeTypeRacerScores(local.typeRacer, remote.typeRacer),
    promptRun: mergePromptRunBest(local.promptRun, remote.promptRun),
    breakout: mergeBreakoutScores(local.breakout, remote.breakout),
  };
}
