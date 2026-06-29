import { afterEach, describe, expect, it } from "vitest";

import {
  buildGenerationRateLimitKey,
  checkInMemoryGenerationRateLimit,
  hashGuestRateLimitIp,
  resetGenerationRateLimits,
} from "@/lib/prompt-run/rate-limit";

describe("checkInMemoryGenerationRateLimit", () => {
  afterEach(() => {
    resetGenerationRateLimits();
  });

  it("allows requests under the daily limit", () => {
    const first = checkInMemoryGenerationRateLimit("guest:test", 3);
    const second = checkInMemoryGenerationRateLimit("guest:test", 3);

    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(2);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(1);
  });

  it("blocks requests once the limit is reached", () => {
    checkInMemoryGenerationRateLimit("guest:blocked", 2);
    checkInMemoryGenerationRateLimit("guest:blocked", 2);
    const third = checkInMemoryGenerationRateLimit("guest:blocked", 2);

    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it("tracks separate keys independently", () => {
    checkInMemoryGenerationRateLimit("guest:a", 1);
    const blockedA = checkInMemoryGenerationRateLimit("guest:a", 1);
    const allowedB = checkInMemoryGenerationRateLimit("guest:b", 1);

    expect(blockedA.allowed).toBe(false);
    expect(allowedB.allowed).toBe(true);
  });
});

describe("buildGenerationRateLimitKey", () => {
  it("uses the authenticated user id when present", () => {
    expect(buildGenerationRateLimitKey("user-123", "203.0.113.1")).toBe("user-123");
  });

  it("hashes guest ips instead of storing them verbatim", () => {
    const key = buildGenerationRateLimitKey(null, "203.0.113.1");
    expect(key).toMatch(/^guest:[a-f0-9]{32}$/);
    expect(key).not.toContain("203.0.113.1");
    expect(hashGuestRateLimitIp("203.0.113.1")).toHaveLength(32);
  });
});
