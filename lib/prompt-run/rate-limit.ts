import { createHash } from "node:crypto";

import { canUseSupabaseRateLimit, checkSupabaseGenerationRateLimit } from "@/lib/prompt-run/rate-limit-supabase";

const DAY_MS = 24 * 60 * 60 * 1000;

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  limit: number;
  resetAt: number;
};

export function hashGuestRateLimitIp(ip: string): string {
  const salt = process.env.RATE_LIMIT_SALT ?? "zuna-prompt-run";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 32);
}

export function buildGenerationRateLimitKey(userId: string | null | undefined, ip: string): string {
  if (userId) {
    return userId;
  }
  return `guest:${hashGuestRateLimitIp(ip)}`;
}

export function checkInMemoryGenerationRateLimit(key: string, limit: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now >= existing.resetAt) {
    const resetAt = now + DAY_MS;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, limit, resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, limit, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return {
    allowed: true,
    remaining: limit - existing.count,
    limit,
    resetAt: existing.resetAt,
  };
}

export async function checkGenerationRateLimit(key: string, limit: number): Promise<RateLimitResult> {
  if (canUseSupabaseRateLimit()) {
    try {
      return await checkSupabaseGenerationRateLimit(key, limit);
    } catch (error) {
      console.error("[prompt-run] Supabase rate limit failed; using in-memory fallback", error);
    }
  }

  return checkInMemoryGenerationRateLimit(key, limit);
}

export function resetGenerationRateLimits(): void {
  buckets.clear();
}
