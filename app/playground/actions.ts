"use server";

import { revalidatePath } from "next/cache";

import { BREAKOUT_MODES, type BreakoutMode } from "@/lib/breakout/constants";
import { isBreakoutScoreBetter, type BreakoutBestScore } from "@/lib/breakout/scoring";
import {
  isPromptRunBestBetter,
  isTypeRacerScoreBetter,
  mergePlaygroundCloudScores,
  type PlaygroundCloudScores,
} from "@/lib/playground/merge-scores";
import type { PromptRunBestRun } from "@/lib/prompt-run/storage";
import { createClient } from "@/lib/supabase/server";
import type { TypeRacerMode } from "@/lib/type-racer/constants";
import type { TypeRacerBestScore } from "@/lib/type-racer/storage";

const TYPE_RACER_MODES: TypeRacerMode[] = ["words-30", "words-60", "sentence", "paragraph"];

function isBreakoutMode(value: string): value is BreakoutMode {
  return (BREAKOUT_MODES as readonly string[]).includes(value);
}

export type PlaygroundScoreActionState = {
  error?: string;
};

function isTypeRacerMode(value: string): value is TypeRacerMode {
  return TYPE_RACER_MODES.includes(value as TypeRacerMode);
}

async function requireUserId(): Promise<{ userId: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Sign in to sync scores." };
  }

  return { userId: user.id };
}

export async function upsertTypeRacerBestScore(
  mode: TypeRacerMode,
  score: TypeRacerBestScore,
): Promise<PlaygroundScoreActionState> {
  const auth = await requireUserId();
  if ("error" in auth) {
    return { error: auth.error };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("type_racer_best_scores")
    .select("wpm, accuracy, achieved_at")
    .eq("user_id", auth.userId)
    .eq("mode", mode)
    .maybeSingle();

  if (existing) {
    const current: TypeRacerBestScore = {
      wpm: existing.wpm,
      accuracy: Number(existing.accuracy),
      savedAt: existing.achieved_at,
    };

    if (!isTypeRacerScoreBetter(score, current)) {
      return {};
    }
  }

  const { error } = await supabase.from("type_racer_best_scores").upsert(
    {
      user_id: auth.userId,
      mode,
      wpm: score.wpm,
      accuracy: score.accuracy,
      achieved_at: score.savedAt,
    },
    { onConflict: "user_id,mode" },
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/playground");
  return {};
}

export async function upsertPromptRunBestRun(best: PromptRunBestRun): Promise<PlaygroundScoreActionState> {
  const auth = await requireUserId();
  if ("error" in auth) {
    return { error: auth.error };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("prompt_run_best_runs")
    .select("total_score, completed_rounds, achieved_at")
    .eq("user_id", auth.userId)
    .maybeSingle();

  if (existing) {
    const current: PromptRunBestRun = {
      totalScore: existing.total_score,
      completedRounds: existing.completed_rounds,
      savedAt: existing.achieved_at,
    };

    if (!isPromptRunBestBetter(best, current)) {
      return {};
    }
  }

  const { error } = await supabase.from("prompt_run_best_runs").upsert(
    {
      user_id: auth.userId,
      total_score: best.totalScore,
      completed_rounds: best.completedRounds,
      achieved_at: best.savedAt,
    },
    { onConflict: "user_id" },
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/playground");
  return {};
}

export async function upsertBreakoutBestScore(
  mode: BreakoutMode,
  score: BreakoutBestScore,
): Promise<PlaygroundScoreActionState> {
  const auth = await requireUserId();
  if ("error" in auth) {
    return { error: auth.error };
  }

  const supabase = await createClient();
  const { data: existing } = await supabase
    .from("breakout_best_scores")
    .select("score, level, achieved_at")
    .eq("user_id", auth.userId)
    .eq("mode", mode)
    .maybeSingle();

  if (existing) {
    const current: BreakoutBestScore = {
      score: existing.score,
      level: existing.level,
      savedAt: existing.achieved_at,
    };

    if (!isBreakoutScoreBetter(score, current)) {
      return {};
    }
  }

  const { error } = await supabase.from("breakout_best_scores").upsert(
    {
      user_id: auth.userId,
      mode,
      score: score.score,
      level: score.level,
      achieved_at: score.savedAt,
    },
    { onConflict: "user_id,mode" },
  );

  if (error) {
    return { error: error.message };
  }

  revalidatePath("/playground");
  return {};
}

export async function syncPlaygroundScoresFromLocal(
  local: PlaygroundCloudScores,
): Promise<PlaygroundScoreActionState & { scores: PlaygroundCloudScores }> {
  const auth = await requireUserId();
  if ("error" in auth) {
    return { error: auth.error, scores: local };
  }

  const supabase = await createClient();

  const [typeRacerResult, promptRunResult, breakoutResult] = await Promise.all([
    supabase.from("type_racer_best_scores").select("mode, wpm, accuracy, achieved_at").eq("user_id", auth.userId),
    supabase
      .from("prompt_run_best_runs")
      .select("total_score, completed_rounds, achieved_at")
      .eq("user_id", auth.userId)
      .maybeSingle(),
    supabase.from("breakout_best_scores").select("mode, score, level, achieved_at").eq("user_id", auth.userId),
  ]);

  if (typeRacerResult.error) {
    return { error: typeRacerResult.error.message, scores: local };
  }

  if (promptRunResult.error) {
    return { error: promptRunResult.error.message, scores: local };
  }

  if (breakoutResult.error) {
    return { error: breakoutResult.error.message, scores: local };
  }

  const remote: PlaygroundCloudScores = { typeRacer: {}, promptRun: null, breakout: {} };

  for (const row of typeRacerResult.data ?? []) {
    if (!isTypeRacerMode(row.mode)) {
      continue;
    }

    remote.typeRacer[row.mode] = {
      wpm: row.wpm,
      accuracy: Number(row.accuracy),
      savedAt: row.achieved_at,
    };
  }

  if (promptRunResult.data) {
    remote.promptRun = {
      totalScore: promptRunResult.data.total_score,
      completedRounds: promptRunResult.data.completed_rounds,
      savedAt: promptRunResult.data.achieved_at,
    };
  }

  for (const row of breakoutResult.data ?? []) {
    if (!isBreakoutMode(row.mode)) {
      continue;
    }

    remote.breakout[row.mode] = {
      score: row.score,
      level: row.level,
      savedAt: row.achieved_at,
    };
  }

  const merged = mergePlaygroundCloudScores(local, remote);

  for (const mode of TYPE_RACER_MODES) {
    const score = merged.typeRacer[mode];
    if (!score) {
      continue;
    }

    const { error } = await supabase.from("type_racer_best_scores").upsert(
      {
        user_id: auth.userId,
        mode,
        wpm: score.wpm,
        accuracy: score.accuracy,
        achieved_at: score.savedAt,
      },
      { onConflict: "user_id,mode" },
    );

    if (error) {
      return { error: error.message, scores: merged };
    }
  }

  if (merged.promptRun) {
    const { error } = await supabase.from("prompt_run_best_runs").upsert(
      {
        user_id: auth.userId,
        total_score: merged.promptRun.totalScore,
        completed_rounds: merged.promptRun.completedRounds,
        achieved_at: merged.promptRun.savedAt,
      },
      { onConflict: "user_id" },
    );

    if (error) {
      return { error: error.message, scores: merged };
    }
  }

  for (const mode of BREAKOUT_MODES) {
    const score = merged.breakout[mode];
    if (!score) {
      continue;
    }

    const { error } = await supabase.from("breakout_best_scores").upsert(
      {
        user_id: auth.userId,
        mode,
        score: score.score,
        level: score.level,
        achieved_at: score.savedAt,
      },
      { onConflict: "user_id,mode" },
    );

    if (error) {
      return { error: error.message, scores: merged };
    }
  }

  revalidatePath("/playground");
  return { scores: merged };
}
