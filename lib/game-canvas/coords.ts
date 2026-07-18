/** Map a pointer clientX into internal canvas units, clamped to [0, internalWidth]. */
export function clientXToInternal(clientX: number, rectLeft: number, rectWidth: number, internalWidth: number): number {
  if (rectWidth === 0) {
    return 0;
  }

  const ratio = (clientX - rectLeft) / rectWidth;
  return Math.min(internalWidth, Math.max(0, ratio * internalWidth));
}
