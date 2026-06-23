import { afterEach, describe, expect, it } from "vitest";

import { checkGenerationRateLimit, resetGenerationRateLimits } from "@/lib/prompt-run/rate-limit";

describe("checkGenerationRateLimit", () => {
  afterEach(() => {
    resetGenerationRateLimits();
  });

  it("allows requests under the daily limit", () => {
    const first = checkGenerationRateLimit("guest:test", 3);
    const second = checkGenerationRateLimit("guest:test", 3);

    expect(first.allowed).toBe(true);
    expect(first.remaining).toBe(2);
    expect(second.allowed).toBe(true);
    expect(second.remaining).toBe(1);
  });

  it("blocks requests once the limit is reached", () => {
    checkGenerationRateLimit("guest:blocked", 2);
    checkGenerationRateLimit("guest:blocked", 2);
    const third = checkGenerationRateLimit("guest:blocked", 2);

    expect(third.allowed).toBe(false);
    expect(third.remaining).toBe(0);
  });

  it("tracks separate keys independently", () => {
    checkGenerationRateLimit("guest:a", 1);
    const blockedA = checkGenerationRateLimit("guest:a", 1);
    const allowedB = checkGenerationRateLimit("guest:b", 1);

    expect(blockedA.allowed).toBe(false);
    expect(allowedB.allowed).toBe(true);
  });
});
