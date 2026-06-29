import type { PromptRunBestRun } from "@/lib/prompt-run/storage";
import { createClient } from "@/lib/supabase/server";
import { hasSupabasePublicEnv } from "@/lib/supabase/env";
import type { TypeRacerMode } from "@/lib/type-racer/constants";
import type { TypeRacerBestScores } from "@/lib/type-racer/storage";
import type { PlaygroundCloudScores } from "@/lib/playground/merge-scores";

const TYPE_RACER_MODES_DB = ["words-30", "words-60", "sentence", "paragraph"] as const;

function isTypeRacerMode(value: string): value is TypeRacerMode {
  return (TYPE_RACER_MODES_DB as readonly string[]).includes(value);
}

export async function getUserPlaygroundScores(): Promise<{
  userId: string | null;
  scores: PlaygroundCloudScores;
}> {
  const empty: PlaygroundCloudScores = { typeRacer: {}, promptRun: null };

  if (!hasSupabasePublicEnv) {
    return { userId: null, scores: empty };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { userId: null, scores: empty };
  }

  const [typeRacerResult, promptRunResult] = await Promise.all([
    supabase.from("type_racer_best_scores").select("mode, wpm, accuracy, achieved_at").eq("user_id", user.id),
    supabase
      .from("prompt_run_best_runs")
      .select("total_score, completed_rounds, achieved_at")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  const typeRacer: TypeRacerBestScores = {};

  for (const row of typeRacerResult.data ?? []) {
    if (!isTypeRacerMode(row.mode)) {
      continue;
    }

    typeRacer[row.mode] = {
      wpm: row.wpm,
      accuracy: Number(row.accuracy),
      savedAt: row.achieved_at,
    };
  }

  let promptRun: PromptRunBestRun | null = null;

  if (promptRunResult.data) {
    promptRun = {
      totalScore: promptRunResult.data.total_score,
      completedRounds: promptRunResult.data.completed_rounds,
      savedAt: promptRunResult.data.achieved_at,
    };
  }

  return {
    userId: user.id,
    scores: { typeRacer, promptRun },
  };
}
