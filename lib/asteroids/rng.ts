/**
 * Pure, seedable RNG (mulberry32 step). State advances explicitly so game
 * updates stay deterministic and testable.
 */

export type RandomResult = {
  /** Uniform in [0, 1). */
  value: number;
  next: number;
};

export function nextRandom(state: number): RandomResult {
  const next = (state + 0x6d2b79f5) | 0;
  let t = Math.imul(next ^ (next >>> 15), 1 | next);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  const value = ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  return { value, next };
}

export function nextInt(state: number, maxExclusive: number): { value: number; next: number } {
  const { value, next } = nextRandom(state);
  return { value: Math.floor(value * maxExclusive), next };
}

export function createSeed(): number {
  return (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) | 0;
}
