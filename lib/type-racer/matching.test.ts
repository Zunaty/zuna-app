import { describe, expect, it } from "vitest";

import { charsMatch, isStrictInputValid, promptsEqual } from "@/lib/type-racer/matching";

const caseSensitive = { caseSensitive: true };
const caseInsensitive = { caseSensitive: false };

describe("charsMatch", () => {
  it("matches case-insensitively when configured", () => {
    expect(charsMatch("H", "h", caseInsensitive)).toBe(true);
    expect(charsMatch("H", "h", caseSensitive)).toBe(false);
  });
});

describe("promptsEqual", () => {
  it("treats case differences as equal for words mode", () => {
    expect(promptsEqual("Hello World", "hello world", caseInsensitive)).toBe(true);
    expect(promptsEqual("Hello World", "hello world", caseSensitive)).toBe(false);
  });
});

describe("isStrictInputValid", () => {
  it("allows backspacing after a mistake", () => {
    expect(isStrictInputValid("abc", "ax", "a", caseSensitive)).toBe(true);
  });

  it("blocks new incorrect characters in strict mode", () => {
    expect(isStrictInputValid("abc", "a", "ax", caseSensitive)).toBe(false);
    expect(isStrictInputValid("abc", "a", "ab", caseSensitive)).toBe(true);
  });

  it("allows case-insensitive progress for words mode", () => {
    expect(isStrictInputValid("Hello", "H", "h", caseInsensitive)).toBe(true);
  });
});
