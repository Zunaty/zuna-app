import { describe, expect, it } from "vitest";

import { getGeneratedImageFilename } from "@/lib/prompt-run/download-image";

describe("getGeneratedImageFilename", () => {
  it("uses the round number when available", () => {
    expect(getGeneratedImageFilename(3, 42)).toBe("prompt-run-round-3.jpeg");
  });

  it("falls back to seed when round number is missing", () => {
    expect(getGeneratedImageFilename(undefined, 42)).toBe("prompt-run-seed-42.jpeg");
  });

  it("uses a generic filename as the last fallback", () => {
    expect(getGeneratedImageFilename()).toBe("prompt-run.jpeg");
  });
});
