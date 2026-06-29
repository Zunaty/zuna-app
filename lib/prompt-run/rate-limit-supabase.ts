import { createAdminClient } from "@/lib/supabase/admin";

import type { RateLimitResult } from "@/lib/prompt-run/rate-limit";

export const PROMPT_RUN_GENERATION_SCOPE = "prompt_run_generation";
const DAY_SECONDS = 24 * 60 * 60;

export function canUseSupabaseRateLimit(): boolean {
  return createAdminClient() !== null;
}

export async function checkSupabaseGenerationRateLimit(
  bucketKey: string,
  limit: number,
  scope: string = PROMPT_RUN_GENERATION_SCOPE,
): Promise<RateLimitResult> {
  const client = createAdminClient();
  if (!client) {
    throw new Error("Supabase admin client is not configured.");
  }

  const { data, error } = await client.rpc("consume_rate_limit", {
    p_bucket_key: bucketKey,
    p_scope: scope,
    p_limit: limit,
    p_window_seconds: DAY_SECONDS,
  });

  if (error) {
    throw error;
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== "object") {
    throw new Error("Invalid rate limit response.");
  }

  const { allowed, remaining, limit_val, reset_at } = row as {
    allowed: boolean;
    remaining: number;
    limit_val: number;
    reset_at: string;
  };

  return {
    allowed,
    remaining,
    limit: limit_val,
    resetAt: new Date(reset_at).getTime(),
  };
}
